package api

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"

	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/mgo.v2/bson"
)

type scrapeRequest struct {
	Location string `json:"location"`
	Radius   int    `json:"radius"`
	Limit    int    `json:"limit"`
}

func containsRestaurant(blockList []string, restaurant string) bool {
	cleanedRestaurant := strings.Replace(strings.ToLower(restaurant), " ", "", -1)
	for _, blockedRestaurant := range blockList {
		if strings.Contains(cleanedRestaurant, blockedRestaurant) || strings.Contains(blockedRestaurant, cleanedRestaurant) {
			return true
		}
	}
	return false
}

func addOrUpdateRestaurant(data *DB, business interface{}, blockRestaurants []string, wg *sync.WaitGroup) {
	businessMap := business.(map[string]interface{})

	restaurant := models.Restaurant{
		YelpID:     businessMap["id"].(string),
		Name:       businessMap["name"].(string),
		Rating:     businessMap["rating"].(float64),
		NumRatings: int(businessMap["review_count"].(float64)),
		ImageURL:   []string{businessMap["image_url"].(string)},
	}

	if containsRestaurant(blockRestaurants, restaurant.Name) {
		wg.Done()
		return
	}

	coordinates := businessMap["coordinates"].(map[string]interface{})
	restaurant.Lat = coordinates["latitude"].(float64)
	restaurant.Lng = coordinates["longitude"].(float64)

	addressMap := businessMap["location"].(map[string]interface{})
	restaurant.Address = addressMap["address1"].(string)

	restaurant.Categories = []string{}
	for _, category := range businessMap["categories"].([]interface{}) {
		categoryMap := category.(map[string]interface{})
		restaurant.Categories = append(restaurant.Categories, categoryMap["title"].(string))
	}

	if val, ok := businessMap["price"]; ok {
		restaurant.Price = strings.Count(val.(string), "$")
	}

	result := data.db.Collection("restaurant").FindOne(data.ctx, bson.M{"yelpid": restaurant.YelpID})
	err := result.Err()
	if err != nil {
		restaurant.Weight = 100
	} else {
		var existingRestaurant models.Restaurant
		result.Decode(&existingRestaurant)
		restaurant.Weight = existingRestaurant.Weight
	}

	result = data.db.Collection("restaurant").FindOneAndReplace(data.ctx, bson.M{"yelpid": restaurant.YelpID}, restaurant, options.FindOneAndReplace().SetUpsert(true))
	wg.Done()
}

func (data *DB) ScrapeRestaurants(w http.ResponseWriter, r *http.Request) {
	var scrapeReq scrapeRequest
	postBody, _ := ioutil.ReadAll(r.Body)
	err := json.Unmarshal(postBody, &scrapeReq)
	if err != nil {
		log.Print("Error unpacking request")
		w.Write([]byte(err.Error()))
		return
	}

	if scrapeReq.Limit%50 != 0 {
		log.Print("Limit is not a multiple of 50")
		w.Write([]byte(errors.New("Scrape limit is not a multiple of 50").Error()))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	config := getConfig()

	query_url := "https://api.yelp.com/v3/businesses/search"
	bearer := "Bearer " + config.YelpKey

	req, _ := http.NewRequest("GET", query_url, nil)
	req.Header.Add("Authorization", bearer)

	queryParams := url.Values{}
	queryParams.Add("location", scrapeReq.Location)
	queryParams.Add("categories", "restaurants")
	queryParams.Add("radius", strconv.Itoa(scrapeReq.Radius))
	queryParams.Add("limit", "50")
	queryParams.Add("offset", "0")

	blockFile, err := ioutil.ReadFile("blocklist.txt")
	if err != nil {
		log.Print("Couldn't open blocked restaurants file")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	blockRestaurants := strings.Split(string(blockFile), ",")
	blockMap := make(map[string]string)
	for i := 0; i < len(blockRestaurants); i++ {
		blockMap[blockRestaurants[i]] = ""
	}

	for i := 0; i < scrapeReq.Limit/50; i++ {
		limit := 50         // Number of restaurants to return in every Yelp API call (max is 50)
		offset := limit * i // Page offset for Yelp API call
		queryParams.Set("limit", strconv.Itoa(limit))
		queryParams.Set("offset", strconv.Itoa(offset))

		req.URL.RawQuery = queryParams.Encode()

		// Call Yelp API
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// Process response into map
		var results interface{}

		body, _ := ioutil.ReadAll(resp.Body)
		err = json.Unmarshal(body, &results)
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		resultsMap := results.(map[string]interface{})
		if resultsMap["businesses"] == nil {
			break
		}
		businesses := resultsMap["businesses"].([]interface{})

		wg := sync.WaitGroup{}
		for _, business := range businesses {
			wg.Add(1)
			go addOrUpdateRestaurant(data, business, blockRestaurants, &wg)
		}

		wg.Wait()
		log.Println("Concurrent restaurant add/update done")
	}

	w.WriteHeader(http.StatusOK)
}

func getYelpDetails(yelpID string) (map[string]interface{}, error) {

	config := getConfig()
	query_url := "https://api.yelp.com/v3/businesses/" + yelpID
	bearer := "Bearer " + config.YelpKey

	req, _ := http.NewRequest("GET", query_url, nil)
	req.Header.Add("Authorization", bearer)

	// Call Yelp API
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Print(err)
		return nil, errors.New("Call to Yelp detials API failed")
	}

	// Process response into map
	var result interface{}

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(body, &result)
	if err != nil {
		log.Print(err)
		return nil, errors.New("Parsing response from Yelp details API failed")
	}

	return result.(map[string]interface{}), nil
}

func getYelpReviews(yelpID string) ([]interface{}, error) {

	config := getConfig()
	query_url := "https://api.yelp.com/v3/businesses/" + yelpID + "/reviews"
	bearer := "Bearer " + config.YelpKey

	req, _ := http.NewRequest("GET", query_url, nil)
	req.Header.Add("Authorization", bearer)

	// Call Yelp API
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Print(err)
		return nil, errors.New("Call to Yelp reviews API failed")
	}

	// Process response into map
	var result interface{}

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(body, &result)
	if err != nil {
		log.Print(err)
		return nil, errors.New("Parsing response from Yelp reviews API failed")
	}

	return result.(map[string]interface{})["reviews"].([]interface{}), nil
}
