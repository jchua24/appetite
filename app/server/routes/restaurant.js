
const express = require('express');
const moment = require('moment');
const router = express.Router() 

// import the restaurant model
const { Restaurant } = require("../db/models/restaurant_model");
const { User } = require("../db/models/user_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

const {sampleRestaurants, applySigmoid, normalizeWeights, buildStacks, buildQuery} = require('../service/restaurant/recommendation');
const {authenticateToken} = require('../service/auth/authentication');
const {getYelpDetails, getYelpReviews} = require('../service/yelp/yelp') 


//getting all restaurants
router.post("/", authenticateToken, async (req, res) => {

    //construct MongoDB query from user search params
    const queryBody = buildQuery(req.body); 

    //apply query, select 100 random restaurants that meet the query criteria, then sort by descending weight
    const pipeline = [
        {"$match": queryBody}, 
        {"$sample": {"size": 100}}, 
        {"$sort": {"weight": -1}}
    ]

    //execute query - aggregate returns restaurant data
    const restaurant_data = await Restaurant.aggregate(pipeline).exec();   

    //get user 
    const user = await User.findOne({ _id: req.body["userid"] }).exec();

    if(restaurant_data != null && user != null) {
        //cast restaurant data to Restaurant model instances
        let restaurants = restaurant_data.map(data => new Restaurant(data));
        
        // ------ recommendation algorithm (with helpers) ------- 

        let categoryProbabilities = applySigmoid(user.categories);

        normalizeWeights(categoryProbabilities);  

        let stacks = buildStacks(Object.keys(user.categories), restaurants, categoryProbabilities); 

        let sampledRestaurants = sampleRestaurants(categoryProbabilities, stacks); 

        //return restaurants
        return res.send(sampledRestaurants); 
    } else {
        return res.status(404); //no restaurants found, or user not found
    }
});


//logging a swipe on a particular restaurant
router.put("/swipe/:restaurantID", authenticateToken, async (req, res) => {

    const restaurantID = req.params.restaurantID; 

    if (!req.body.hasOwnProperty('userID') || !req.body.hasOwnProperty('weight') || restaurantID == null) {
        return res.sendStatus(400); //bad request 
    }

    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantID }).exec();
    const user = await User.findOne({ _id: req.body.userID }).exec();

    if(restaurant == null || user == null) {
        return res.sendStatus(404); //user and/or restaurant not found 
    }

    try {
        //update overall weighting of restaurant 
        await Restaurant.updateOne({_id: restaurantID},  { $set: { weight: parseInt(restaurant.weight) + parseInt(req.body.weight)}});
    } catch (err)  {
        console.log(err);
        return res.sendStatus(500); //db error 
    } 

    //get the categories of the restaurant and update their values in the user's categories weighting based on the value of the swipe 
    const commonCategories = restaurant.categories.filter(value => Object.keys(user.categories).includes(value));

    commonCategories.forEach(function(category) {
        user.categories[category] += req.body.weight;       
    })

    user.markModified('categories');

    console.log("new user categories: " + JSON.stringify(user.categories)); 

    try {
        await user.save();
        return res.sendStatus(200); //update successful
    } catch (err){
        console.log(err); 
        return res.sendStatus(500); //db error  
    }

});

//get details for specific restaurant
router.get("/:id", authenticateToken, async (req, res) => {
    
    try {

        const restaurant = await Restaurant.findOne({ _id: req.params.id }).exec();

        if(restaurant == null) {
            return res.sendStatus(404); //restaurant not found 
        }

        //check if restaurant exists in db
        const details = await getYelpDetails(restaurant.yelpid);     

        //copy image urls over 
        if("photos" in details && details["photos"].length > 0) {
            restaurant["imageURL"] = details["photos"]; 
        } else {
            restaurant["photos"] = []; 
        }

        restaurant["hours"] = {};
        
        //parse and populate store hours 
        if ("hours" in details && details["hours"].length > 0) {

            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; 
        
            details["hours"][0]["open"].forEach(function (day, i) {
                let start = day["start"];
                let end = day["end"];

                let start_str = start.substring(0, start.length-2) +  ":" + start.substring(start.length-2, start.length); 
                let end_str = end.substring(0, end.length-2) +  ":" + end.substring(end.length-2, end.length); 
                
                var start_time = moment(start_str, 'HH:mm').format('LT');
                var end_time = moment(end_str, 'HH:mm').format('LT');

                restaurant["hours"][days[i]] = start_time + " - " + end_time; 
            });

            days.forEach(function(dayName, i) {
                if(!(dayName in restaurant["hours"])) {
                    restaurant["hours"][dayName] = "Closed";
                }
            });
        }

        if ("display_phone" in details) {
            restaurant["phonenumber"] = details["display_phone"];
        }

        //make request to get yelp user reviews 
        const reviews = await getYelpReviews(restaurant.yelpid); 

        //extract contents of most recent review 
        if("reviews" in reviews && reviews["reviews"].length > 0) {

            restaurant["topreview"] = {
                "username": reviews["reviews"][0]["user"]["name"],
                "reviewtext": reviews["reviews"][0]["text"], 
                "rating": reviews["reviews"][0]["rating"],
                "time_created": reviews["reviews"][0]["time_created"] 
            }
        }

        return res.send(restaurant);
    } catch (err) {
        console.log(err);
        return res.sendStatus(400); 
    }

});


module.exports = router; 