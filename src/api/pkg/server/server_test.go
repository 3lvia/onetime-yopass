package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/3lvia/onetime-yopass/pkg/yopass"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
)

type mockDB struct{}

func (db *mockDB) Get(context context.Context, key string) (yopass.Secret, error) {
	return yopass.Secret{Message: `***ENCRYPTED***`}, nil
}
func (db *mockDB) Put(context context.Context, key string, secret yopass.Secret) error {
	return nil
}
func (db *mockDB) Delete(context context.Context, key string) error {
	return nil
}

type brokenDB struct{}

func (db *brokenDB) Get(context context.Context, key string) (yopass.Secret, error) {
	return yopass.Secret{}, fmt.Errorf("Some error")
}
func (db *brokenDB) Put(context context.Context, key string, secret yopass.Secret) error {
	return fmt.Errorf("Some error")
}
func (db *brokenDB) Delete(context context.Context, key string) error {
	return fmt.Errorf("Some error")
}

type mockBrokenDB2 struct{}

func (db *mockBrokenDB2) Get(key string) (yopass.Secret, error) {
	return yopass.Secret{OneTime: true, Message: "encrypted"}, nil
}
func (db *mockBrokenDB2) Put(key string, secret yopass.Secret) error {
	return fmt.Errorf("Some error")
}
func (db *mockBrokenDB2) Delete(key string) error {
	return fmt.Errorf("Some error")
}

func TestCreateSecret(t *testing.T) {
	tt := []struct {
		name       string
		statusCode int
		body       io.Reader
		output     string
		db         Database
		maxLength  int
	}{
		{
			name:       "InvalidRequestWithoutAccessToken", // failed as expected without access token
			statusCode: 401,
			body:       strings.NewReader(`{"message": "hello world", "expiration": 3600}`),
			output:     "",
			db:         &mockDB{},
			maxLength:  100,
		},
		{
			name:       "InvalidJson",
			statusCode: 400,
			body:       strings.NewReader(`{fooo`),
			output:     "Unable to parse JSON data.",
			db:         &mockDB{},
		},
		{
			name:       "MessageTooLong",
			statusCode: 401,
			body:       strings.NewReader(`{"expiration": 3600, "message": "wooop"}`),
			output:     "Secret must be created with an access token.",
			db:         &mockDB{},
			maxLength:  1,
			// output:     "The encrypted message is too long.",
		},
		{
			name:       "InvalidExpiration",
			statusCode: 400,
			body:       strings.NewReader(`{"expiration": 10, "message": "foo"}`),
			output:     "Invalid expiration specified.",
			db:         &mockDB{},
			// output:     "Invalid expiration specified.",
		},
		{
			name:       "BrokenDatabase",
			statusCode: 401,
			body:       strings.NewReader(`{"expiration": 3600, "message": "foo"}`),
			output:     "Secret must be created with an access token.",
			db:         &brokenDB{},
			maxLength:  100,
			// output:     "Failed to store secret in database.",
		},
	}

	for _, tc := range tt {
		t.Run(fmt.Sprintf(tc.name), func(t *testing.T) {
			req, _ := http.NewRequest("POST", "/secret", tc.body)
			rr := httptest.NewRecorder()
			y := New(tc.db, tc.maxLength, prometheus.NewRegistry(), false)
			y.createSecret(rr, req)
			var s yopass.Secret
			json.Unmarshal(rr.Body.Bytes(), &s)
			if tc.output != "" {
				if s.Message != tc.output {
					t.Fatalf(`Expected body "%s"; got "%s"`, tc.output, s.Message)
				}
			}
			if rr.Code != tc.statusCode {
				t.Fatalf(`Expected status code %d; got "%d"`, tc.statusCode, rr.Code)
			}
		})
	}
}

func TestOneTimeEnforcement(t *testing.T) {
	tt := []struct {
		name           string
		statusCode     int
		body           io.Reader
		output         string
		requireOneTime bool
	}{
		{
			name:           "OneTimeRrequestWithoutAccessToken",
			statusCode:     401,
			body:           strings.NewReader(`{"message": "hello world", "expiration": 3600, "one_time": true}`),
			output:         "",
			requireOneTime: true,
		},
		{
			name:           "NonOneTimeRequest",
			statusCode:     400,
			body:           strings.NewReader(`{"message": "hello world", "expiration": 3600, "one_time": false}`),
			output:         "Secret must be one time download.",
			requireOneTime: true,
		},
		{
			name:           "MissingOneTimePayloadFlag",
			statusCode:     400,
			body:           strings.NewReader(`{"message": "hello world", "expiration": 3600}`),
			output:         "Secret must be one time download.",
			requireOneTime: true,
		},
		{
			name:           "DisableOneTime",
			statusCode:     401,
			body:           strings.NewReader(`{"message": "hello world", "expiration": 3600, "one_time": false}`),
			output:         "",
			requireOneTime: false,
		},
	}
	for _, tc := range tt {
		t.Run(fmt.Sprintf(tc.name), func(t *testing.T) {
			req, _ := http.NewRequest("POST", "/secret", tc.body)
			rr := httptest.NewRecorder()
			y := New(&mockDB{}, 100, prometheus.NewRegistry(), tc.requireOneTime)
			y.createSecret(rr, req)
			var s yopass.Secret
			json.Unmarshal(rr.Body.Bytes(), &s)
			if tc.output != "" {
				if s.Message != tc.output {
					t.Fatalf(`Expected body "%s"; got "%s"`, tc.output, s.Message)
				}
			}
			if rr.Code != tc.statusCode {
				t.Fatalf(`Expected status code %d; got "%d"`, tc.statusCode, rr.Code)
			}
		})
	}

}
func TestGetSecret(t *testing.T) {
	tt := []struct {
		name       string
		statusCode int
		output     string
		db         Database
	}{
		{
			name:       "GetSecret",
			statusCode: 200,
			output:     "***ENCRYPTED***",
			db:         &mockDB{},
		},
		{
			name:       "SecretNotFound",
			statusCode: 404,
			output:     "Secret not found.",
			db:         &brokenDB{},
		},
	}

	for _, tc := range tt {
		t.Run(fmt.Sprintf(tc.name), func(t *testing.T) {
			req, err := http.NewRequest("GET", "/secret/foo", nil)
			if err != nil {
				t.Fatal(err)
			}
			rr := httptest.NewRecorder()
			y := New(tc.db, 1, prometheus.NewRegistry(), false)
			y.getSecret(rr, req)
			var s yopass.Secret
			json.Unmarshal(rr.Body.Bytes(), &s)
			if s.Message != tc.output {
				t.Fatalf(`Expected body "%s"; got "%s"`, tc.output, s.Message)
			}
			if rr.Code != tc.statusCode {
				t.Fatalf(`Expected status code %d; got "%d"`, tc.statusCode, rr.Code)
			}
		})
	}
}

func TestMetrics(t *testing.T) {
	requests := []struct {
		method string
		path   string
	}{
		{
			method: "GET",
			path:   "/secret/ebfa0c88-7610-4d3f-856a-c8810a44361c",
		},
		{
			method: "GET",
			path:   "/secret/invalid-key-format",
		},
	}
	y := New(&mockDB{}, 1, prometheus.NewRegistry(), false)
	h := y.HTTPHandler()

	for _, r := range requests {
		req, err := http.NewRequest(r.method, r.path, nil)
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()
		h.ServeHTTP(rr, req)
	}

	metrics := []string{"yopass_http_requests_total", "yopass_http_request_duration_seconds"}
	n, err := testutil.GatherAndCount(y.registry, metrics...)
	if err != nil {
		t.Fatal(err)
	}
	if expected := len(metrics); n != expected {
		t.Fatalf(`Expected %d recorded metrics; got %d`, expected, n)
	}

	// Note: A secret with an invalid key won't be served by the getSecret handler
	// at this point as it doens't match the path template.
	output := `
# HELP yopass_http_requests_total Total number of requests served by HTTP method, path and response code.
# TYPE yopass_http_requests_total counter
yopass_http_requests_total{code="200",method="GET",path="/secret/:key"} 2
`
	err = testutil.GatherAndCompare(y.registry, strings.NewReader(output), "yopass_http_requests_total")
	if err != nil {
		t.Fatal(err)
	}

	warnings, err := testutil.GatherAndLint(y.registry)
	if err != nil {
		t.Fatal(err)
	}
	if len(warnings) != 0 {
		t.Fatalf(`Expected no metric linter warnings; got %d`, len(warnings))
	}
}

func TestSecurityHeaders(t *testing.T) {
	tt := []struct {
		scheme       string
		headers      map[string]string
		unsetHeaders []string
	}{
		{
			scheme: "http",
			headers: map[string]string{
				"content-security-policy": "default-src 'self' https://cdn.elvia.io https://elvid.test-elvia.io https://elvid.elvia.io; font-src https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https://storage.googleapis.com https://cdn.elvia.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.elvia.io; frame-src 'self' https://elvid.test-elvia.io https://elvid.elvia.io",
				"referrer-policy":         "no-referrer",
				"x-content-type-options":  "nosniff",
				"x-frame-options":         "DENY",
				"x-xss-protection":        "1; mode=block",
			},
			unsetHeaders: []string{"strict-transport-security"},
		},
		{
			scheme: "https",
			headers: map[string]string{
				"content-security-policy":   "default-src 'self' https://cdn.elvia.io https://elvid.test-elvia.io https://elvid.elvia.io; font-src https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https://storage.googleapis.com https://cdn.elvia.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.elvia.io; frame-src 'self' https://elvid.test-elvia.io https://elvid.elvia.io",
				"referrer-policy":           "no-referrer",
				"strict-transport-security": "max-age=31536000",
				"x-content-type-options":    "nosniff",
				"x-frame-options":           "DENY",
				"x-xss-protection":          "1; mode=block",
			},
		},
	}

	y := New(&mockDB{}, 1, prometheus.NewRegistry(), false)
	h := y.HTTPHandler()

	t.Parallel()
	for _, test := range tt {
		t.Run("scheme="+test.scheme, func(t *testing.T) {
			req, err := http.NewRequest("GET", "/", nil)
			if err != nil {
				t.Fatal(err)
			}
			req.Header.Set("X-Forwarded-Proto", test.scheme)
			rr := httptest.NewRecorder()
			h.ServeHTTP(rr, req)

			for header, value := range test.headers {
				if got := rr.Header().Get(header); got != value {
					t.Errorf("Expected HTTP header %s to be %q, got %q", header, value, got)
				}
			}

			for _, header := range test.unsetHeaders {
				if got := rr.Header().Get(header); got != "" {
					t.Errorf("Expected HTTP header %s to not be set, got %q", header, got)
				}
			}
		})
	}
}
