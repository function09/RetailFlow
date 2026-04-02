package orders

import (
	"context"
	"fmt"

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

type OrderCreator interface {
	CreateOrder(ctx context.Context, order *Order) (int, error)
	CreateOrderItems(ctx context.Context, orderItems []*OrderItem) error
}

type ProductStore interface {
	GetProduct(ctx context.Context, id int) (*products.Product, error)
	UpdateProduct(ctx context.Context, p *products.Product) error
}

type AddressStore interface {
	GetCustomerAddresses(ctx context.Context, cid int) ([]*addresses.Address, error)
	AddCustomerAddress(ctx context.Context, address *addresses.Address) (int, error)
}

type Service struct {
	orderStore   OrderCreator
	productStore ProductStore
	addressStore AddressStore
}

func (s *Service) CreateOrder(ctx context.Context, so *SalesOrderInput) (int, error) {
	productMap := make(map[int]*products.Product)
	for _, item := range so.OrderItems {
		product, err := s.productStore.GetProduct(ctx, item.ProductID)
		if err != nil {
			return 0, err
		}

		if product.Quantity < item.Quantity {
			return 0, fmt.Errorf("not enough quantity of product %d", product.ID)
		}

		product.Quantity = product.Quantity - item.Quantity

		if err := s.productStore.UpdateProduct(ctx, product); err != nil {
			return 0, err
		}
		productMap[product.ID] = product
	}
	if so.Fulfillment == "shipping" && so.Address == nil {
		addresses, err := s.addressStore.GetCustomerAddresses(ctx, so.CustomerID)

		if err != nil {
			return 0, err
		}

		for _, address := range addresses {
			if address.IsDefault {
				so.Address = &AddressInput{}

				so.Address.StreetLine1 = address.StreetLine1
				so.Address.StreetLine2 = address.StreetLine2
				so.Address.City = address.City
				so.Address.State = address.State
				so.Address.ZipCode = address.ZipCode
				break
			}

		}
		if so.Address == nil {
			return 0, fmt.Errorf("No address found for customer %d", so.CustomerID)
		}

	}

	order := Order{CustomerID: so.CustomerID, Status: "pending", Fulfillment: so.Fulfillment}
	if so.Address != nil {
		order.StreetLine1 = so.Address.StreetLine1
		order.StreetLine2 = so.Address.StreetLine2
		order.City = so.Address.City
		order.State = so.Address.State
		order.ZipCode = so.Address.ZipCode
	}

	orderID, err := s.orderStore.CreateOrder(ctx, &order)
	if err != nil {
		return 0, err
	}

	var orderItems []*OrderItem

	for _, item := range so.OrderItems {
		orderItem := OrderItem{}
		orderItem.OrderID = orderID
		orderItem.ProductID = item.ProductID
		orderItem.Quantity = item.Quantity
		orderItem.Price = productMap[item.ProductID].Price

		orderItems = append(orderItems, &orderItem)
	}

	if err := s.orderStore.CreateOrderItems(ctx, orderItems); err != nil {
		return 0, err
	}

	return orderID, nil
}
