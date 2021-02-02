package models

import (
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var CategoryMap = map[string]bool{
	"American (Traditional)": true,
	"Italian":                true,
	"Chinese":                true,
	"Korean":                 true,
	"Japanese":               true,
	"Greek":                  true,
	"Sandwiches":             true,
	"Bakeries":               true,
	"Pizza":                  true,
	"Salad":                  true,
	"Desserts":               true,
	"Coffee & Tea":           true,
	"Gluten-Free":            true,
	"Vegan":                  true,
}

type User struct {
	ID         primitive.ObjectID   `json:"id,omitempty" bson:"_id,omitempty"`
	Name       string               `json:"name" bson:"name"`
	Email      string               `json:"email" bson:"email"`
	Password   string               `json:"password" bson:"password"`
	Lat        float64              `json:"latitude" bson:"latitude"`
	Lng        float64              `json:"longitude" bson:"longitude"`
	SuperLikes []primitive.ObjectID `json:"superLikes,omitempty" bson:"superLikes,omitempty"`
	Categories map[string]int       `json:"categories,omitempty" bson:"categories,omitempty"`
}

type AuthUser struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Email    string             `json:"email" bson:"email"`
	Password string             `json:"password" bson:"password"`
}

type AuthResponse struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	AccessToken string             `json:"access_token"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

type RestaurantId struct {
	RestaurantId primitive.ObjectID `json:"restaurantId,omitempty" bson:"restaurantId,omitempty"`
}

func NewCategories() map[string]int {
	return map[string]int{
		"American (Traditional)": 0,
		"Italian":                0,
		"Chinese":                0,
		"Korean":                 0,
		"Japanese":               0,
		"Greek":                  0,
		"Sandwiches":             0,
		"Bakeries":               0,
		"Pizza":                  0,
		"Salad":                  0,
		"Desserts":               0,
		"Coffee & Tea":           0,
		"Gluten-Free":            0,
		"Vegan":                  0,
	}
}
