/*
User
*/
const mongoose = require('mongoose');

//prevent mongoose from automatically pluralizing collection name
mongoose.pluralize(null);

// create an user schema
const userSchema = mongoose.Schema({
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
    longitude: {
        type: Number,
        required: false
    },
    superLikes: {
        type: Array, 
        required: false
    }, 
    categories: {
        type: Object, 
        required: false
    }
});

userSchema.set('toJSON', {
    virtuals: true
});

// create an user model using the schema
const User = mongoose.model('user', userSchema);

module.exports = { User };