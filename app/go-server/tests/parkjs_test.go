package tests

import (
	"testing"
	"fmt"

	"github.com/csc301-fall-2020/team-project-31-appetite/server/models"
	parkjs "github.com/csc301-fall-2020/team-project-31-appetite/server/api"
	queue "github.com/golang-collections/go-datastructures/queue"
)

func TestSigmoid(t *testing.T) {
	numbers := []float64{0.0, 10.0, 100.0, -15.0}
	expected := []string{"0.500000", "0.690399", "0.750000", "0.273713"}

	t.Run("Test Sigmoid Helper", testSigmoidHelper(numbers, expected))

	categories := []string{"a", "b", "c", "d"}
	categoryMap := map[string]int{
		"a": 0,
		"b": 10,
		"c": 100,
		"d": -15,
	}

	t.Run("Test Apply Sigmoid to Map", testApplySigmoid(categoryMap, categories, expected))
}

func testSigmoidHelper(testNumbers []float64, expected []string) func(*testing.T) {
	return func(t *testing.T) {
		for index, number := range testNumbers {
			result := fmt.Sprintf("%.6f", parkjs.Sigmoid(number))
			if (result != expected[index]) {
				t.Errorf(fmt.Sprintf("Sigmoid was wrong on case %v, expected %s got %s", index + 1, expected[index], result))
			}
		}
	}
}

func testApplySigmoid(categoryMap map[string]int, categories []string, expected []string) func(*testing.T) {
	return func(t *testing.T) {
		ret := parkjs.ApplySigmoid(&categoryMap)
		for i := range categories {
			result := fmt.Sprintf("%.6f", ret[categories[i]])
			if (result != expected[i]) {
				t.Errorf(fmt.Sprintf("ApplySigmoid was wrong on case %v, expected %s got %s", i + 1, result, expected[i]))
			}
		}
	}
}

func TestNormalizeWeights(t *testing.T) {
	t.Run("Test Normalizing Single Category", testNormalizeSingle())
	t.Run("Test Normalizing Multiple Categories", testNormalizeMultiple())
}

func testNormalizeSingle() func(*testing.T) {
	return func(t *testing.T) {
		sampleMap := map[string]float64{
			"val": 20.0,
		}
		expectedMap := map[string]float64{
			"val": 1.0,
		}

		parkjs.NormalizeWeights(&sampleMap)

		if (sampleMap["val"] != expectedMap["val"]) {
			t.Errorf(fmt.Sprintf("Single category weight was wrong, expected %v got %v", expectedMap["val"], sampleMap["val"]))
		}
	}
}

func testNormalizeMultiple() func(*testing.T) {
	return func(t *testing.T) {
		sampleMap := map[string]float64{
			"a": 60.0,
			"b": 20.0,
			"c": 10.0,
			"d": 10.0,
		}
		expectedMap := map[string]float64{
			"a": 0.6,
			"b": 0.2,
			"c": 0.1,
			"d": 0.1,
		}

		parkjs.NormalizeWeights(&sampleMap)

		for category, weight := range sampleMap {
			if (expectedMap[category] != weight) {
				t.Errorf(fmt.Sprintf("Weight was wrong for category %s, expected %v got %v", category, expectedMap[category], weight))
			}
		}
	}
}

func TestBuildQueues(t *testing.T) {
	categories := []string{"a", "b", "c"}
	restaurants := []models.Restaurant{
		models.Restaurant{
			Name:       "TestRestA",
			Categories: []string{"a"},
		},
		models.Restaurant{
			Name:       "TestRestB",
			Categories: []string{"b"},
		},
		models.Restaurant{
			Name:       "TestRestAC",
			Categories: []string{"a", "c"},
		},
		models.Restaurant{
			Name:       "TestRestO",
			Categories: []string{"notacategory"},
		},
	}

	queues := parkjs.BuildQueues(categories, restaurants)

	t.Run("Test queue correctness category a", testBuildQueuesA(queues["a"]))
	t.Run("Test queue correctness category b", testBuildQueuesB(queues["b"]))
	t.Run("Test queue correctness category c", testBuildQueuesC(queues["c"]))
	t.Run("Test queue correctness category other", testBuildQueuesO(queues["other"]))
}

func testBuildQueuesA(q *queue.Queue) func(*testing.T) {
	return func(t *testing.T) {
		if (q.Len() != int64(2)) {
			t.Errorf(fmt.Sprintf("Length of category a queue was wrong, expected %v got %v", 2, q.Len()))
		}

		var restaurants []interface{}
		restaurants, _ = q.Get(2)

		firstRestaurant := restaurants[0].(models.Restaurant)
		if (firstRestaurant.Name != "TestRestA") {
			t.Errorf(fmt.Sprintf("First restaurant in queue is wrong, expected %s got %s", "TestRestA", firstRestaurant.Name))
		}
		secondRestaurant := restaurants[1].(models.Restaurant)
		if (secondRestaurant.Name != "TestRestAC") {
			t.Errorf(fmt.Sprintf("Second restaurant in queue is wrong, expected %s got %s", "TestRestAC", secondRestaurant.Name))
		}
	}
}

func testBuildQueuesB(q *queue.Queue) func(*testing.T) {
	return func(t *testing.T) {
		if (q.Len() != int64(1)) {
			t.Errorf(fmt.Sprintf("Length of category a queue was wrong, expected %v got %v", 1, q.Len()))
		}

		var restaurants []interface{}
		restaurants, _ = q.Get(1)

		firstRestaurant := restaurants[0].(models.Restaurant)
		if (firstRestaurant.Name != "TestRestB") {
			t.Errorf(fmt.Sprintf("First restaurant in queue is wrong, expected %s got %s", "TestRestB", firstRestaurant.Name))
		}
	}
}

func testBuildQueuesC(q *queue.Queue) func(*testing.T) {
	return func(t *testing.T) {
		if (q.Len() != int64(1)) {
			t.Errorf(fmt.Sprintf("Length of category a queue was wrong, expected %v got %v", 1, q.Len()))
		}

		var restaurants []interface{}
		restaurants, _ = q.Get(1)

		firstRestaurant := restaurants[0].(models.Restaurant)
		if (firstRestaurant.Name != "TestRestAC") {
			t.Errorf(fmt.Sprintf("First restaurant in queue is wrong, expected %s got %s", "TestRestAC", firstRestaurant.Name))
		}
	}
}

func testBuildQueuesO(q *queue.Queue) func(*testing.T) {
	return func(t *testing.T) {
		if (q.Len() != int64(1)) {
			t.Errorf(fmt.Sprintf("Length of category a queue was wrong, expected %v got %v", 1, q.Len()))
		}

		var restaurants []interface{}
		restaurants, _ = q.Get(1)

		firstRestaurant := restaurants[0].(models.Restaurant)
		if (firstRestaurant.Name != "TestRestO") {
			t.Errorf(fmt.Sprintf("First restaurant in queue is wrong, expected %s got %s", "TestRestO", firstRestaurant.Name))
		}
	}
}
