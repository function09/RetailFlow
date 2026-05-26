package orders

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/function09/order_management_system/server/db"
)

type Order struct {
	ID          int
	CustomerID  int
	FirstName   string
	LastName    string
	Status      string
	Fulfillment string
	StreetLine1 string
	StreetLine2 string
	City        string
	State       string
	ZipCode     string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

var validStatuses = map[string]bool{
	"pending":   true,
	"confirmed": true,
	"shipped":   true,
	"pickedup":  true,
	"delivered": true,
	"cancelled": true,
}

type OrderItem struct {
	ID        int
	OrderID   int
	ProductID int
	Name      string
	Price     int
	Quantity  int
}

type Store struct {
	dbGetter db.DBGetter
}

func NewStore(dbGetter db.DBGetter) *Store {
	return &Store{dbGetter: dbGetter}
}

type OrderStore interface {
	GetOrders(ctx context.Context, limit int, offset int, search string) ([]*Order, error)
	GetOrder(ctx context.Context, id int) (*Order, error)
	GetOrderItems(ctx context.Context, id int) ([]*OrderItem, error)
	GetOrdersByCustomerID(ctx context.Context, cid int) ([]*Order, error)
	CreateOrder(ctx context.Context, order *Order) (int, error)
	CreateOrderItems(ctx context.Context, orderItems []*OrderItem) error
	UpdateOrderStatus(ctx context.Context, id int, status string) error
	CancelOrdersByCustomerID(ctx context.Context, customerID int) error
}

func (s *Store) GetOrders(ctx context.Context, limit int, offset int, search string) ([]*Order, error) {
	query := "SELECT orders.id, orders.customer_id, orders.status, orders.fulfillment, orders.street_line_1, orders.street_line_2, orders.city, orders.state, orders.zip_code, orders.created_at, orders.updated_at, customers.first_name, customers.last_name FROM orders INNER JOIN customers ON customers.id = orders.customer_id WHERE 1 = 1"

	args := []any{limit, offset}

	if len(search) != 0 {
		query += " AND (customers.first_name ILIKE $3 OR customers.last_name ILIKE $3)"
		args = append(args, "%"+search+"%")
	}

	query += " LIMIT $1 OFFSET $2"

	rows, err := s.dbGetter(ctx).QueryContext(ctx, query, args...)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []*Order{}

	for rows.Next() {
		var order Order

		if err := rows.Scan(&order.ID, &order.CustomerID, &order.Status, &order.Fulfillment, &order.StreetLine1, &order.StreetLine2, &order.City, &order.State, &order.ZipCode, &order.CreatedAt, &order.UpdatedAt, &order.FirstName, &order.LastName); err != nil {
			return nil, err
		}

		orders = append(orders, &order)
	}

	return orders, nil
}

func (s *Store) GetOrder(ctx context.Context, id int) (*Order, error) {
	var order Order

	if err := s.dbGetter(ctx).QueryRowContext(ctx, "SELECT orders.id, orders.customer_id, orders.status, orders.fulfillment, orders.street_line_1, orders.street_line_2, orders.city, orders.state, orders.zip_code, orders.created_at, orders.updated_at, customers.first_name, customers.last_name FROM orders INNER JOIN customers ON orders.customer_id = customers.id WHERE orders.id=$1", id).Scan(&order.ID, &order.CustomerID, &order.Status, &order.Fulfillment, &order.StreetLine1, &order.StreetLine2, &order.City, &order.State, &order.ZipCode, &order.CreatedAt, &order.UpdatedAt, &order.FirstName, &order.LastName); err != nil {
		return nil, err
	}

	return &order, nil
}

func (s *Store) GetOrderItems(ctx context.Context, id int) ([]*OrderItem, error) {
	rows, err := s.dbGetter(ctx).QueryContext(ctx, "SELECT order_items.id, order_items.order_id, order_items.product_id, products.name, order_items.price, order_items.quantity FROM order_items INNER JOIN products ON order_items.product_id = products.id WHERE order_items.order_id = $1", id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []*OrderItem{}

	for rows.Next() {
		var item OrderItem

		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Name, &item.Price, &item.Quantity); err != nil {
			return nil, err
		}

		items = append(items, &item)
	}

	return items, nil
}

func (s *Store) GetOrdersByCustomerID(ctx context.Context, cid int) ([]*Order, error) {
	rows, err := s.dbGetter(ctx).QueryContext(ctx, "SELECT id, customer_id, status, fulfillment, street_line_1, street_line_2, city, state, zip_code, created_at, updated_at FROM orders WHERE customer_id=$1", cid)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []*Order{}

	for rows.Next() {
		var order Order

		if err := rows.Scan(&order.ID, &order.CustomerID, &order.Status, &order.Fulfillment, &order.StreetLine1, &order.StreetLine2, &order.City, &order.State, &order.ZipCode, &order.CreatedAt, &order.UpdatedAt); err != nil {
			return nil, err
		}

		orders = append(orders, &order)
	}

	return orders, nil
}

func (s *Store) CreateOrder(ctx context.Context, order *Order) (int, error) {
	var id int
	if err := s.dbGetter(ctx).QueryRowContext(ctx, "INSERT INTO orders (customer_id, status, fulfillment, street_line_1, street_line_2, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id", order.CustomerID, order.Status, order.Fulfillment, order.StreetLine1, order.StreetLine2, order.City, order.State, order.ZipCode).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (s *Store) CreateOrderItems(ctx context.Context, orderItems []*OrderItem) error {
	for _, item := range orderItems {
		_, err := s.dbGetter(ctx).ExecContext(ctx, "INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1, $2, $3, $4)", item.OrderID, item.ProductID, item.Price, item.Quantity)

		if err != nil {
			return err
		}
	}

	return nil
}

func (s *Store) UpdateOrderStatus(ctx context.Context, id int, status string) error {
	if _, ok := validStatuses[status]; !ok {
		return fmt.Errorf("invalid status: %s", status)
	}

	result, err := s.dbGetter(ctx).ExecContext(ctx, "UPDATE orders SET status=$1 WHERE id=$2", status, id)
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

func (s *Store) CancelOrdersByCustomerID(ctx context.Context, cid int) error {
	query := "UPDATE orders SET status='cancelled' WHERE customer_id=$1 AND status NOT IN ('delivered', 'pickedup', 'cancelled')"

	_, err := s.dbGetter(ctx).ExecContext(ctx, query, cid)
	if err != nil {
		return err
	}

	return nil
}
