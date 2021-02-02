package tests

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"testing"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/auth"
	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var newRestID primitive.ObjectID

func TestRestaurants(t *testing.T) {
	err := godotenv.Load("../.env")
	if err != nil {
		t.Fatal(err)
	}
	readPort, portExists := os.LookupEnv("PORT")
	if !portExists {
		t.Fatal("Env vars missing")
	}
	port = readPort

	client = &http.Client{}
	token, err := auth.CreateToken("test@test.com")
	if err != nil {
		t.Fatal(err)
	}
	bearer = "Bearer " + token

	t.Run("Test adding new restaurant", testAddRestaurant())
	t.Run("Test updating existing restaurant", testUpdateRestaurant())
	t.Run("Test deleting restaurant", testDeleteRestaurant())
}

func testAddRestaurant() func(*testing.T) {
	return func(t *testing.T) {
		restaurantSent, err := json.Marshal(models.Restaurant{
			ID:         primitive.NewObjectID(),
			YelpID:     "testYelpID",
			Name:       "testName",
			Rating:     4.00,
			NumRatings: 50,
			ImageURL:   []string{"img1", "img2"},
			Lat:        1.23456,
			Lng:        6.54321,
			Address:    "testAddress",
			Categories: []string{"cat1", "cat2"},
			Price:      10,
			Weight:     100,
		})
		if err != nil {
			t.Fatal(err)
		}

		addReq, err := http.NewRequest("POST", "http://localhost:"+port+"/restaurant/add", bytes.NewBuffer(restaurantSent))
		if err != nil {
			t.Fatal(err)
		}
		addReq.Header.Set("Content-Type", "application/json")
		addReq.Header.Set("Authorization", bearer)

		addResp, err := client.Do(addReq)
		if err != nil {
			t.Fatal(err)
		}
		addRespData, err := ioutil.ReadAll(addResp.Body)
		if err != nil {
			t.Fatal(err)
		}
		var restaurantRet models.Restaurant
		err = json.Unmarshal(addRespData, &restaurantRet)
		if err != nil {
			t.Fatal(err)
		}

		if restaurantRet.YelpID != "testYelpID" {
			t.Errorf("Add request returned unexpected yelp ID: got %v", restaurantRet.YelpID)
		}
		if restaurantRet.Name != "testName" {
			t.Errorf("Add request returned unexpected name: got %v", restaurantRet.Name)
		}
		if restaurantRet.Rating != 4.00 {
			t.Errorf("Add request returned unexpected rating: got %v", restaurantRet.Rating)
		}
		if restaurantRet.NumRatings != 50 {
			t.Errorf("Add request returned unexpected rating count: got %v", restaurantRet.NumRatings)
		}
		if restaurantRet.ImageURL[0] != "img1" || restaurantRet.ImageURL[1] != "img2" {
			t.Errorf("Add request returned image urls: got %v", restaurantRet.ImageURL)
		}
		if restaurantRet.Lat != 1.23456 {
			t.Errorf("Add request returned unexpected lat: got %v", restaurantRet.Lat)
		}
		if restaurantRet.Lng != 6.54321 {
			t.Errorf("Add request returned unexpected lng: got %v", restaurantRet.Lng)
		}
		if restaurantRet.Address != "testAddress" {
			t.Errorf("Add request returned unexpected address: got %v", restaurantRet.Address)
		}
		if restaurantRet.Categories[0] != "cat1" || restaurantRet.Categories[1] != "cat2" {
			t.Errorf("Add request returned categories: got %v", restaurantRet.Categories)
		}
		if restaurantRet.Price != 10 {
			t.Errorf("Add request returned unexpected price: got %v", restaurantRet.Price)
		}
		if restaurantRet.Weight != 100 {
			t.Errorf("Add request returned unexpected weight: got %v", restaurantRet.Weight)
		}

		newRestID = restaurantRet.ID
	}
}

func testUpdateRestaurant() func(*testing.T) {
	return func(t *testing.T) {
		restaurantUpdate, err := json.Marshal(models.Restaurant{
			ID:         newRestID,
			YelpID:     "testYelpID",
			Name:       "testName",
			Rating:     4.50,
			NumRatings: 60,
			ImageURL:   []string{"img1", "img2"},
			Lat:        1.23456,
			Lng:        6.54321,
			Address:    "testAddress",
			Categories: []string{"cat1", "cat2"},
			Price:      10,
			Weight:     110,
		})
		if err != nil {
			t.Fatal(err)
		}

		updateReq, err := http.NewRequest("PUT",
			"http://localhost:"+port+"/restaurant/update/"+newRestID.Hex(),
			bytes.NewBuffer(restaurantUpdate))
		if err != nil {
			t.Fatal(err)
		}
		updateReq.Header.Set("Content-Type", "application/json")
		updateReq.Header.Set("Authorization", bearer)

		updateResp, err := client.Do(updateReq)
		if err != nil {
			t.Fatal(err)
		}
		if updateResp.StatusCode != http.StatusOK {
			t.Errorf("Update returned wrong status code: got %v, want %v", updateResp.Status, http.StatusOK)
		}
		updateRespData, err := ioutil.ReadAll(updateResp.Body)
		if err != nil {
			t.Fatal(err)
		}
		var updateRet models.Restaurant
		err = json.Unmarshal(updateRespData, &updateRet)
		if err != nil {
			t.Fatal(updateRet)
		}

		if updateRet.YelpID != "testYelpID" {
			t.Errorf("Update request returned unexpected yelp ID: got %v", updateRet.YelpID)
		}
		if updateRet.Name != "testName" {
			t.Errorf("Update request returned unexpected name: got %v", updateRet.Name)
		}
		if updateRet.Rating != 4.50 {
			t.Errorf("Update request returned unexpected rating: got %v", updateRet.Rating)
		}
		if updateRet.NumRatings != 60 {
			t.Errorf("Update request returned unexpected rating count: got %v", updateRet.NumRatings)
		}
		if updateRet.ImageURL[0] != "img1" || updateRet.ImageURL[1] != "img2" {
			t.Errorf("Update request returned image urls: got %v", updateRet.ImageURL)
		}
		if updateRet.Lat != 1.23456 {
			t.Errorf("Update request returned unexpected lat: got %v", updateRet.Lat)
		}
		if updateRet.Lng != 6.54321 {
			t.Errorf("Update request returned unexpected lng: got %v", updateRet.Lng)
		}
		if updateRet.Address != "testAddress" {
			t.Errorf("Update request returned unexpected address: got %v", updateRet.Address)
		}
		if updateRet.Categories[0] != "cat1" || updateRet.Categories[1] != "cat2" {
			t.Errorf("Update request returned categories: got %v", updateRet.Categories)
		}
		if updateRet.Price != 10 {
			t.Errorf("Update request returned unexpected price: got %v", updateRet.Price)
		}
		if updateRet.Weight != 110 {
			t.Errorf("Update request returned unexpected weight: got %v", updateRet.Weight)
		}
	}
}

func testDeleteRestaurant() func(*testing.T) {
	return func(t *testing.T) {
		delReq, err := http.NewRequest("DELETE",
			"http://localhost:"+port+"/restaurant/delete/"+newRestID.Hex(),
			nil)
		if err != nil {
			t.Fatal(err)
		}
		delReq.Header.Set("Authorization", bearer)

		delResp, err := client.Do(delReq)
		if err != nil {
			t.Fatal(err)
		}
		if delResp.StatusCode != http.StatusOK {
			t.Errorf("Delete returned wrong status code: got %v, want %v", delResp.StatusCode, http.StatusOK)
		}
	}
}
