/*
Restaurant mongoose model 
*/
const mongoose = require('mongoose');

//prevent mongoose from automatically pluralizing collection name
mongoose.pluralize(null);


// create a restaurant schema
const restaurantSchema = mongoose.Schema({
    yelpid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    numratings: {
        type: Number,
        required: false
    },
    imageURL: {
        type: Array,
        required: true
    },
    lat: {
        type: Number, 
        required: false
    }, 
    long: {
        type: Number, 
        required: false
    }, 
    address: {
        type: String, 
        required: true
    },
    categories: {
        type: Array, 
        required: true
    },
    price: {
        type: Number, 
        required: true
    },
    weight: {
        type: Number, 
        required: true
    },
    topreview: {
        type: Object, 
        required: false
    },
    hours: {
        type: Object,
        required: false
    }, 
    phonenumber: {
        type: String, 
        required: false
    }
});

restaurantSchema.set('toJSON', {
    virtuals: true
});


// create an restaurant model using the schema
const Restaurant = mongoose.model('restaurant', restaurantSchema);

module.exports = { Restaurant };