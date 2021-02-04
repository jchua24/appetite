const axios = require('axios');

async function getYelpDetails(restaurant_id) { 
    const query_url = process.env.YELP_ENDPOINT + restaurant_id;
    const bearer_string = 'Bearer ' +  process.env.YELP_KEY;

    const headers = {
        'Authorization': bearer_string, 
        'Access-Control-Allow-Origin': '*'
    }

    try  {
        //make get request to get specific restaurant data
        const details = await axios.get(query_url, {headers: headers});
        return details.data;

    } catch(err) {
        throw err; 
    }

}

async function getYelpReviews(restaurant_id) {

    const query_url = process.env.YELP_ENDPOINT + restaurant_id + "/reviews";
    const bearer_string = 'Bearer ' +  process.env.YELP_KEY;

    const headers = {
        'Authorization': bearer_string, 
        'Access-Control-Allow-Origin': '*'
    }

    try  {
        //make get request to get specific restaurant reviews
        const reviews = await axios.get(query_url, {headers: headers});
        return reviews.data;

    } catch(err) {
        throw err; 
    }

}


module.exports = {getYelpDetails, getYelpReviews};