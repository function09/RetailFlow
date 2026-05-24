package customers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/mail"
	"strconv"

	"github.com/function09/order_management_system/server/internal/orders"
)

type CustomerInput struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	IsActive  bool   `json:"isActive"`
}

type CustomerOrderGetter interface {
	GetOrdersByCustomerID(ctx context.Context, cid int) ([]*orders.Order, error)
}

func GetAllCustomersHandler(store CustomerStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limitString := r.URL.Query().Get("limit")
		offsetString := r.URL.Query().Get("offset")

		limitInt, err := strconv.Atoi(limitString)

		if err != nil || limitInt <= 0 {
			limitInt = 20
		}

		offsetInt, err := strconv.Atoi(offsetString)

		if err != nil || offsetInt <= 0 {
			offsetInt = 0
		}

		search := r.URL.Query().Get("search")
		sort := r.URL.Query().Get("sort")
		order := r.URL.Query().Get("order")

		customers, err := store.GetAllCustomers(r.Context(), limitInt, offsetInt, search, sort, order)

		if err != nil {
			slog.Error("Failed to get all customers", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(customers)

	}
}

func GetCustomerHandler(store CustomerStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := r.PathValue("id")
		pathValueInt, err := strconv.Atoi(path)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		customer, err := store.GetCustomer(r.Context(), pathValueInt)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Customer not found", http.StatusNotFound)
				return
			}
			slog.Error("Failed to get customer", "id", pathValueInt, "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(customer)
	}
}

func GetCustomerOrdersHandler(store CustomerOrderGetter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := r.PathValue("id")
		pathValueInt, err := strconv.Atoi(path)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		orders, err := store.GetOrdersByCustomerID(r.Context(), pathValueInt)

		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				http.Error(w, "customer not found", http.StatusNotFound)
				return
			}
			slog.Error("Failed to get customer orders", "id", pathValueInt, "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(orders)
	}
}

func CreateCustomerHandler(store CustomerStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var customer *CustomerInput

		if err := json.NewDecoder(r.Body).Decode(&customer); err != nil {
			http.Error(w, "Malformed  JSON", http.StatusBadRequest)
			return
		}

		if customer.Email == "" {
			http.Error(w, "No email provided", http.StatusBadRequest)
			return
		}

		e, err := mail.ParseAddress(customer.Email)

		if err != nil {
			http.Error(w, "Invalid email format", http.StatusBadRequest)
			return
		}
		id, err := store.CreateCustomer(r.Context(), &Customer{FirstName: customer.FirstName, LastName: customer.LastName, Email: e.Address})

		if err != nil {
			slog.Error("Failed to create customer", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(id)
	}
}
func UpdateCustomerHandler(store CustomerStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var customer *CustomerInput

		if err := json.NewDecoder(r.Body).Decode(&customer); err != nil {
			http.Error(w, "Malformed  JSON", http.StatusBadRequest)
			return
		}

		pathValue := r.PathValue("id")
		pathValueInt, err := strconv.Atoi(pathValue)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		if customer.Email == "" {
			http.Error(w, "No email provided", http.StatusBadRequest)
			return
		}

		e, err := mail.ParseAddress(customer.Email)

		if err != nil {
			http.Error(w, "Invalid email format", http.StatusBadRequest)
			return
		}

		if err := store.UpdateCustomer(r.Context(), &Customer{ID: pathValueInt, FirstName: customer.FirstName, LastName: customer.LastName, Email: e.Address}); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Customer not found", http.StatusNotFound)
				return
			}
			slog.Error("Failed to update customer", "id", pathValueInt, "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func RemoveCustomerHandler(store CustomerStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		pathValue := r.PathValue("id")
		pathValueInt, err := strconv.Atoi(pathValue)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}
		if err := store.RemoveCustomer(r.Context(), pathValueInt); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Customer not found", http.StatusNotFound)
				return
			}
			slog.Error("Failed to deactivate customer", "id", pathValueInt, "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
