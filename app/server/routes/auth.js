
const express = require('express');
const router = express.Router() 

//auth endpoints - logging a swipe on a particular restaurant
router.get("/", async (req, res) => {
    res.send("login endpoint"); 
});

//logging a swipe on a particular restaurant
router.get("/add", async (req, res) => {
    res.send("new user sign up"); 
});



module.exports = router; 
