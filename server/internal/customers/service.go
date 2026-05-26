package customers

import (
	"context"

	"github.com/function09/order_management_system/server/db"
	"github.com/function09/order_management_system/server/internal/orders"
)

type OrdersStore interface {
	GetOrdersByCustomerID(ctx context.Context, cid int) ([]*orders.Order, error)
	CancelOrdersByCustomerID(ctx context.Context, cid int) error
}

type Service struct {
	customerStore CustomerStore
	orderStore    OrdersStore
	transactor    db.Transactor
}

func NewService(customerStore CustomerStore, orderStore OrdersStore, transactor db.Transactor) *Service {
	return &Service{customerStore: customerStore, orderStore: orderStore, transactor: transactor}
}

func (s *Service) GetOrdersByCustomerID(ctx context.Context, cid int) ([]*orders.Order, error) {
	_, err := s.customerStore.GetCustomer(ctx, cid)

	if err != nil {
		return nil, err
	}

	orders, err := s.orderStore.GetOrdersByCustomerID(ctx, cid)

	if err != nil {
		return nil, err
	}

	return orders, nil
}

func (s *Service) DeactivateCustomer(ctx context.Context, cid int) error {
	err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.customerStore.RemoveCustomer(ctx, cid); err != nil {
			return err
		}

		if err := s.orderStore.CancelOrdersByCustomerID(ctx, cid); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}
	return nil
}
