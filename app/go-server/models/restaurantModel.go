package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Restaurant struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	YelpID      string             `json:"yelpid" bson:"yelpid"`
	Name        string             `json:"name" bson:"name"`
	Rating      float64            `json:"rating" bson:"rating"`
	NumRatings  int                `json:"numratings" bson:"numratings"`
	ImageURL    []string           `json:"imageURL,omitempty" bson:"imageURL,omitempty"`
	Lat         float64            `json:"lat" bson:"lat"`
	Lng         float64            `json:"lng" bson:"lng"`
	Address     string             `json:"address" bson:"address"`
	Categories  []string           `json:"categories" bson:"categories"`
	Price       int                `json:"price,omitempty" bson:"price,omitempty"`
	Weight      int                `json:"weight" bson:"weight"`
	Hours       map[string]string  `json:"hours,omitempty" bson:"hours,omitempty"`             // populated in GET /restaurant/details query
	TopReview   Review             `json:"topreview,omitempty" bson:"topreview,omitempty"`     // populated in GET /restaurant/details query
	PhoneNumber string             `json:"phonenumber,omitempty" bson:"phonenumber,omitempty"` // populated in GET /restaurant/details query
}

type Review struct {
	UserName    string `json:"username" bson:"username"`
	UserImage   string `json:"userimage" bson:"userimage"`
	ReviewText  string `json:"reviewtext" bson:"reviewtext"`
	Rating      int    `json:"rating" bson:"rating"`
	TimeCreated string `json:"timecreated" bson:"timecreated"`
}

type Swipe struct {
	Weight int                `json:"weight" bson:"weight"`
	UserId primitive.ObjectID `json:"userid,omitempty" bson:"userid,omitempty"`
}

type Filter struct {
	Categories []string           `json:"categories,omitempty" bson:"categories,omitempty"`
	Lat        float64            `json:"lat" bson:"lat"`
	Lng        float64            `json:"lng" bson:"lng"`
	Price      int                `json:"price,omitempty" bson:"price,omitempty"`
	Radius     float64            `json:"radius,omitempty" bson:"radius,omitempty"` // kilometers
	UserId     primitive.ObjectID `json:"userid" bson:"userid"`
}

type Radius struct {
	LowLat float64
	HiLat  float64
	LowLng float64
	HiLng  float64
}
