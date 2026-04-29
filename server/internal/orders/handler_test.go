package orders

import (
	"context"
	"database/sql"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"
)

type FakeStore struct {
	GetOrdersFn         func(ctx context.Context, limit int, offset int) ([]*Order, error)
	GetOrderFn          func(ctx context.Context, id int) (*Order, error)
	UpdateOrderStatusFn func(ctx context.Context, id int, status string) error
}

type FakeService struct {
	CreateOrderFn func(ctx context.Context, so SalesOrderInput) error
}

func (s *FakeStore) GetOrders(ctx context.Context, limit int, offset int) ([]*Order, error) {
	return s.GetOrdersFn(ctx, limit, offset)
}

func (s *FakeStore) GetOrder(ctx context.Context, id int) (*Order, error) {
	return s.GetOrderFn(ctx, id)
}

func (s *FakeStore) UpdateOrderStatus(ctx context.Context, id int, status string) error {
	return s.UpdateOrderStatusFn(ctx, id, status)
}

func (s *FakeService) CreateOrder(ctx context.Context, so SalesOrderInput) error {
	return s.CreateOrderFn(ctx, so)
}

func TestGetOrders(t *testing.T) {
	var tests = []struct {
		name  string
		store orderLister
		param string
		want  int
	}{
		{"Returns a list of orders", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return []*Order{{ID: 1, CustomerID: 1, Status: "pending", Fulfillment: "shipping"}, {ID: 2, CustomerID: 2, Status: "confirmed", Fulfillment: "pickup"}}, nil
		}}, "?limit=2&offset=0", 200},
		{"Returns an empty list of orders", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return []*Order{}, nil
		}}, "?limit=2&offset=0", 200},
		{"DB call fails", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return nil, errors.New("error DB call failed")
		}}, "?limit=2&offset=0", 500},
		{"Invalid limit parameter", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return []*Order{{ID: 1, CustomerID: 1, Status: "pending", Fulfillment: "shipping"}, {ID: 2, CustomerID: 2, Status: "confirmed", Fulfillment: "pickup"}}, nil
		}}, "?limit=abc&offset=0", 200},
		{"Invalid offset parameter", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return []*Order{{ID: 1, CustomerID: 1, Status: "pending", Fulfillment: "shipping"}}, nil
		}}, "?limit=2&offset=abc", 200},
		{"Missing limit parameter", &FakeStore{GetOrdersFn: func(ctx context.Context, limit, offset int) ([]*Order, error) {
			return []*Order{{ID: 1, CustomerID: 1, Status: "pending", Fulfillment: "shipping"}}, nil
		}}, "?limit=&offset=0", 200},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {

			req := httptest.NewRequest("GET", "/orders"+e.param, nil)
			w := httptest.NewRecorder()

			handler := GetOrdersHandler(e.store)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}
		})
	}
}

func TestCreateOrder(t *testing.T) {
	var tests = []struct {
		name    string
		service orderCreator
		body    string
		want    int
	}{
		{"Successfully creates an order", &FakeService{CreateOrderFn: func(ctx context.Context, so SalesOrderInput) error {
			return nil
		}}, `{"customer_id":1,"fulfillment":"shipping","order_items":[{"product_id":1,"quantity":2}]}`, 201},
		{"Service returns an error", &FakeService{CreateOrderFn: func(ctx context.Context, so SalesOrderInput) error {
			return errors.New("service error")
		}}, `{"customer_id":1,"fulfillment":"shipping","order_items":[{"product_id":1,"quantity":2}]}`, 500},
		{"Malformed JSON body", &FakeService{CreateOrderFn: func(ctx context.Context, so SalesOrderInput) error {
			return nil
		}}, `{invalid json}`, 400},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			body := strings.NewReader(e.body)
			req := httptest.NewRequest("POST", "/orders", body)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			handler := CreateOrderHandler(e.service)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}
		})
	}
}

func TestUpdateOrderStatus(t *testing.T) {
	var tests = []struct {
		name  string
		store orderStatusUpdater
		id    string
		body  string
		want  int
	}{
		{"Successfully updates order status", &FakeStore{UpdateOrderStatusFn: func(ctx context.Context, id int, status string) error {
			return nil
		}}, "1", `{"status":"confirmed"}`, 200},
		{"Order not found", &FakeStore{UpdateOrderStatusFn: func(ctx context.Context, id int, status string) error {
			return sql.ErrNoRows
		}}, "99", `{"status":"confirmed"}`, 404},
		{"DB call fails", &FakeStore{UpdateOrderStatusFn: func(ctx context.Context, id int, status string) error {
			return errors.New("db error")
		}}, "1", `{"status":"confirmed"}`, 500},
		{"Invalid order ID", &FakeStore{UpdateOrderStatusFn: func(ctx context.Context, id int, status string) error {
			return nil
		}}, "abc", `{"status":"confirmed"}`, 400},
		{"Malformed JSON body", &FakeStore{UpdateOrderStatusFn: func(ctx context.Context, id int, status string) error {
			return nil
		}}, "1", `{invalid}`, 400},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("PUT", "/orders/"+e.id+"/status", strings.NewReader(e.body))
			req.SetPathValue("id", e.id)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			handler := UpdateOrderStatusHandler(e.store)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}
		})
	}
}

func TestGetOrder(t *testing.T) {
	var tests = []struct {
		name  string
		store orderGetter
		id    string
		want  int
	}{
		{"Returns an order", &FakeStore{GetOrderFn: func(ctx context.Context, id int) (*Order, error) {
			return &Order{ID: 1, CustomerID: 1, Status: "pending", Fulfillment: "shipping"}, nil
		}}, "1", 200},
		{"Order not found", &FakeStore{GetOrderFn: func(ctx context.Context, id int) (*Order, error) {
			return nil, sql.ErrNoRows
		}}, "99", 404},
		{"DB call fails", &FakeStore{GetOrderFn: func(ctx context.Context, id int) (*Order, error) {
			return nil, errors.New("db error")
		}}, "1", 500},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/orders/"+e.id, nil)
			req.SetPathValue("id", e.id)
			w := httptest.NewRecorder()

			handler := GetOrderHandler(e.store)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}
		})
	}
}
