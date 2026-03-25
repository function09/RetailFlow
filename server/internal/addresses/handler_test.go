package addresses

import (
	"context"
	"database/sql"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"
)

type FakeStore struct {
	GetCustomerAddressesFn  func(ctx context.Context, cid int) ([]*Address, error)
	GetCustomerAddressFn    func(ctx context.Context, aid int) (*Address, error)
	AddCustomerAddressFn    func(ctx context.Context, address *Address) (int, error)
	RemoveCustomerAddressFn func(ctx context.Context, aid int) error
}

func (s *FakeStore) GetCustomerAddresses(ctx context.Context, cid int) ([]*Address, error) {
	return s.GetCustomerAddressesFn(ctx, cid)
}

func (s *FakeStore) GetCustomerAddress(ctx context.Context, aid int) (*Address, error) {
	return s.GetCustomerAddressFn(ctx, aid)
}

func (s *FakeStore) AddCustomerAddress(ctx context.Context, address *Address) (int, error) {
	return s.AddCustomerAddressFn(ctx, address)
}

func (s *FakeStore) RemoveCustomerAddress(ctx context.Context, aid int) error {
	return s.RemoveCustomerAddressFn(ctx, aid)
}

func TestGetCustomerAddresses(t *testing.T) {
	var tests = []struct {
		name  string
		store AddressStore
		param string
		want  int
	}{
		{"Returns a list of customer addresses", &FakeStore{GetCustomerAddressesFn: func(ctx context.Context, cid int) ([]*Address, error) {
			return []*Address{{ID: 1, StreetLine1: "123 Street", StreetLine2: "", City: "Los Angeles", State: "CA", ZipCode: "90001", AddressType: "shipping", IsDefault: true, CustomerID: 1},
				{ID: 2, StreetLine1: "321 Street", StreetLine2: "Apt 12", City: "Los Angeles", State: "CA", ZipCode: "90001", AddressType: "billing", IsDefault: false, CustomerID: 1}}, nil
		}}, "1", 200},
		{"Returns no addresses", &FakeStore{GetCustomerAddressesFn: func(ctx context.Context, cid int) ([]*Address, error) {
			return []*Address{}, nil
		}}, "2", 200},
		{"Invalid ID", &FakeStore{GetCustomerAddressesFn: func(ctx context.Context, cid int) ([]*Address, error) {
			return []*Address{}, nil
		}}, "abc", 400},
		{"DB error", &FakeStore{GetCustomerAddressesFn: func(ctx context.Context, cid int) ([]*Address, error) {
			return nil, errors.New("internal server error")
		}}, "1", 500},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/customer/{id}", nil)
			w := httptest.NewRecorder()

			req.SetPathValue("id", e.param)
			handler := GetCustomerAddressesHandler(e.store)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}

		})
	}
}

func TestGetCustomerAddress(t *testing.T) {
	var tests = []struct {
		name  string
		store AddressStore
		param string
		want  int
	}{
		{"Returns customer addresses", &FakeStore{GetCustomerAddressFn: func(ctx context.Context, aid int) (*Address, error) {
			return &Address{ID: 1, StreetLine1: "123 Street", StreetLine2: "", City: "Los Angeles", State: "CA", ZipCode: "90001", AddressType: "shipping", IsDefault: true, CustomerID: 1}, nil
		}}, "1", 200},
		{"Returns no address", &FakeStore{GetCustomerAddressFn: func(ctx context.Context, aid int) (*Address, error) {
			return nil, sql.ErrNoRows
		}}, "2", 404},
		{"Invalid ID", &FakeStore{GetCustomerAddressFn: func(ctx context.Context, aid int) (*Address, error) {
			return &Address{}, nil
		}}, "abc", 400},
		{"DB error", &FakeStore{GetCustomerAddressFn: func(ctx context.Context, aid int) (*Address, error) {
			return nil, errors.New("internal server error")
		}}, "1", 500},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/customer/{id}", nil)
			w := httptest.NewRecorder()

			req.SetPathValue("id", e.param)
			handler := GetCustomerAddressHandler(e.store)

			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}

		})
	}
}

func TestAddCustomerAddress(t *testing.T) {
	var tests = []struct {
		name      string
		store     AddressStore
		body      string
		pathValue string
		want      int
	}{
		{"Adds a new address", &FakeStore{AddCustomerAddressFn: func(ctx context.Context, address *Address) (int, error) {
			return 1, nil
		}}, `{"StreetLine1": "321 Street", "StreetLine2": "Apt 12", "City": "Los Angeles", "State": "CA", "ZipCode": "90001", "AddressType": "billing", "IsDefault": false}`, "1", 201},
		{"Malformed JSON", &FakeStore{AddCustomerAddressFn: func(ctx context.Context, address *Address) (int, error) {
			return 0, nil
		}}, `{"StreetLine1":, "StreetLine2": "Apt 12", "City": "Los Angeles", "State": "CA", "ZipCode": "90001", "AddressType": "billing", "IsDefault": false}`, "1", 400},
		{"Invalid customer ID", &FakeStore{AddCustomerAddressFn: func(ctx context.Context, address *Address) (int, error) {
			return 0, nil
		}}, `{"StreetLine1":"321 Street, "StreetLine2": "Apt 12", "City": "Los Angeles", "State": "CA", "ZipCode": "90001", "AddressType": "billing", "IsDefault": false}`, "abc", 400},
		{"DB Error", &FakeStore{AddCustomerAddressFn: func(ctx context.Context, address *Address) (int, error) {
			return 0, errors.New("Internal server error")
		}}, `{"StreetLine1":"321 Street", "StreetLine2": "Apt 12", "City": "Los Angeles", "State": "CA", "ZipCode": "90001", "AddressType": "billing", "IsDefault": false}`, "1", 500},
		{"Missing required fields", &FakeStore{AddCustomerAddressFn: func(ctx context.Context, cst *Address) (int, error) {
			return 0, nil
		}}, `{"StreetLine1":"", "StreetLine2": "Apt 12", "City": "Los Angeles", "State": "CA", "ZipCode": "90001", "AddressType": "billing", "IsDefault": false}`, "1", 400},
	}

	for _, e := range tests {
		t.Run(e.name, func(t *testing.T) {
			body := strings.NewReader(e.body)
			req := httptest.NewRequest("POST", "/customers/{id}/addresses", body)
			w := httptest.NewRecorder()

			req.SetPathValue("id", e.pathValue)

			handler := AddCustomerAddressHandler(e.store)
			handler(w, req)

			if w.Code != e.want {
				t.Errorf("Got %d want %d", w.Code, e.want)
			}
		})
	}
}
