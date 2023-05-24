package server

import (
	"context"
	"encoding/json"

	"github.com/bradfitz/gomemcache/memcache"
	"github.com/3lvia/onetime-yopass/pkg/yopass"
)

// NewMemcached returns a new memcached database client
func NewMemcached(server string) Database {
	return &Memcached{memcache.New(server)}
}

// Memcached client
type Memcached struct {
	Client *memcache.Client
}

// Get key in memcached
func (m *Memcached) Get(ctx context.Context, key string) (yopass.Secret, error) {
	var s yopass.Secret

	r, err := m.Client.Get(key)
	if err != nil {
		return s, err
	}

	if err := json.Unmarshal(r.Value, &s); err != nil {
		return s, err
	}

	if s.OneTime {
		if err := m.Delete(ctx, key); err != nil {
			return s, err
		}
	}

	return s, nil
}

// Put key in Memcached
func (m *Memcached) Put(ctx context.Context, key string, secret yopass.Secret) error {
	data, err := secret.ToJSON()
	if err != nil {
		return err
	}

	return m.Client.Set(&memcache.Item{
		Key:        key,
		Value:      data,
		Expiration: secret.Expiration})
}

// Delete key from memcached
func (m Memcached) Delete(ctx context.Context, key string) (bool, error) {
	err := m.Client.Delete(key)

	if err == memcache.ErrCacheMiss {
		return false, nil
	}

	return err == nil, err
}
