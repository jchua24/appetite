
const express = require('express');
const moment = require('moment');
const router = express.Router() 

// import the restaurant model
const { Restaurant } = require("../db/models/restaurant_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

const {authenticateToken} = require('../service/auth/auth_helpers');
const {getYelpDetails, getYelpReviews} = require('../service/yelp/yelp') 

//getting all restaurants
router.get("/", authenticateToken, async (req, res) => {
    Restaurant.find().then(
        restaurant => {
            res.send({ restaurant }); 
        },
        error => {
            res.status(500).send(error); // server error
        }
    );
});


//logging a swipe on a particular restaurant
router.put("/swipe/:restaurantId", authenticateToken, async (req, res) => {

    const restaurantId = req.params.restaurantID; 

    if (!req.body.hasOwnProperty('userId') || !req.body.hasOwnProperty('weight') || restaurantId == null) {
        return res.sendStatus(400); //bad request 
    }

    const restaurant = await Restaurant.findOne({ _id: req.params.id }).exec();
    const user = await User.findOne({ _id: req.params.id }).exec();

    if(restaurant == null || user == null) {
        return res.sendStatus(404); //user and/or restaurant not found 
    }

    //update overall weighting of restaurant 
    const updateRestaurant = await Restaurant.updateOne({_id: restaurantId},  { $push: { weight: restaurant.weight + req.body.weight}});
        
    if(updateRestaurant == null ) {
        return res.sendStatus(400); //unable to update restaurant weighting, bad request
    }

    //get the categories of the restaurant and update their values in the user's preferences based on the value of the swipe 
    const commonCategories = restaurant.categories.filter(value => Object.keys(user.categories).includes(value));

    for(const category in commonCategories) {
        user.categories[category] += weight;         
    }

    const updatedUser = await newUser.save();
    
    if(updatedUser == null) {
        return res.sendStatus(400); 
    } else {
        return res.sendStatus(200); //update successful
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