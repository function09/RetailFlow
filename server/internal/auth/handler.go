package auth

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

type contextKey string

const ClaimsKey contextKey = "claims"

func GetClaims(r *http.Request) *Claims {
	claims, _ := r.Context().Value(ClaimsKey).(*Claims)
	return claims
}

func WithClaims(r *http.Request, claims *Claims) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), ClaimsKey, claims))
}

type RegisterInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func RegisterUserHandler(store AuthStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var input RegisterInput

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		defer r.Body.Close()

		hashedPassword, err := HashPassword(input.Password)

		if err != nil {
			slog.Error("failed to hash password during registration", "error", err)
			http.Error(w, "Error creating new user", http.StatusInternalServerError)
			return
		}

		var userRegister User
		userRegister.PasswordHash = hashedPassword
		userRegister.Username = input.Username
		userRegister.CreatedAt = time.Now()

		if err := store.RegisterUser(r.Context(), &userRegister); err != nil {
			slog.Error("failed to register user", "username", input.Username, "error", err)
			http.Error(w, "Error creating new user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}

}

func LoginUserHandler(store AuthStore, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var input LoginInput

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		defer r.Body.Close()

		user, err := store.GetUserByUserName(r.Context(), input.Username)

		if err != nil {
			http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
			return
		}

		err = VerifyPassword(user.PasswordHash, input.Password)

		if err != nil {
			http.Error(w, "Invalid login credentials", http.StatusUnauthorized)
			return
		}

		token, err := GenerateToken(user.Username, secret, time.Hour)
		if err != nil {
			slog.Error("failed to generate token", "username", input.Username, "error", err)
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "__Secure-token",
			Value:    token,
			HttpOnly: true,
			Path:     "/",
			SameSite: http.SameSiteStrictMode,
			Secure:   true,
		})

		w.WriteHeader(http.StatusOK)
	}
}

func Me() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		claims := GetClaims(r)

		if claims == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		json.NewEncoder(w).Encode(claims)
	}
}

func LogOutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: "__Secure-token", MaxAge: -1, Path: "/"})
	w.WriteHeader(http.StatusOK)

}
