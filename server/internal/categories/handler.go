package categories

import (
	"encoding/json"
	"net/http"
)

type CategoriesInput struct {
	Category string `json:"category"`
}

func GetAllCategoriesHandler(store CategoriesStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		products, err := store.GetAllCategories(r.Context())

		if err != nil {
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(products)
	}

}
