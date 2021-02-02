package api

import (
	"net/http"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/mgo.v2/bson"
)

func getId(w http.ResponseWriter, r *http.Request) (primitive.ObjectID, error) {
	id := mux.Vars(r)["id"]
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.Write([]byte(err.Error()))
		return primitive.NilObjectID, err
	}

	return objectID, nil
}

func FindRestaurant(data *DB, objectID primitive.ObjectID) (models.Restaurant, error) {
	result := data.db.Collection("restaurant").FindOne(data.ctx, bson.M{"_id": objectID})
	err := result.Err()
	if err != nil {
		return models.Restaurant{}, err
	}

	var restaurant models.Restaurant
	result.Decode(&restaurant)

	return restaurant, nil
}

func FindUser(data *DB, objectID primitive.ObjectID) (models.User, error) {
	result := data.db.Collection("user").FindOne(
		data.ctx,
		bson.M{"_id": objectID},
	)

	err := result.Err()
	if err != nil {
		return models.User{}, err
	}

	var user models.User
	result.Decode(&user)

	return user, nil
}
