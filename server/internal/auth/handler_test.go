package auth

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

type FakeStore struct{}
type FakeStoreWithUser struct{}

func (f *FakeStore) RegisterUser(user *User) error {
	return nil
}

func (f *FakeStore) GetUserByUserName(username string) (*User, error) {
	return &User{}, nil
}

func (f *FakeStoreWithUser) GetUserByUserName(username string) (*User, error) {
	hash, _ := HashPassword("testpass")
	return &User{Username: username, PasswordHash: hash}, nil
}

func (f *FakeStoreWithUser) RegisterUser(user *User) error {
	return nil
}

func TestRegisterUser(t *testing.T) {

	t.Run("Generates a new user", func(t *testing.T) {

		body := strings.NewReader(`{"username":"testuser", "password":"testpass"}`)
		req := httptest.NewRequest("POST", "/auth/register", body)
		w := httptest.NewRecorder()

		handler := RegisterUserHandler(&FakeStore{})

		handler(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("got %d want %d", w.Code, http.StatusCreated)
		}
	})

	t.Run("Does not read malformed json", func(t *testing.T) {

		body := strings.NewReader(`{"username":"testuser", "password":`)
		req := httptest.NewRequest("POST", "/auth/register", body)
		w := httptest.NewRecorder()

		handler := RegisterUserHandler(&FakeStore{})

		handler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("got %d want %d", w.Code, http.StatusBadRequest)
		}

	})
}

func TestUserLogin(t *testing.T) {
	t.Run("Incorrect credentials return an error", func(t *testing.T) {

		body := strings.NewReader(`{"username":"testuser", "password":"password"}`)
		req := httptest.NewRequest("POST", "/auth/login", body)
		w := httptest.NewRecorder()

		handler := LoginUserHandler(&FakeStore{}, "secret")

		handler(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("got %d want %d", w.Code, http.StatusUnauthorized)
		}
	})

	t.Run("Correct credentials return a token", func(t *testing.T) {
		body := strings.NewReader(`{"username":"testuser", "password":"testpass"}`)
		req := httptest.NewRequest("POST", "/auth/login", body)
		w := httptest.NewRecorder()

		handler := LoginUserHandler(&FakeStoreWithUser{}, "secret")

		handler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("got %d want %d", w.Code, http.StatusUnauthorized)
		}

	})

	t.Run("Verify cookie is set", func(t *testing.T) {

		body := strings.NewReader(`{"username":"testuser", "password":"testpass"}`)
		req := httptest.NewRequest("POST", "/auth/login", body)
		w := httptest.NewRecorder()

		handler := LoginUserHandler(&FakeStoreWithUser{}, "secret")

		handler(w, req)

		cookies := w.Result().Cookies()
		found := false

		for _, c := range cookies {
			if c.Name == "token" {
				found = true
				break
			}
		}

		if !found {
			t.Error("expected token cookie to be set")
		}
	})
}

func TestMe(t *testing.T) {
	t.Run("No cookie returns unauthorized", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/auth/me", nil)
		w := httptest.NewRecorder()

		Me("secret")(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("got %d want %d", w.Code, http.StatusUnauthorized)
		}
	})

	t.Run("Invalid token returns unauthorized", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/auth/me", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: "invalid.token.value"})
		w := httptest.NewRecorder()

		Me("secret")(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("got %d want %d", w.Code, http.StatusUnauthorized)
		}
	})

	t.Run("Valid token returns user claims", func(t *testing.T) {
		token, _ := GenerateToken("testuser", "secret", time.Hour)

		req := httptest.NewRequest("GET", "/auth/me", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: token})
		w := httptest.NewRecorder()

		Me("secret")(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("got %d want %d", w.Code, http.StatusOK)
		}
	})
}

func TestLogOutHandler(t *testing.T) {
	req := httptest.NewRequest("POST", "/auth/logout", nil)
	w := httptest.NewRecorder()

	handler := http.HandlerFunc(LogOutHandler)
	handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("got %d want %d", w.Code, http.StatusOK)
	}
}
