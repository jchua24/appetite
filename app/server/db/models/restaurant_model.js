/*
Restaurant mongoose model 
*/
const mongoose = require('mongoose');

//prevent mongoose from automatically pluralizing collection name
mongoose.pluralize(null);

// create a restaurant schema
const restaurantSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: false
    },
    password: {
        type: Number,
        required: false
    },
    superlikes: {
        type: Array, 
        required: false
    }, 
    categories: {
        type: Object, 
        required: false
    }
});

// create an restaurant model using the schema
const Restaurant = mongoose.model('restaurant', restaurantSchema);

module.exports = { Restaurant };