const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 5000;

const dotenv = require("dotenv");
// get config vars
dotenv.config();

//allows for the parsing of request bodies 
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb', extended: true}))


//import router object
const router = require('./routes/routes')
app.use(router);

// test route 
app.get("/test", async (req, res) => {
    res.send("testing server!"); 
});


app.listen(port, () => {
    console.log(`listening on port ${port}`)
});


