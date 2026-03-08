package auth

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int
	Username     string
	PasswordHash string
	CreatedAt    time.Time
}

func RegisterUser(db *sql.DB, user *User) error {
	_, err := db.Exec("INSERT INTO users (username, password_hash, created_at) VALUES($1, $2, $3)", user.Username, user.PasswordHash, user.CreatedAt)

	if err != nil {
		return err
	}
	return nil
}

func GetUserByUserName(db *sql.DB, username string) (*User, error) {
	row := db.QueryRow("SELECT id, username, password_hash, created_at FROM users WHERE username = $1", username)

	user := User{}

	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt); err != nil {
		return nil, err
	}

	return &user, nil
}
