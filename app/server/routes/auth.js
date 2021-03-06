/* 
Handles endpoints for user authentication and sign-up
*/ 

const express = require('express');
const router = express.Router() 

// import the user model
const { User } = require("../db/models/user_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

const {hashPassword, verifyPassword, generateAccessToken} = require("../service/auth/authentication"); 
const {categories} = require('../misc/categories');



//auth endpoints - authenticate existing user 
router.post("/", async (req, res) => {

    if(!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
        return res.sendStatus(400); // bad request 
    }   

    //attempt to attrieve existing user based on email
    const email = req.body.email.trim().toLowerCase(); 
    const existingUser = await User.findOne({ email: email }).exec();

    if(existingUser != null) {

        //check if password matches, and return access token + id it does
        const match = verifyPassword(req.body.password, existingUser.password); 

        if(match) {
            const accessToken = generateAccessToken(email, existingUser.name); 

            //required by frontend to make future api calls
            const response = {
                id: existingUser._id, 
                access_token: accessToken
            }
            
            return res.send(response);
        }
         
        return res.sendStatus(401); // password doesn't match, unauthorized
    } else {
        console.log("user does not exist");
        return res.sendStatus(404); //user not found, send error         
    }
 
});


//adding new user to platform 
router.post("/add", async (req, res) => {

    if(!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('name') ) {
        return res.sendStatus(400); // bad request  
    }   

    const email = req.body.email.trim().toLowerCase(); 

    //attempt to retrieve user from db  
    const existingUser = await User.findOne({ email: email }).exec();

    if (existingUser == null) { //create new user 
    
        try {

            const hash = hashPassword(req.body.password); 
            const newUser = new User({name: req.body.name, email: email, password: hash, categories: categories});

            //persist user and generate access token
            const userAdded = await newUser.save();
            const accessToken = generateAccessToken(userAdded.email, userAdded.name); 
    
            //required by frontend to make future api calls
            const response = {
                id: userAdded._id, 
                access_token: accessToken
            }
    
            return res.send(response);
        }
        catch (err) {
            console.log("failed to persist new user: " + err);
            return res.sendStatus(400);
        }

    } else {
        console.log("user already exists");
        return res.sendStatus(409); //user already exists, send error         
    }

});


module.exports = router; 
