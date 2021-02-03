
const express = require('express');
const router = express.Router() 

// import the restaurant model
const { Restaurant } = require("../db/models/restaurant_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues


//getting all restaurants
router.get("/", async (req, res) => {
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
router.get("/swipe", async (req, res) => {
    res.send("logging swipe on specific restaurant"); 
});

//logging a swipe on a particular restaurant
router.get("/id", async (req, res) => {
    res.send("getting data on specific restaurant"); 
});


module.exports = router; 