package auth

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Print("Error hashing password")
	}
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func CreateToken(email string) (string, error) {
	tokenClaims := &models.Claims{
		Username: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Minute * 60).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	jwtSecret, _ := os.LookupEnv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateToken(w http.ResponseWriter, r *http.Request) error {
	reqToken := r.Header.Get("Authorization")
	splitToken := strings.Split(reqToken, "Bearer ")
	if len(splitToken) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		err := errors.New("Invalid auth token")
		w.Write([]byte(err.Error()))
		return err
	}

	tokenString := splitToken[1]
	claims := &models.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return err
	}
	if !token.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		err = errors.New("unathorized: token is invalid")
		w.Write([]byte(err.Error()))
	}

	return nil
}
