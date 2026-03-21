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

	_, err := database.Exec("TRUNCATE TABLE categories RESTART IDENTITY CASCADE")

	if err != nil {
		log.Printf("Error clearing table: %s", err)
	}
	_, err = database.Exec("TRUNCATE TABLE customers RESTART IDENTITY CASCADE")

	if err != nil {
		log.Printf("Error clearing table: %s", err)
	}
	for _, e := range categories {
		_, err := database.Exec("INSERT INTO categories (category) VALUES ($1);", e)

		if err != nil {
			log.Printf("Error inserting categories %s", err)
		}
	}

	count := 50000
	batchSize := 500

	for i := 0; i < count; i += batchSize {

		tx, _ := database.Begin()
		for j := 0; j < batchSize; j++ {

			_, err := tx.Exec("INSERT INTO products (sku, name, price, quantity, category_id ) VALUES($1, $2, $3, $4, $5)", gofakeit.UUID(), gofakeit.ProductName(), gofakeit.Number(1, 100), gofakeit.Number(1, 500), gofakeit.Number(1, len(categories)))

			if err != nil {
				log.Fatal(err)
			}
			_, err = tx.Exec("INSERT INTO customers (first_name, last_name, email, is_active ) VALUES($1, $2, $3, $4)", gofakeit.FirstName(), gofakeit.LastName(), gofakeit.UUID()+"@mail.com", true)

			if err != nil {
				log.Fatal(err)
			}
		}
		tx.Commit()
	}

}
