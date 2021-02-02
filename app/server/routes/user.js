const express = require('express');
const router = express.Router() 


// get individual user data 
router.get("/", async (req, res) => {
    res.send("getting individual user data!"); 
});

//get superlikes of user 
router.get("/superlikes", async (req, res) => {
    res.send("getting all superlikes for user"); 
});


// add super like for specific user 
router.get("/superlike", async (req, res) => {
    res.send("testing server!"); 
});



module.exports = router; 