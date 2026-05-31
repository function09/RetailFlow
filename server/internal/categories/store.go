package categories

import (
	"context"

	"github.com/function09/order_management_system/server/db"
)

type Categories struct {
	ID       int
	Category string
}

type Store struct {
	dbGetter db.DBGetter
}

func NewStore(dbGetter db.DBGetter) *Store {
	return &Store{dbGetter: dbGetter}
}

type CategoriesStore interface {
	GetAllCategories(ctx context.Context) ([]*Categories, error)
	CreateCategory(ctx context.Context, name string) (*Categories, error)
}

func (s *Store) GetAllCategories(ctx context.Context) ([]*Categories, error) {
	query := "SELECT id, category FROM categories"

	rows, err := s.dbGetter(ctx).QueryContext(ctx, query)

	if err != nil {
		return nil, err
	}

	categories := []*Categories{}

	for rows.Next() {
		var cat Categories

		if err := rows.Scan(&cat.ID, &cat.Category); err != nil {
			return nil, err
		}

		categories = append(categories, &cat)
	}

	return categories, nil
}

func (s *Store) CreateCategory(ctx context.Context, name string) (*Categories, error) {
	query := "INSERT INTO categories (category) VALUES ($1) RETURNING id, category"

	var cat Categories
	err := s.dbGetter(ctx).QueryRowContext(ctx, query, name).Scan(&cat.ID, &cat.Category)
	if err != nil {
		return nil, err
	}

	return &cat, nil
}
