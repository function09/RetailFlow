package auth

import (
	"context"
	"database/sql"
	"time"
)

type User struct {
	ID           int
	Username     string
	PasswordHash string
	CreatedAt    time.Time
}

type Store struct {
	db *sql.DB
}

type AuthStore interface {
	RegisterUser(ctx context.Context, user *User) error
	GetUserByUserName(ctx context.Context, username string) (*User, error)
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) RegisterUser(ctx context.Context, user *User) error {
	_, err := s.db.ExecContext(ctx, "INSERT INTO users (username, password_hash, created_at) VALUES($1, $2, $3)", user.Username, user.PasswordHash, user.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (s *Store) GetUserByUserName(ctx context.Context, username string) (*User, error) {
	row := s.db.QueryRowContext(ctx, "SELECT id, username, password_hash, created_at FROM users WHERE username = $1", username)

	user := User{}

	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt); err != nil {
		return nil, err
	}

	return &user, nil
}
