/* 
This object is appended to user documents in the database to track their preferences and its values are considered  
when populating suggested restaurants. 
*/

const categories = { 
    "American (Traditional)": 0,
    "Italian":                0,
    "Chinese":                0,
    "Korean":                 0,
    "Japanese":               0,
    "Greek":                  0,
    "Sandwiches":             0,
    "Bakeries":               0,
    "Pizza":                  0,
    "Salad":                  0,
    "Desserts":               0,
    "Coffee & Tea":           0,
    "Gluten-Free":            0,
    "Vegan":                  0
}

module.exports = {categories};