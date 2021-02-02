
const express = require('express');
const router = express.Router() 


//logging a swipe on a particular restaurant
router.get("/swipe", async (req, res) => {
    res.send("logging swipe on specific restaurant"); 
});

//getting all restaurants
router.get("/", async (req, res) => {
    res.send("getting restaurants"); 
});

//logging a swipe on a particular restaurant
router.get("/id", async (req, res) => {
    res.send("getting data on specific restaurant"); 
});


module.exports = router; 