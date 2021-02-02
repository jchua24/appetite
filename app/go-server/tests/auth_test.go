package tests

import (
	"net/http"
	"os"
	"testing"

	auth "github.com/csc301-fall-2020/team-project-31-appetite/server/auth"

	"github.com/joho/godotenv"
)

func TestHashing(t *testing.T) {
	testPasswords := [3]string{"TestPassword1", "KevinBad", "?P@GQ2Jb?kcDWr4m"}
	var hashedPasswords [3]string

	for index, password := range testPasswords {
		hashed, err := auth.HashPassword(password)
		if err != nil {
			t.Fatal(err)
		}
		hashedPasswords[index] = hashed
	}

	t.Run("Test correct passwords", testCorrectPassword(testPasswords, hashedPasswords))
	t.Run("Test wrong passwords", testWrongPassword(testPasswords, hashedPasswords))
}

func testCorrectPassword(testPasswords [3]string, hashedPasswords [3]string) func(*testing.T) {
	return func(t *testing.T) {
		for index, password := range testPasswords {
			checkCorrectPassword := auth.CheckPasswordHash(password, hashedPasswords[index])
			if !checkCorrectPassword {
				t.Errorf("Hash and decryption did not match when expected")
			}
		}
	}
}

func testWrongPassword(testPasswords [3]string, hashedPasswords [3]string) func(*testing.T) {
	return func(t *testing.T) {
		for index, _ := range testPasswords {
			checkWrongPassword := auth.CheckPasswordHash("Wrong", hashedPasswords[index])
			if checkWrongPassword {
				t.Errorf("Hash and decryption matched when not expected")
			}
		}
	}
}

func TestTokens(t *testing.T) {
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

	t.Run("Test request without token", testAuthNoToken())
	t.Run("Test request with valid token", testAuthWithToken())
}

func testAuthNoToken() func(*testing.T) {
	return func(t *testing.T) {
		noTokenReq, err := http.NewRequest("POST", "http://localhost:"+port+"/restaurant", nil)
		if err != nil {
			t.Fatal(err)
		}
		noTokenResp, err := client.Do(noTokenReq)
		if err != nil {
			t.Fatal(err)
		}
		if noTokenResp.StatusCode != 400 {
			t.Errorf("Unexpected return code: got %v", noTokenResp.StatusCode)
		}
	}
}

func testAuthWithToken() func(*testing.T) {
	return func(t *testing.T) {
		token, err := auth.CreateToken("test@test.com")
		if err != nil {
			t.Fatal(err)
		}
		bearer := "Bearer " + token

		tokenReq, err := http.NewRequest("POST", "http://localhost:"+port+"/restaurant", nil)
		if err != nil {
			t.Fatal(err)
		}
		tokenReq.Header.Set("Authorization", bearer)
		tokenResp, err := client.Do(tokenReq)
		if err != nil {
			t.Fatal(err)
		}
		if tokenResp.StatusCode != 200 {
			t.Errorf("Unexpected return code: got %v", tokenResp.StatusCode)
		}
	}
}
