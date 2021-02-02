package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "hello!")
}

func RouterInit() {
	config := getConfig()
	ctx := context.Background()
	// MongoDB Atlas setup
	db := clientInit(ctx)

	r := mux.NewRouter()
	r.HandleFunc("/", Handler).Methods("GET")

	data := DB{db: db, ctx: ctx}
	// Restaurant methods
	restaurantString := "/restaurant"
	r.HandleFunc(restaurantString, data.GetRestaurants).Methods("POST")
	r.HandleFunc(restaurantString+"/{id:[a-zA-Z0-9]*}", data.GetRestaurant).Methods("GET")
	r.HandleFunc(restaurantString+"/add", data.AddRestaurant).Methods("POST")
	r.HandleFunc(restaurantString+"/delete/{id:[a-zA-Z0-9]*}", data.DeleteRestaurant).Methods("DELETE")
	r.HandleFunc(restaurantString+"/update/{id:[a-zA-Z0-9]*}", data.UpdateRestaurant).Methods("PUT")
	r.HandleFunc(restaurantString+"/swipe/{id:[a-zA-Z0-9]*}", data.Swipe).Methods("PUT")

	// User methods
	userString := "/user"
	r.HandleFunc(userString+"/{id:[a-zA-Z0-9]*}", data.GetUser).Methods("GET")
	r.HandleFunc(userString+"/add", data.AddUser).Methods("POST")
	r.HandleFunc(userString+"/auth", data.AuthenticateUser).Methods("POST")
	r.HandleFunc(userString+"/superlike/{id:[a-zA-Z0-9]*}", data.GetSuperLikes).Methods("GET")
	r.HandleFunc(userString+"/add/superlike/{id:[a-zA-Z0-9]*}", data.AddSuperLike).Methods("POST")
	r.HandleFunc(userString+"/delete/superlike/{id:[a-zA-Z0-9]*}", data.DeleteSuperLike).Methods("DELETE")
	// Scrape method
	r.HandleFunc("/scrape", data.ScrapeRestaurants).Methods("POST")

	address := "0.0.0.0:" + config.Port

	srv := &http.Server{
		Handler:      r,
		Addr:         address,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// router setup
	fmt.Printf("Server running on port %s\n", config.Port)
	log.Fatal(srv.ListenAndServe())
}
