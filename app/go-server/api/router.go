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

	// Scrape method - to populate database
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
