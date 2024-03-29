package server

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/3lvia/hn-config-lib-go/elvid"
	"github.com/3lvia/onetime-yopass/pkg/yopass"
	uuid "github.com/gofrs/uuid"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
)

// Server struct holding database and settings.
// This should be created with server.New
type Server struct {
	db                  Database
	maxLength           int
	registry            *prometheus.Registry
	forceOneTimeSecrets bool
}

// New is the main way of creating the server.
func New(db Database, maxLength int, r *prometheus.Registry, forceOneTimeSecrets bool) Server {
	return Server{
		db:                  db,
		maxLength:           maxLength,
		registry:            r,
		forceOneTimeSecrets: forceOneTimeSecrets,
	}
}

// createSecret creates secret
func (y *Server) createSecret(w http.ResponseWriter, request *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	decoder := json.NewDecoder(request.Body)
	var s yopass.Secret
	if err := decoder.Decode(&s); err != nil {
		http.Error(w, `{"message": "Unable to parse JSON data."}`, http.StatusBadRequest)
		return
	}

	if !validExpiration(s.Expiration) {
		http.Error(w, `{"message": "Invalid expiration specified."}`, http.StatusBadRequest)
		return
	}

	if !s.OneTime && y.forceOneTimeSecrets {
		http.Error(w, `{"message": "Secret must be one time download."}`, http.StatusBadRequest)
		return
	}

	if len(s.AccessToken) == 0 {
		http.Error(w, `{"message": "Secret must be created with an access token."}`, http.StatusUnauthorized)
		return
	}

	// Validate access token with ElvID issuer.
	elvid, err := elvid.New()
	if err != nil {
		log.Fatal(err)
	}

	// Ensure that token is valid and not expired.
	isValidAccessToken, err := elvid.HasValidUserClientAccessToken(s.AccessToken)
	if err != nil || isValidAccessToken == false {
		http.Error(w, `{"message": "The current access token expired or invalid. Please refresh the page (or sign-in again) to try again."}`, http.StatusUnauthorized)
		return
	} else {
		log.Println("The provided access token is valid.")
	}

	if len(s.Message) > y.maxLength {
		http.Error(w, `{"message": "The encrypted message is too long."}`, http.StatusBadRequest)
		return
	}

	// Generate new UUID
	uuidVal, err := uuid.NewV4()
	if err != nil {
		http.Error(w, `{"message": "Unable to generate UUID."}`, http.StatusInternalServerError)
		return
	}
	key := uuidVal.String()

	// store secret in memcache with specified expiration.
	if err := y.db.Put(request.Context(), key, s); err != nil {
		http.Error(w, `{"message": "Failed to store secret in database."}`, http.StatusInternalServerError)
		return
	}

	resp := map[string]string{"message": key}
	jsonData, _ := json.Marshal(resp)
	w.Write(jsonData)
}

// getSecret from database
func (y *Server) getSecret(w http.ResponseWriter, request *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	secret, err := y.db.Get(request.Context(), mux.Vars(request)["key"])
	if err != nil {
		http.Error(w, `{"message": "Secret not found."}`, http.StatusNotFound)
		return
	}

	data, err := secret.ToJSON()
	if err != nil {
		http.Error(w, `{"message": "Failed to encode secret."}`, http.StatusInternalServerError)
		return
	}
	w.Write(data)
}

// HTTPHandler containing all routes
func (y *Server) HTTPHandler() http.Handler {
	mx := mux.NewRouter()
	mx.Use(newMetricsMiddleware(y.registry))
	mx.HandleFunc("/secret/"+keyParameter, y.getSecret)
	mx.HandleFunc("/secret", y.createSecret).Methods("POST")
	mx.HandleFunc("/file", y.createSecret).Methods("POST")
	mx.HandleFunc("/file/"+keyParameter, y.getSecret)
	mx.PathPrefix("/").Handler(http.FileServer(http.Dir("public")))
	return handlers.LoggingHandler(os.Stdout, SecurityHeadersHandler(mx))
}

const keyParameter = "{key:(?:[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})}"

// validExpiration validates that expiration is either
// 3600(1hour), 86400(1day) or 604800(1week)
func validExpiration(expiration int32) bool {
	for _, ttl := range []int32{3600, 86400, 604800} {
		if ttl == expiration {
			return true
		}
	}
	return false
}

// SecurityHeadersHandler returns a middleware which sets common security
// HTTP headers on the response to mitigate common web vulnerabilities.
func SecurityHeadersHandler(next http.Handler) http.Handler {
	csp := []string{
		"default-src 'self' https://cdn.elvia.io https://elvid.test-elvia.io https://elvid.elvia.io",
		"font-src https://fonts.gstatic.com",
		"form-action 'self'",
		"frame-ancestors 'self'",
		"script-src 'self' 'unsafe-inline' https://storage.googleapis.com https://cdn.elvia.io",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.elvia.io",
		"frame-src 'self' https://elvid.test-elvia.io https://elvid.elvia.io",
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-security-policy", strings.Join(csp, "; "))
		w.Header().Set("referrer-policy", "no-referrer")
		w.Header().Set("x-content-type-options", "nosniff")
		w.Header().Set("x-frame-options", "DENY")
		w.Header().Set("x-xss-protection", "1; mode=block")
		if r.URL.Scheme == "https" || r.Header.Get("X-Forwarded-Proto") == "https" {
			w.Header().Set("strict-transport-security", "max-age=31536000")
		}
		next.ServeHTTP(w, r)
	})
}

// newMetricsHandler creates a middleware handler recording all HTTP requests in
// the given Prometheus registry
func newMetricsMiddleware(reg prometheus.Registerer) func(http.Handler) http.Handler {
	requests := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "yopass_http_requests_total",
			Help: "Total number of requests served by HTTP method, path and response code.",
		},
		[]string{"method", "path", "code"},
	)
	reg.MustRegister(requests)

	duration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "yopass_http_request_duration_seconds",
			Help:    "Histogram of HTTP request latencies by method and path.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
	reg.MustRegister(duration)

	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rec := statusCodeRecorder{ResponseWriter: w, statusCode: http.StatusOK}
			handler.ServeHTTP(&rec, r)
			path := normalizedPath(r)
			requests.WithLabelValues(r.Method, path, strconv.Itoa(rec.statusCode)).Inc()
			duration.WithLabelValues(r.Method, path).Observe(time.Since(start).Seconds())
		})
	}
}

// normlizedPath returns a normalized mux path template representation
func normalizedPath(r *http.Request) string {
	if route := mux.CurrentRoute(r); route != nil {
		if tmpl, err := route.GetPathTemplate(); err == nil {
			return strings.ReplaceAll(tmpl, keyParameter, ":key")
		}
	}
	return "<other>"
}

// statusCodeRecorder is a HTTP ResponseWriter recording the response code
type statusCodeRecorder struct {
	http.ResponseWriter
	statusCode int
}

// WriteHeader implements http.ResponseWriter
func (rw *statusCodeRecorder) WriteHeader(code int) {
	rw.ResponseWriter.WriteHeader(code)
	rw.statusCode = code
}
