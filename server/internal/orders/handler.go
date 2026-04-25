package orders

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
)

type orderLister interface {
	GetOrders(ctx context.Context, limit int, offset int) ([]*Order, error)
}

type orderGetter interface {
	GetOrder(ctx context.Context, id int) (*Order, error)
}

type orderCreator interface {
	CreateOrder(ctx context.Context, so SalesOrderInput) error
}

func GetOrdersHandler(store orderLister) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limitString := r.URL.Query().Get("limit")
		offsetString := r.URL.Query().Get("offset")

		limitInt, err := strconv.Atoi(limitString)

		if err != nil || limitInt <= 0 {
			limitInt = 20
		}

		offsetInt, err := strconv.Atoi(offsetString)

		if err != nil {
			offsetInt = 0
		}

		orders, err := store.GetOrders(r.Context(), limitInt, offsetInt)

		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(orders); err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func GetOrderHandler(store orderGetter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")

		idInt, err := strconv.Atoi(id)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		order, err := store.GetOrder(r.Context(), idInt)

		if err != nil {

			if err == sql.ErrNoRows {
				http.Error(w, "Order not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(order); err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func CreateOrderHandler(store orderCreator) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var salesOrder SalesOrderInput

		if err := json.NewDecoder(r.Body).Decode(&salesOrder); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		if err := store.CreateOrder(r.Context(), salesOrder); err != nil {
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}

}
