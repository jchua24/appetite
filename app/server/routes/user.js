const express = require('express');
const router = express.Router() 

// import the user model
const { User } = require("../db/models/user_model");

// mongoose and mongo connection
const { mongoose } = require("../db/mongoose");
mongoose.set('useFindAndModify', false); // for some deprecation issues

// get individual user data 
router.get("/", async (req, res) => {

    User.find().then(
        user => {
            res.send({ user }); // can wrap in object if want to add more properties
        },
        error => {
            res.status(500).send(error); // server error
        }
    );

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