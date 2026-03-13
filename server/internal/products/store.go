package products

import "database/sql"

type Product struct {
	ID         int
	Name       string
	Price      int
	Quantity   int
	CategoryID int
}

type Store struct {
	*sql.DB
}

type ProductStore interface {
	GetAllProducts() ([]*Product, error)
	GetProduct(id int) (*Product, error)
	AddProduct(p *Product) error
	RemoveProduct(p *Product) error
	UpdateProduct(p *Product) error
}
