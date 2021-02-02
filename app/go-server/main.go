package main

import (
	"log"
	"os"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/api"

	"github.com/joho/godotenv"
)

func main() {
	if os.Getenv("APP_ENV") != "production" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatalf("Error loading .env file")
		}
	}

	api.RouterInit()
}
