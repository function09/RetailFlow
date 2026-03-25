package addresses

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
)

type AddressInput struct {
	StreetLine1 string `json:"StreetLine1"`
	StreetLine2 string `json:"StreetLine2"`
	City        string `json:"City"`
	State       string `json:"State"`
	ZipCode     string `json:"ZipCode"`
	AddressType string `json:"AddressType"`
	IsDefault   bool   `json:"IsDefault"`
}

func GetCustomerAddressesHandler(store AddressStore) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		idString := req.PathValue("id")

		idInt, err := strconv.Atoi(idString)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		addresses, err := store.GetCustomerAddresses(req.Context(), idInt)

		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)

		json.NewEncoder(w).Encode(addresses)
	}
}

func GetCustomerAddressHandler(store AddressStore) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		idString := req.PathValue("id")

		idInt, err := strconv.Atoi(idString)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		address, err := store.GetCustomerAddress(req.Context(), idInt)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Address not found", http.StatusNotFound)
				return
			}

			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)

		json.NewEncoder(w).Encode(address)
	}
}

func AddCustomerAddressHandler(store AddressStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var addressInput *AddressInput

		if err := json.NewDecoder(r.Body).Decode(&addressInput); err != nil {
			http.Error(w, "Malformed JSON", http.StatusBadRequest)
			return
		}

		if addressInput.StreetLine1 == "" {
			http.Error(w, "StreetLine1 is required", http.StatusBadRequest)
			return
		}

		if addressInput.AddressType == "" {
			http.Error(w, "AddressType is required", http.StatusBadRequest)
			return

		}

		if addressInput.City == "" {
			http.Error(w, "City is required", http.StatusBadRequest)
			return
		}

		if addressInput.State == "" {
			http.Error(w, "State is required", http.StatusBadRequest)
			return
		}

		if addressInput.ZipCode == "" {
			http.Error(w, "ZipCode is required", http.StatusBadRequest)
			return
		}

		cidString := r.PathValue("id")
		cidInt, err := strconv.Atoi(cidString)

		if err != nil {
			http.Error(w, "invalid path value", http.StatusBadRequest)
			return
		}

		aid, err := store.AddCustomerAddress(r.Context(), &Address{StreetLine1: addressInput.StreetLine1, StreetLine2: addressInput.StreetLine2, City: addressInput.City, State: addressInput.State, ZipCode: addressInput.ZipCode, AddressType: addressInput.AddressType, IsDefault: addressInput.IsDefault, CustomerID: cidInt})

		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(aid)
	}
}

func RemoveCustomerAddressHandler(store AddressStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		aidString := r.PathValue("id")
		aidInt, err := strconv.Atoi(aidString)

		if err != nil {
			http.Error(w, "Invalid path value", http.StatusBadRequest)
			return
		}

		if err := store.RemoveCustomerAddress(r.Context(), aidInt); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Address not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}

}
