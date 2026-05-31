package categories

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type CategoriesInput struct {
	Category string `json:"category"`
}

func CreateCategoryHandler(store CategoriesStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input CategoriesInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		if input.Category == "" {
			http.Error(w, "category name is required", http.StatusBadRequest)
			return
		}

		cat, err := store.CreateCategory(r.Context(), input.Category)
		if err != nil {
			slog.Error("failed to create category", "error", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(cat)
	}
}

func GetAllCategoriesHandler(store CategoriesStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		products, err := store.GetAllCategories(r.Context())

		if err != nil {
			slog.Error("failed to get categories", "error", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(products)
	}

}
