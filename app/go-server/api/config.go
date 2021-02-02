package api

import (
	"log"
	"os"
)

type Config struct {
	Port     string
	MongoURI string
	YelpKey  string
}

func getConfig() Config {
	port, portExists := os.LookupEnv("PORT")
	mongoURI, mongoURIExists := os.LookupEnv("MONGO_URI")
	yelpKey, yelpKeyExists := os.LookupEnv("YELP_KEY")

	if !portExists || !mongoURIExists || !yelpKeyExists {
		log.Fatalf("Env vars missing")
	}

	config := Config{
		Port:     port,
		MongoURI: mongoURI,
		YelpKey:  yelpKey,
	}

	return config
}
