package main

import (
	"log"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/function09/order_management_system/server/config"
	"github.com/function09/order_management_system/server/db"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load("../../../.env"); err != nil {
		log.Fatal(err)
	}

	cfg := config.LoadConfig()

	database := db.ConnectToDB(cfg.DatabaseURL)
	defer database.Close()

	categories := []string{"Electronics", "Clothing", "Food & Beverage", "Home & Garden", "Sports"}
	statuses := []string{"pending", "confirmed", "shipped", "delivered", "cancelled"}
	fulfillments := []string{"shipping", "pickup"}
	addressTypes := []string{"billing", "shipping", "both"}

	for _, table := range []string{"order_items", "orders", "addresses", "categories", "customers"} {
		if _, err := database.Exec("TRUNCATE TABLE " + table + " RESTART IDENTITY CASCADE"); err != nil {
			log.Printf("Error truncating %s: %s", table, err)
		}
	}

	for _, c := range categories {
		if _, err := database.Exec("INSERT INTO categories (category) VALUES ($1)", c); err != nil {
			log.Printf("Error inserting category: %s", err)
		}
	}

	count := 5000
	batchSize := 500

	for i := 0; i < count; i += batchSize {
		tx, err := database.Begin()
		if err != nil {
			log.Fatal(err)
		}
		for j := 0; j < batchSize; j++ {
			if _, err := tx.Exec(
				"INSERT INTO products (sku, name, price, quantity, category_id) VALUES($1, $2, $3, $4, $5)",
				gofakeit.UUID(), gofakeit.ProductName(), gofakeit.Number(100, 10000), gofakeit.Number(1, 500), gofakeit.Number(1, len(categories)),
			); err != nil {
				log.Fatal(err)
			}
			if _, err := tx.Exec(
				"INSERT INTO customers (first_name, last_name, email, is_active) VALUES($1, $2, $3, $4)",
				gofakeit.FirstName(), gofakeit.LastName(), gofakeit.UUID()+"@mail.com", true,
			); err != nil {
				log.Fatal(err)
			}
		}
		if err := tx.Commit(); err != nil {
			log.Fatal(err)
		}
	}

	// Fetch all customer and product IDs
	customerRows, err := database.Query("SELECT id FROM customers")
	if err != nil {
		log.Fatal(err)
	}
	defer customerRows.Close()
	var customerIDs []int
	for customerRows.Next() {
		var id int
		if err := customerRows.Scan(&id); err != nil {
			log.Fatal(err)
		}
		customerIDs = append(customerIDs, id)
	}

	productRows, err := database.Query("SELECT id, price FROM products")
	if err != nil {
		log.Fatal(err)
	}
	defer productRows.Close()
	type product struct{ id, price int }
	var products []product
	for productRows.Next() {
		var p product
		if err := productRows.Scan(&p.id, &p.price); err != nil {
			log.Fatal(err)
		}
		products = append(products, p)
	}

	// Seed addresses and orders in batches
	orderCount := 0
	for i := 0; i < len(customerIDs); i += batchSize {
		end := i + batchSize
		if end > len(customerIDs) {
			end = len(customerIDs)
		}
		batch := customerIDs[i:end]

		tx, err := database.Begin()
		if err != nil {
			log.Fatal(err)
		}

		for _, cid := range batch {
			addrType := addressTypes[gofakeit.Number(0, len(addressTypes)-1)]
			if _, err := tx.Exec(
				"INSERT INTO addresses (street_line_1, street_line_2, city, state, zip_code, type, is_default, customer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				gofakeit.Street(), gofakeit.StreetNumber(), gofakeit.City(), gofakeit.StateAbr(), gofakeit.Zip(), addrType, true, cid,
			); err != nil {
				log.Printf("Error inserting address: %s", err)
				continue
			}

			numOrders := gofakeit.Number(1, 5)
			for o := 0; o < numOrders; o++ {
				status := statuses[gofakeit.Number(0, len(statuses)-1)]
				fulfillment := fulfillments[gofakeit.Number(0, len(fulfillments)-1)]

				var orderID int
				err := tx.QueryRow(
					"INSERT INTO orders (customer_id, status, fulfillment, street_line_1, street_line_2, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
					cid, status, fulfillment, gofakeit.Street(), gofakeit.StreetNumber(), gofakeit.City(), gofakeit.StateAbr(), gofakeit.Zip(),
				).Scan(&orderID)
				if err != nil {
					log.Printf("Error inserting order: %s", err)
					continue
				}

				numItems := gofakeit.Number(1, 5)
				for k := 0; k < numItems; k++ {
					p := products[gofakeit.Number(0, len(products)-1)]
					qty := gofakeit.Number(1, 5)
					if _, err := tx.Exec(
						"INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1, $2, $3, $4)",
						orderID, p.id, p.price, qty,
					); err != nil {
						log.Printf("Error inserting order item: %s", err)
					}
				}
				orderCount++
			}
		}

		if err := tx.Commit(); err != nil {
			log.Fatal(err)
		}
	}

	log.Printf("Seeding complete: %d customers, %d products, ~%d orders", len(customerIDs), len(products), orderCount)
}
