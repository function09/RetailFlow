package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func ConnectToDB(databaseURL string) *sql.DB {
	db, err := sql.Open("postgres", databaseURL)

	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	return db
}
