/* 
Helper functions to facilitate JWT authentication. 
*/ 


const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

exports.authenticateToken = (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(400) // return bad request if there isn't any token
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return res.sendStatus(400)
      req.user = user
      next() // pass the execution off to whatever request the client intended
    })
}


exports.hashPassword = (input_str) =>  {

    const hash = bcrypt.hashSync(input_str, 10);
    
    if (hash) {
        return hash; 
    } else {
        throw err;
    }
} 

exports.verifyPassword = (input_str, hash) => {

    const passwordMatches = bcrypt.compareSync(input_str, hash); 

    if(passwordMatches) { //input string matches hash
        return true; 
    } 
    return false; 
} 
    

exports.generateAccessToken = (email, name) => {
    // expires after half and hour (1800s seconds = 30 minutes)
    return jwt.sign({to_sign: email + name}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}