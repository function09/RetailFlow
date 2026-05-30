package metrics

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"
)

type FakeStore struct {
	GetAllMetricsFn func(ctx context.Context) (*Metrics, error)
}

func (s *FakeStore) GetAllMetrics(ctx context.Context) (*Metrics, error) {
	return s.GetAllMetricsFn(ctx)
}

func TestGetAllMetrics(t *testing.T) {
	var tests = []struct {
		name  string
		store MetricsStore
		want  int
	}{
		{
			"Returns metrics successfully",
			&FakeStore{GetAllMetricsFn: func(ctx context.Context) (*Metrics, error) {
				return &Metrics{
					TotalRevenue:   100000,
					OrdersByStatus: map[string]int{"pending": 5, "confirmed": 3},
					TopProducts:    []*TopProduct{{Name: "Widget", TotalSold: 42}},
				}, nil
			}},
			200,
		},
		{
			"DB call fails",
			&FakeStore{GetAllMetricsFn: func(ctx context.Context) (*Metrics, error) {
				return nil, errors.New("db error")
			}},
			500,
		},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/metrics", nil)
			w := httptest.NewRecorder()

			handler := GetAllMetricsHandler(e.store)
			handler.ServeHTTP(w, req)

			if w.Code != e.want {
				t.Errorf("got %d, want %d", w.Code, e.want)
			}
		})
	}
}
