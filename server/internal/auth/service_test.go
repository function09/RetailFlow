package auth

import (
	"testing"
)

func TestPasswordHash(t *testing.T) {
	hash, err := HashPassword("password")

	if err != nil {
		t.Fatalf("expected no error got %v", err)
	}

	if hash == "password" {
		t.Error("hash should not equal original password")
	}

	if hash == "" {
		t.Error("hash should not be empty")
	}
}

func TestVerifyPassword(t *testing.T) {
	hashedPassword, _ := HashPassword("password")

	if err := VerifyPassword(hashedPassword, "password"); err != nil {
		t.Error("expected passwords to match")
	}
}

func TestGenerateToken(t *testing.T) {
	_, err := GenerateToken("user", "secret")

	if err != nil {
		t.Error("Error generating token")
	}

}

func TestValidateToken(t *testing.T) {
	token, err := GenerateToken("user", "secret")

	if err != nil {
		t.Error("Error generating token")
	}

	claims, err := ValidateToken(token, "secret")

	if claims == nil {
		t.Error("Expected claims to not be nil")
	}

	if err != nil {
		t.Error("Error decoding token")
	}
}
