package middleware

import (
	"net/http"

	"github.com/function09/order_management_system/server/internal/auth"
)

func AuthMiddleware(secret string, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		token, err := r.Cookie("__Secure-token")

		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(token.Value, secret)

		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		handler(w, auth.WithClaims(r, claims))
	}
}
