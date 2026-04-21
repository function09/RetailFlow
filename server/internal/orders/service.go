package orders

import (
	"context"
	"fmt"

	"github.com/function09/order_management_system/server/db"
	"github.com/function09/order_management_system/server/internal/addresses"
	"github.com/function09/order_management_system/server/internal/products"
)

type OrderItemInput struct {
	ProductID int
	Quantity  int
}

type AddressInput struct {
	StreetLine1 string
	StreetLine2 string
	City        string
	State       string
	ZipCode     string
}

type SalesOrderInput struct {
	CustomerID  int
	Fulfillment string
	OrderItems  []*OrderItemInput
	Address     *AddressInput
}

type ProductStore interface {
	GetProduct(ctx context.Context, id int) (*products.Product, error)
	UpdateProduct(ctx context.Context, p *products.Product) error
}

type AddressStore interface {
	GetCustomerAddresses(ctx context.Context, cid int) ([]*addresses.Address, error)
}

type Service struct {
	orderStore    OrderStore
	productsStore ProductStore
	addressStore  AddressStore
	transactor    db.Transactor
}

func (s *Service) CreateOrder(ctx context.Context, so SalesOrderInput) error {
	err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if so.Address == nil {
			addresses, err := s.addressStore.GetCustomerAddresses(ctx, so.CustomerID)

			if err != nil {
				return err
			}

			for _, address := range addresses {
				newAddress := AddressInput{}
				if address.IsDefault {
					newAddress.StreetLine1 = address.StreetLine1
					newAddress.StreetLine2 = address.StreetLine2
					newAddress.City = address.City
					newAddress.State = address.State
					newAddress.ZipCode = address.ZipCode
					so.Address = &newAddress
					break
				}
			}
			if so.Address == nil {
				return fmt.Errorf("no default address assigned for CustomerID %d", so.CustomerID)

			}

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
			StreetLine1: so.Address.StreetLine1,
			StreetLine2: so.Address.StreetLine2,
			City:        so.Address.City,
			State:       so.Address.State,
			ZipCode:     so.Address.ZipCode,
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
		return nil
	})
	return err
}
