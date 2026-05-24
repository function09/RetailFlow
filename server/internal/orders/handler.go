package orders

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
)

type orderLister interface {
	GetOrders(ctx context.Context, limit int, offset int, search string) ([]*Order, error)
}

type orderGetter interface {
	GetOrder(ctx context.Context, id int) (*Order, error)
}

type orderCreator interface {
	CreateOrder(ctx context.Context, so SalesOrderInput) (int, error)
}

type orderStatusUpdater interface {
	UpdateOrderStatus(ctx context.Context, id int, status string) error
}

type orderDetailsGetter interface {
	GetOrderDetails(ctx context.Context, id int) (*OrderDetails, error)
}

func GetOrdersHandler(store orderLister) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limitString := r.URL.Query().Get("limit")
		offsetString := r.URL.Query().Get("offset")
		searchString := r.URL.Query().Get("search")

		limitInt, err := strconv.Atoi(limitString)

		if err != nil || limitInt <= 0 {
			limitInt = 20
		}

		offsetInt, err := strconv.Atoi(offsetString)

		if err != nil {
			offsetInt = 0
		}

		orders, err := store.GetOrders(r.Context(), limitInt, offsetInt, searchString)

		if err != nil {
			slog.Error("failed to get orders", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(orders); err != nil {
			slog.Error("failed to encode orders response", "error", err)
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
			slog.Error("failed to get order", "id", idInt, "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(order); err != nil {
			slog.Error("failed to encode order response", "error", err)
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

		id, err := store.CreateOrder(r.Context(), salesOrder)
		if err != nil {
			slog.Error("failed to create order", "error", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(struct {
			ID int `json:"ID"`
		}{ID: id})
	}
}

func GetOrderDetailsHandler(service orderDetailsGetter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")

		idInt, err := strconv.Atoi(id)

		if err != nil {
			http.Error(w, "invalid path value", http.StatusBadRequest)
			return
		}

		orderDetails, err := service.GetOrderDetails(r.Context(), idInt)

		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				http.Error(w, "order not found", http.StatusNotFound)
				return
			}
			slog.Error("failed to get order details", "id", idInt, "error", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(orderDetails); err != nil {
			slog.Error("failed to encode order details response", "error", err)
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func UpdateOrderStatusHandler(store orderStatusUpdater) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input struct {
			Status string `json:"status"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		id := r.PathValue("id")
		idInt, err := strconv.Atoi(id)

		if err != nil {
			http.Error(w, "invalid path value", http.StatusBadRequest)
			return
		}

		if err := store.UpdateOrderStatus(r.Context(), idInt, input.Status); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "order not found", http.StatusNotFound)
				return
			}
			slog.Error("failed to update order status", "id", idInt, "error", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
	}
}
