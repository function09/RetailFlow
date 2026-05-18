package customers

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/function09/order_management_system/server/db"
)

type Customer struct {
	ID        int
	FirstName string
	LastName  string
	Email     string
	IsActive  bool
}

type Store struct {
	dbGetter db.DBGetter
}

type CustomerStore interface {
	GetAllCustomers(ctx context.Context, limit int, offset int, search string, sort string, order string) ([]*Customer, error)
	GetCustomer(ctx context.Context, id int) (*Customer, error)
	CreateCustomer(ctx context.Context, cst *Customer) (int, error)
	RemoveCustomer(ctx context.Context, id int) error
	UpdateCustomer(ctx context.Context, cst *Customer) error
}

func NewStore(dbGetter db.DBGetter) *Store {
	return &Store{dbGetter: dbGetter}
}

func (s *Store) GetAllCustomers(ctx context.Context, limit int, offset int, search string, sort string, order string) ([]*Customer, error) {
	query := "SELECT id, first_name, last_name, email, is_active FROM customers WHERE is_active = true"

	args := []any{limit, offset}

	if len(search) != 0 {
		query += " AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3)"
		args = append(args, "%"+search+"%")
	}

	validSortColumns := map[string]bool{
		"first_name": true,
		"last_name":  true,
		"email":      true,
	}

	col := sort
	if !validSortColumns[sort] {
		col = "id"
	}

	if order != "asc" && order != "desc" {
		order = "asc"
	}

	query += fmt.Sprintf(" ORDER BY %s %s LIMIT $1 OFFSET $2", col, order)

	rows, err := s.dbGetter(ctx).QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	customers := []*Customer{}

	for rows.Next() {
		var customer Customer

		if err := rows.Scan(&customer.ID, &customer.FirstName, &customer.LastName, &customer.Email, &customer.IsActive); err != nil {
			return nil, err
		}
		customers = append(customers, &customer)
	}
	return customers, nil
}

func (s *Store) GetCustomer(ctx context.Context, id int) (*Customer, error) {
	var customer Customer
	if err := s.dbGetter(ctx).QueryRowContext(ctx, "SELECT id, first_name, last_name, email, is_active FROM customers WHERE id = $1 AND is_active = true", id).Scan(
		&customer.ID, &customer.FirstName, &customer.LastName, &customer.Email, &customer.IsActive); err != nil {
		return nil, err
	}

	return &customer, nil
}

func (s *Store) CreateCustomer(ctx context.Context, cst *Customer) (int, error) {
	var customerID int
	if err := s.dbGetter(ctx).QueryRowContext(ctx, "INSERT INTO customers (first_name, last_name, email) VALUES  ($1, $2, $3) RETURNING id", cst.FirstName, cst.LastName, cst.Email).Scan(&customerID); err != nil {
		return 0, err
	}
	return customerID, nil
}

func (s *Store) RemoveCustomer(ctx context.Context, id int) error {
	result, err := s.dbGetter(ctx).ExecContext(ctx, "UPDATE customers SET is_active = false WHERE id = $1", id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (s *Store) UpdateCustomer(ctx context.Context, cst *Customer) error {
	result, err := s.dbGetter(ctx).ExecContext(ctx, "UPDATE customers SET first_name = $1, last_name = $2, email = $3 WHERE id = $4", cst.FirstName, cst.LastName, cst.Email, cst.ID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}
