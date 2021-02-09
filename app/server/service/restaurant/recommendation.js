/* 
Helper functions required to generate restaurants based on search params & previous swipe history. 
*/ 



//step 3: takes the input dict of weightings and returns a new dict after applying sigmoid function to each key-pair 
exports.applySigmoid = (categories) => {
    let sigmoid_categories = {} 

    Object.keys(categories).forEach((key) => {
        sigmoid_categories[key] = sigmoid(categories[key]); 
    })

    //perform calculations to define "other" probability 
    let sum = 0; 
    let num_categories = (Object.keys(sigmoid_categories).length); 


    Object.keys(sigmoid_categories).forEach((key) => {
        sum += sigmoid_categories[key]; 
    })
 
    sigmoid_categories["other"] = sum / num_categories; 

    return sigmoid_categories; 
}


//step 4: normalize the weights in each key-value category pair 
exports.normalizeWeights = (categories) => {
    let multiplier = 0;

    Object.keys(categories).forEach((key) => {
        multiplier += categories[key];
    })

    Object.keys(categories).forEach((key) => {
        categories[key] /= multiplier;
    })
}

//step 5: put each restaurant in a queue corresponding to their category
exports.buildStacks = (categoryNames, restaurants, categoryProbabilities) => {
    
    //initialize stack for every category
    let stacks = {} 
    categoryNames.forEach((category) => {
        stacks[category] = [];
    })
    stacks["other"] = []; 

    //put each restaurant in stack(s) based on categories
    restaurants.forEach((restaurant) => {
        let categorized = false;

        restaurant.categories.forEach((restCategory) => {
            if(restCategory in stacks) { //category matches user choices
                stacks[restCategory].push(restaurant); 
                categorized = true;
            }
        }) 

        if(!categorized) { //add to "other category"
            stacks["other"].push(restaurant); 
        }
    })

    //set probabilities to 0 for all categories that are not represented in the sampled restaurants
    Object.keys(stacks).forEach((category) => {

        if(stacks[category].length == 0) {
            categoryProbabilities[category] = 0.0; //set probability to 0
            delete stacks[category]; //remove stack 
        }
    })

    return stacks; 
}

//step 6: sample restaurants and return final ordering
exports.sampleRestaurants = (probabilities, restaurantStacks) => {
    
    //get total number of restaurants
    let totalRestaurants = 0; 

    Object.keys(restaurantStacks).forEach((key) => {
        totalRestaurants += restaurantStacks[key].length; 
    })

    console.log(totalRestaurants);

    let finalStack = []; 
    let ids = new Set(); 

    for(let i = 0; i < totalRestaurants; i++) { //populate final restaurant ordering, one at a time
        try{
            //sample a random category based on probabilities, and pop a restaurant off the stack from that category
            let category = sampleCategory(probabilities); 
            let restaurant = restaurantStacks[category].pop(); 

            if(!ids.has(restaurant._id)) { //add resto to final stack if not already in it 
                ids.add(restaurant._id); 
                finalStack.push(restaurant); 
            }

            //check if stack that was popped from is now empty, and adjust probabilities if necessary
            if(restaurantStacks[category].length == 0) {
                probabilities[category] = 0; 
                this.normalizeWeights(probabilities);
            }
        } catch (err){
            console.log(err); 
        }
    }

    return finalStack; 

}


// -------- other helpers ----------- 

//builds a search query based on user search params, to be processed by db  
exports.buildQuery= (params) => {

    let queries = []; 

    if("categories" in params && params["categories"].length > 0) {
        queries.push({"categories": {"$in" : params["categories"]}})
    }

    if("price" in params && params["price"] > 0) {
        queries.push({"price": {"$eq" : params["price"]}})
    }

    if("radius" in params && params["radius"] > 0) {
        let radius = getRadius(params) 
        queries.push({"lat": {"$gte" : radius["lowlat"], "$lte": radius["upperlat"]}})
        queries.push({"lng": {"$gte" : radius["lowlng"], "$lte": radius["upperlng"]}})
    }

    if(queries.length == 0) {
        return {} 
    }

    //put all queries together and return as object
    return {"$and" : queries}
} 

//returns lat long based on user-specified radius preference and user lat/long 
const getRadius = (params) => {
    const radiusEarth = 6378.00; //in km
    const userLat = params["lat"];
    const userLong = params["lng"];
    const userRadius = params["radius"]

    let radiusValues = {} 
    
    //calculate upper & lower bounds of radius circle
    radiusValues["lowlat"] = userLat - (userRadius/radiusEarth)*(180/Math.PI);
	radiusValues["upperlat"] = userLat + (userRadius/radiusEarth)*(180/Math.PI);
	radiusValues["lowlng"] = userLong - (userRadius/radiusEarth)*(180/Math.PI)/Math.cos(userLat*Math.PI/180);
	radiusValues["upperlng"] = userLong + (userRadius/radiusEarth)*(180/Math.PI)/Math.cos(userLat*Math.PI/180);

    return radiusValues 
}

//sigmoid function 
const sigmoid = (input_val) => {
    
    let maxVal = 0.5; 
    let steepness = 0.2; 
    let offset = 0.25; 

    return (maxVal / (1 + Math.exp(-steepness * input_val))) + offset

}

//pick a category using a uniformly distributed number + category weights 
const sampleCategory = (probabilities) => {
    
    let categories = []; 

    //get list of probabilities 
    Object.keys(probabilities).forEach((category) => {
        
        const catProbability = parseInt(probabilities[category] * 100) 

        for(let i = 0; i < catProbability; i++) {
            categories.push(category); 
        }
    })

    //get random index 
    let randomIndex = parseInt(Math.random() * categories.length); //randomly generated number
    let randomCategory = categories[randomIndex]; 

    return randomCategory; 
}




