package api

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/auth"
	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"
	queue "github.com/golang-collections/go-datastructures/queue"

	"math"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/mgo.v2/bson"
)

func (data *DB) GetRestaurants(w http.ResponseWriter, r *http.Request) {
	err := auth.ValidateToken(w, r)
	if err != nil {
		return
	}

	var filter models.Filter
	postBody, _ := ioutil.ReadAll(r.Body)
	err = json.Unmarshal(postBody, &filter)
	if err != nil {
		log.Print("Error unpacking Filter data")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	query := getFindQuery(filter)
	match := bson.M{"$match": query}
	sample := bson.M{"$sample": bson.M{"size": 100}}
	sort := bson.M{"$sort": bson.M{"weight": -1}}
	pipeline := []bson.M{match, sample, sort}

	result, err := data.db.Collection("restaurant").Aggregate(data.ctx, pipeline)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	var restaurants []models.Restaurant
	if err = result.All(data.ctx, &restaurants); err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	userResult := data.db.Collection("user").FindOne(data.ctx, bson.M{"_id": filter.UserId})
	err = userResult.Err()
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(err.Error()))
		return
	}
	var user models.User
	userResult.Decode(&user)

	categoryWeights := make(map[string]int)
	categories := []string{}
	for category, weight := range user.Categories {
		categoryWeights[category] = weight
		categories = append(categories, category)
	}
	categoryProbabilities := ApplySigmoid(&categoryWeights)

	sum := 0.0
	count := float64(len(categoryProbabilities))
	for _, probability := range categoryProbabilities {
		sum += float64(probability)
	}
	categoryProbabilities["other"] = sum / count

	queues := BuildQueues(categories, restaurants)

	for category, queue := range queues {
		if queue.Len() == 0 {
			categoryProbabilities[category] = 0.0
		}
	}
	NormalizeWeights(&categoryProbabilities)

	sampledRestaurants := SampleRestaurants(categoryProbabilities, queues)

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	response, _ := json.Marshal(sampledRestaurants)
	w.Write(response)

}


func getRadius(filter models.Filter) models.Radius {
	var radius models.Radius

	rEarth := float64(6378)

	floatRadius := filter.Radius
	lat := filter.Lat
	lng := filter.Lng

	radius.LowLat = lat - (floatRadius/rEarth)*(180/math.Pi)
	radius.HiLat = lat + (floatRadius/rEarth)*(180/math.Pi)
	radius.LowLng = lng - (floatRadius/rEarth)*(180/math.Pi)/math.Cos(lat*math.Pi/180)
	radius.HiLng = lng + (floatRadius/rEarth)*(180/math.Pi)/math.Cos(lat*math.Pi/180)

	return radius
}

func getFindQuery(filter models.Filter) bson.M {
	var queries []bson.M
	if filter.Categories != nil && len(filter.Categories) > 0 {
		queries = append(queries, bson.M{"categories": bson.M{"$in": filter.Categories}})
	}

	if filter.Price > 0 {
		queries = append(queries, bson.M{"price": bson.M{"$eq": filter.Price}})
	}

	if filter.Radius > 0 {
		radius := getRadius(filter)
		queries = append(queries, bson.M{"lat": bson.M{"$gte": radius.LowLat, "$lte": radius.HiLat}})
		queries = append(queries, bson.M{"lng": bson.M{"$gte": radius.LowLng, "$lte": radius.HiLng}})
	}

	if len(queries) == 0 {
		return bson.M{}
	}

	query := bson.M{
		"$and": queries,
	}
	return query
}

// PARKJS STUFF

func SampleRestaurants(probabilities map[string]float64, restaurantsMap map[string]*queue.Queue) []models.Restaurant {
	totalRestaurants := 0 // total number of restaurants in
	for _, restaurants := range restaurantsMap {
		totalRestaurants += int(restaurants.Len())
	}

	restIDSet := make(map[primitive.ObjectID]bool)
	finalStack := []models.Restaurant{}

	for i := 0; i < totalRestaurants; i++ {
		category, err := SampleCategory(probabilities)
		if err != nil {
			log.Print(err)
		} else {
			restaurants, err := restaurantsMap[category].Get(1)
			if err != nil {
				log.Print(err)
			} else {
				restaurant := restaurants[0].(models.Restaurant)
				if !restIDSet[restaurant.ID] {
					restIDSet[restaurant.ID] = true
					finalStack = append(finalStack, restaurant)
				}
			}
			if restaurantsMap[category].Empty() {
				probabilities[category] = 0
				NormalizeWeights(&probabilities)
			}
		}
	}

	return finalStack
}

func SampleCategory(probabilities map[string]float64) (string, error) {
	x := rand.Float64()
	for category, probability := range probabilities {
		if x < probability {
			return category, nil
		}
		x -= probability
	}
	return "", errors.New("sampleCategory: probabilities do not sum to 1")
}

func ApplySigmoid(categories *map[string]int) map[string]float64 {
	// PARK.js Algo step 3, puts weightings through a sigmoid function
	var ret = make(map[string]float64)

	for key, value := range *categories {
		(ret)[key] = Sigmoid(float64(value))
	}

	return ret
}

func Sigmoid(valueIn float64) float64 {
	// Helper function - the sigmoid function itself
	var maxVal = 0.5
	var steepness = 0.2
	var offset = 0.25

	return (maxVal / (1 + math.Exp(-steepness*valueIn))) + offset
}

func NormalizeWeights(categories *map[string]float64) {
	// PARK.js Algo step 4, normalize sigmoid weights to probabilities
	var multiplier = 0.0
	for key := range *categories {
		multiplier += (*categories)[key]
	}

	for key := range *categories {
		(*categories)[key] /= multiplier
	}
}

func BuildQueues(categoriesSplice []string, restaurants []models.Restaurant) map[string]*queue.Queue {
	// PARK.js algo step 5, put restaurants into a queue
	var ret = make(map[string]*queue.Queue)
	var categories = make(map[string]bool)

	// Build hashmap for quicker lookup
	for _, category := range categoriesSplice {
		categories[category] = true
	}
	// Initialize splices in returned map
	for category := range categories {
		ret[category] = queue.New(int64(len(restaurants)))
	}
	ret["other"] = queue.New(int64(len(restaurants)))

	// Populate
	for _, restaurant := range restaurants {
		queued := false
		for _, restCategory := range restaurant.Categories {
			if _, ok := categories[restCategory]; ok {
				ret[restCategory].Put(restaurant)
				queued = true
			}
		}
		if !queued {
			ret["other"].Put(restaurant)
		}
	}

	return ret
}
