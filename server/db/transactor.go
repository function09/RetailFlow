package db

import (
	"context"
	"database/sql"
	"fmt"
)

type DB interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	PrepareContext(ctx context.Context, query string) (*sql.Stmt, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type DBGetter func(context.Context) DB

type Transactor interface {
	WithinTransaction(context.Context, func(ctx context.Context) error) error
}

type transactor struct {
	db *sql.DB
}

var _ Transactor = &transactor{}

func NewTransactor(db *sql.DB) (*transactor, DBGetter) {
	return &transactor{db: db},
		func(ctx context.Context) DB {
			if tx := txFromContext(ctx); tx != nil {
				return tx
			}
			return db
		}
}

type txCtxKey struct{}

func txToContext(ctx context.Context, tx *sql.Tx) context.Context {
	return context.WithValue(ctx, txCtxKey{}, tx)
}

func txFromContext(ctx context.Context) *sql.Tx {
	tx, ok := ctx.Value(txCtxKey{}).(*sql.Tx)
	if ok {
		return tx
	}
	return nil
}

func (t *transactor) WithinTransaction(ctx context.Context, txFunc func(context.Context) error) error {
	tx, err := t.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	txCtx := txToContext(ctx, tx)
	if err := txFunc(txCtx); err != nil {
		_ = tx.Rollback()
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
