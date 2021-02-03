/* 

Handles endpoints for 

*/ 


const express = require('express');
const router = express.Router() 


//auth endpoints - logging a swipe on a particular restaurant
router.get("/", async (req, res) => {

    //res.send("login endpoint"); 
});


//adding new user to platform 
router.post("/add", async (req, res) => {

    if(!req.hasOwnProperty('email') ||  !req.hasOwnProperty('name') || !req.hasOwnProperty('password')) {
        res.sendStatus(400) // bad request 
    }   

    console.log("Email: " + req.body.email);
    console.log("Name: " + req.body.name);
    console.log("password: " + req.body.password);


    // const token = generateAccessToken({ username: req.body.username });
    // res.json(token);

    res.send("new user sign up"); 
});



module.exports = router; 
