package orders

import (
	"context"
	"errors"
	"fmt"

	"github.com/function09/order_management_system/server/db"
	"github.com/function09/order_management_system/server/internal/products"
)

type OrderItemInput struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

type AddressInput struct {
	StreetLine1 string `json:"street_line_1"`
	StreetLine2 string `json:"street_line_2"`
	City        string `json:"city"`
	State       string `json:"state"`
	ZipCode     string `json:"zip_code"`
}

type SalesOrderInput struct {
	CustomerID  int               `json:"customer_id"`
	Fulfillment string            `json:"fulfillment"`
	OrderItems  []*OrderItemInput `json:"order_items"`
	Address     *AddressInput     `json:"address"`
}

type OrderDetails struct {
	Order      *Order
	OrderItems []*OrderItem
}

type ProductStore interface {
	GetProduct(ctx context.Context, id int) (*products.Product, error)
	UpdateProduct(ctx context.Context, p *products.Product) error
}

type Service struct {
	orderStore    OrderStore
	productsStore ProductStore
	transactor    db.Transactor
}

func NewService(orderStore OrderStore, productStore ProductStore, transactor db.Transactor) *Service {
	return &Service{orderStore: orderStore, productsStore: productStore, transactor: transactor}
}

func (s *Service) GetOrderDetails(ctx context.Context, id int) (*OrderDetails, error) {
	order, err := s.orderStore.GetOrder(ctx, id)

	if err != nil {
		return nil, fmt.Errorf("error fetching order %d: %w", id, err)
	}

	orderItems, err := s.orderStore.GetOrderItems(ctx, id)

	if err != nil {
		return nil, fmt.Errorf("error fetching order items for order %d: %w", id, err)
	}

	return &OrderDetails{Order: order, OrderItems: orderItems}, nil

}
func (s *Service) CreateOrder(ctx context.Context, so SalesOrderInput) (int, error) {
	var createdID int
	err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if so.Fulfillment == "shipping" && so.Address == nil {
			return errors.New("address is required for shipping orders")
		}

		if len(so.OrderItems) == 0 {
			return errors.New("no items are in this order")
		}

		newOrderItems := []*OrderItem{}
		for _, item := range so.OrderItems {
			product, err := s.productsStore.GetProduct(ctx, item.ProductID)
			if err != nil {
				return fmt.Errorf("error fetching item %d: %w", item.ProductID, err)
			}
			if product.Quantity < item.Quantity {
				return fmt.Errorf("available quantity for product %d is less than the item quantity on sales order", item.ProductID)
			}
			product.Quantity -= item.Quantity

			err = s.productsStore.UpdateProduct(ctx, product)

			if err != nil {
				return fmt.Errorf("error updating product %d: %w", item.ProductID, err)
			}

			newOrderItems = append(newOrderItems, &OrderItem{ProductID: product.ID, Price: product.Price, Quantity: item.Quantity})
		}

		newOrder := Order{
			CustomerID:  so.CustomerID,
			Status:      "pending",
			Fulfillment: so.Fulfillment,
		}
		if so.Address != nil {
			newOrder.StreetLine1 = so.Address.StreetLine1
			newOrder.StreetLine2 = so.Address.StreetLine2
			newOrder.City = so.Address.City
			newOrder.State = so.Address.State
			newOrder.ZipCode = so.Address.ZipCode
		}

		orderID, err := s.orderStore.CreateOrder(ctx, &newOrder)

		if err != nil {
			return fmt.Errorf("error creating order: %w", err)
		}

		for _, item := range newOrderItems {
			item.OrderID = orderID
		}

		err = s.orderStore.CreateOrderItems(ctx, newOrderItems)

		if err != nil {
			return fmt.Errorf("error adding order item: %w", err)
		}

		createdID = orderID
		return nil
	})
	return createdID, err
}
