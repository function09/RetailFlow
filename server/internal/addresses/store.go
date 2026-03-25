package addresses

import (
	"context"
	"database/sql"
)

type Address struct {
	ID          int
	StreetLine1 string
	StreetLine2 string
	City        string
	State       string
	ZipCode     string
	AddressType string
	IsDefault   bool
	CustomerID  int
}

type Store struct {
	*sql.DB
}

type AddressStore interface {
	GetCustomerAddresses(ctx context.Context, cid int) ([]*Address, error)
	GetCustomerAddress(ctx context.Context, aid int) (*Address, error)
	AddCustomerAddress(ctx context.Context, address *Address) (int, error)
	RemoveCustomerAddress(ctx context.Context, aid int) error
}

func (s *Store) GetCustomerAddresses(ctx context.Context, cid int) ([]*Address, error) {
	rows, err := s.QueryContext(ctx, "SELECT id, street_line_1, street_line_2, city, state, zip_code, address_type, is_default,customer_id from addresses WHERE customer_id=$1", cid)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var addresses []*Address

	for rows.Next() {
		var address Address

		if err := rows.Scan(&address.StreetLine1, &address.StreetLine2, &address.City, &address.State, &address.ZipCode, &address.AddressType, &address.IsDefault, &address.CustomerID); err != nil {
			return nil, err
		}
		addresses = append(addresses, &address)
	}
	return addresses, nil
}

func (s *Store) GetCustomerAddress(ctx context.Context, aid int) (*Address, error) {
	var address Address
	if err := s.QueryRowContext(ctx, "SELECT id, street_line_1, street_line_2, city, state, zip_code, address_type, is_default,customer_id from addresses WHERE id=$1", aid).Scan(&address.StreetLine1, &address.StreetLine2, &address.City, &address.State, &address.ZipCode, &address.AddressType, &address.IsDefault, &address.CustomerID); err != nil {
		return nil, err
	}
	return &address, nil
}

func (s *Store) AddCustomerAddress(ctx context.Context, address *Address) (int, error) {
	var addressID int
	if err := s.QueryRowContext(ctx, "INSERT INTO addresses (street_line_1, street_line_2, city, state, zip_code, address_type, is_default,customer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id", address.StreetLine1, address.StreetLine2, address.City, address.State, address.ZipCode, address.AddressType, address.IsDefault, address.CustomerID).Scan(&addressID); err != nil {
		return 0, err
	}

	return addressID, nil
}

func (s *Store) RemoveCustomerAddress(ctx context.Context, aid int) error {
	_, err := s.ExecContext(ctx, "DELETE from addresses WHERE id = $1", aid)

	return err
}
