package categories

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"
)

type FakeStore struct {
	GetAllCategoriesFn func(ctx context.Context) ([]*Categories, error)
}

func (s *FakeStore) GetAllCategories(ctx context.Context) ([]*Categories, error) {
	return s.GetAllCategoriesFn(ctx)
}

func TestGetAllCategories(t *testing.T) {
	var tests = []struct {
		name  string
		store CategoriesStore
		want  int
	}{
		{"Returns a list of categories", &FakeStore{GetAllCategoriesFn: func(ctx context.Context) ([]*Categories, error) {
			return []*Categories{{ID: 1, Category: "Beverages"}, {ID: 2, Category: "Snacks"}}, nil
		}}, 200},
		{"Returns an empty list of categories", &FakeStore{GetAllCategoriesFn: func(ctx context.Context) ([]*Categories, error) {
			return []*Categories{}, nil
		}}, 200},
		{"DB call fails", &FakeStore{GetAllCategoriesFn: func(ctx context.Context) ([]*Categories, error) {
			return nil, errors.New("db error")
		}}, 500},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/categories", nil)
			w := httptest.NewRecorder()

			handler := GetAllCategoriesHandler(e.store)
			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d, want %d", w.Code, e.want)
			}
		})
	}
}
