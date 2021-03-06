const express = require('express');
const router = express.Router() 

// import the user model
const { User } = require("../db/models/user_model");
const { Restaurant } = require("../db/models/restaurant_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

const {authenticateToken} = require('../service/auth/authentication');

// get individual user data 
router.get("/:id", authenticateToken, async (req, res) => {

    const user = await User.findOne({ _id: req.params.id }).exec();

    if(user != null) {
        return res.send(user); 
    } else {
        return res.sendStatus(404); //user not found
    }

});

//return restaurant info on all restaurants in the specified user's superlikes history
router.get("/superlike/:id", authenticateToken, async (req, res) => {

    //search collections for user and restaurant
    const user = await User.findOne({ _id: req.params.id }).exec();
  
    if(user == null) {
        return res.sendStatus(404);
    } 
    
    //search restaurant collection with IDs
    const restaurants = await Restaurant.find().where('_id').in(user.superLikes).exec();
    
    if (restaurants != null) {
        return res.send(restaurants); 
    } else {
        return res.send([]); 
    }

});


// add super like for specific user (restaurantId provided in body)
router.post("/superlike/:id", authenticateToken, async (req, res) => {

    //search collections for user and restaurant
    const user = await User.findOne({ _id: req.params.id }).exec();
    const restaurant = await Restaurant.findOne({_id: req.body.restaurantId}).exec(); 

    if(user == null || restaurant == null) {
        return res.sendStatus(404); //user and/or restaurant not found
    } 
    
    try { 
        //add restaurant to user's list superlike history
        await User.updateOne({_id: user._id},  { $push: { superLikes: restaurant._id }});
        return res.sendStatus(200); 
    } catch(err) {
        console.log(err);
        return res.sendStatus(400); //unable to insert superlike, bad request
    }

});


module.exports = router; 