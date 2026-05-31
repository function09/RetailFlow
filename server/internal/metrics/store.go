package metrics

import (
	"context"

	"github.com/function09/order_management_system/server/db"
)

type TopProduct struct {
	Name      string
	TotalSold int64
}

type Metrics struct {
	TotalRevenue   int64
	OrdersByStatus map[string]int
	TopProducts    []*TopProduct
}

type Store struct {
	dbGetter db.DBGetter
}

func NewStore(dbGetter db.DBGetter) *Store {
	return &Store{dbGetter: dbGetter}
}

type MetricsStore interface {
	GetAllMetrics(ctx context.Context) (*Metrics, error)
}

func (s *Store) GetAllMetrics(ctx context.Context) (*Metrics, error) {
	var metrics Metrics

	totalRevenueQuery := "SELECT COALESCE(SUM(CAST(price AS BIGINT)*quantity), 0) FROM order_items"

	if err := s.dbGetter(ctx).QueryRowContext(ctx, totalRevenueQuery).Scan(&metrics.TotalRevenue); err != nil {
		return nil, err
	}

	ordersByStatusQuery := "SELECT status, COUNT(*) FROM orders GROUP BY status"

	rows, err := s.dbGetter(ctx).QueryContext(ctx, ordersByStatusQuery)

	if err != nil {
		return nil, err
	}

	var ordersByStatusMap = make(map[string]int)

	for rows.Next() {
		var status string
		var count int

		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		ordersByStatusMap[status] = count
	}

	metrics.OrdersByStatus = ordersByStatusMap

	if err := rows.Err(); err != nil {
		return nil, err
	}
	rows.Close()

	topProductsQuery := "SELECT p.name, SUM(oi.quantity) as total_sold FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.name ORDER BY total_sold DESC LIMIT 5"

	rows, err = s.dbGetter(ctx).QueryContext(ctx, topProductsQuery)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topProducts []*TopProduct

	for rows.Next() {
		var topProduct TopProduct

		if err := rows.Scan(&topProduct.Name, &topProduct.TotalSold); err != nil {
			return nil, err
		}

		topProducts = append(topProducts, &topProduct)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	metrics.TopProducts = topProducts
	return &metrics, nil
}
