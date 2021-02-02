package api

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/auth"
	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/mgo.v2/bson"
)

func (data *DB) GetUser(w http.ResponseWriter, r *http.Request) {
	err := auth.ValidateToken(w, r)
	if err != nil {
		return
	}

	objectID, err := getId(w, r)
	if err != nil {
		return
	}

	user, err := FindUser(data, objectID)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response, _ := json.Marshal(user)
	w.Write(response)
}

func (data *DB) AddUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	postBody, _ := ioutil.ReadAll(r.Body)
	err := json.Unmarshal(postBody, &user)
	if err != nil {
		log.Print("Error unpacking user data")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	var userExists models.User
	err = data.db.Collection("user").FindOne(data.ctx, bson.M{"email": user.Email}).Decode(&userExists)
	if err != nil && err != mongo.ErrNoDocuments {
		w.Write([]byte(err.Error()))
		return
	}

	if userExists.Email != "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(errors.New("User already exists").Error()))
		return
	}

	user.Email = strings.ToLower(user.Email)
	user.ID = primitive.NewObjectID()
	user.Categories = models.NewCategories()
	hashed, err := auth.HashPassword(user.Password)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	user.Password = hashed
	_, err = data.db.Collection("user").InsertOne(data.ctx, user)
	if err != nil {
		w.Write([]byte(err.Error()))
	}

	tokenString, err := auth.CreateToken(user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	} else {
		var authResponse models.AuthResponse
		authResponse.AccessToken = tokenString
		authResponse.ID = user.ID
		w.Header().Set("Content-Type", "application/json")
		response, _ := json.Marshal(authResponse)
		w.Write(response)
	}
}

func (data *DB) AuthenticateUser(w http.ResponseWriter, r *http.Request) {
	var authUser models.AuthUser
	var user models.User

	postBody, _ := ioutil.ReadAll(r.Body)
	err := json.Unmarshal(postBody, &authUser)
	if err != nil {
		log.Print("Error unpacking login data")
		w.Write([]byte(err.Error()))
		return
	}

	user.Email = strings.ToLower(user.Email)

	err = data.db.Collection("user").FindOne(data.ctx, bson.M{"email": authUser.Email}).Decode(&user)
	if err != nil {
		w.Write([]byte(err.Error()))
	}
	check := auth.CheckPasswordHash(authUser.Password, user.Password)
	if !check {
		w.Write([]byte("Invalid password"))
		return
	}

	tokenString, err := auth.CreateToken(user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else {
		var authResponse models.AuthResponse
		authResponse.AccessToken = tokenString
		authResponse.ID = user.ID
		w.Header().Set("Content-Type", "application/json")
		response, _ := json.Marshal(authResponse)
		w.Write(response)
	}
}

func (data *DB) AddSuperLike(w http.ResponseWriter, r *http.Request) {
	err := auth.ValidateToken(w, r)
	if err != nil {
		return
	}

	objectID, err := getId(w, r)
	if err != nil {
		return
	}

	var rest models.RestaurantId
	postBody, _ := ioutil.ReadAll(r.Body)
	err = json.Unmarshal(postBody, &rest)
	if err != nil {
		log.Print("Error unpacking Restaurant ID data")
		w.Write([]byte(err.Error()))
		return
	}

	result := data.db.Collection("restaurant").FindOne(data.ctx, bson.M{"_id": rest.RestaurantId})
	err = result.Err()
	if err != nil {
		log.Printf("Cannot find restaurant with id %s", rest.RestaurantId)
		w.Write([]byte(err.Error()))
		return
	}

	_, err = data.db.Collection("user").UpdateOne(data.ctx, bson.M{"_id": objectID}, bson.M{"$push": bson.M{"superLikes": rest.RestaurantId}})
	if err != nil {
		w.Write([]byte(err.Error()))
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func (data *DB) GetSuperLikes(w http.ResponseWriter, r *http.Request) {
	err := auth.ValidateToken(w, r)
	if err != nil {
		return
	}

	objectID, err := getId(w, r)
	if err != nil {
		return
	}

	user, err := FindUser(data, objectID)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}

	var query bson.M

	if user.SuperLikes != nil && len(user.SuperLikes) > 0 {
		query = bson.M{"_id": bson.M{"$in": user.SuperLikes}}
	} else if len(user.SuperLikes) == 0 {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")

		response, _ := json.Marshal([]models.Restaurant{})
		w.Write(response)
		return
	}

	res, err := data.db.Collection("restaurant").Find(data.ctx, query)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}
	var restaurants []models.Restaurant
	if err = res.All(data.ctx, &restaurants); err != nil {
		log.Print(err)
		w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	response, _ := json.Marshal(restaurants)
	w.Write(response)
}

func (data *DB) DeleteSuperLike(w http.ResponseWriter, r *http.Request) {
	err := auth.ValidateToken(w, r)
	if err != nil {
		return
	}

	objectID, err := getId(w, r)
	if err != nil {
		return
	}

	var rest models.RestaurantId
	postBody, _ := ioutil.ReadAll(r.Body)
	err = json.Unmarshal(postBody, &rest)
	if err != nil {
		log.Print("Error unpacking Restaurant ID data")
		w.Write([]byte(err.Error()))
		return
	}

	query := bson.M{"$pull": bson.M{"superLikes": rest.RestaurantId}}

	update, err := data.db.Collection("user").UpdateOne(data.ctx, bson.M{"_id": objectID}, query)
	if err != nil || update.ModifiedCount != 1 {
		w.Write([]byte("Could not delete restaurant from superlikes"))
	} else {
		w.WriteHeader(http.StatusOK)
		response, _ := json.Marshal(update)
		w.Write(response)
	}
}
