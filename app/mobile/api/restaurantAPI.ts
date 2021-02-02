import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from "../env";
import client from "./axios";

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
 

//api calls for getting restaurants, restaurant details, and logging swipe actions on a restaurant card

const getLocationAsync = async () => {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    alert("Permission denied to access location. Defaulting to downtown Toronto.");
    return {latitude: 43.661282922175914, longitude: -79.39409611053878}; 
  } else {

    try{
      let location = await Location.getCurrentPositionAsync();
      return location.coords
    }catch(e){
      alert('We could not find your position. Please make sure your location service provider is on. Defaulting to downtown Toronto.');
      console.log('Error while trying to get location: ', e);
      return {latitude: 43.661282922175914, longitude: -79.39409611053878}; 
    }
  } 
};


export const apiGetRestaurants = async (cuisines, radius, price) => {

  try {

    //const { latitude , longitude } = await getLocationAsync(); 
    
    const { latitude , longitude } = {latitude: 43.661282922175914, longitude: -79.39409611053878};
    
    const authToken = await AsyncStorage.getItem("authToken");
    const userId = await AsyncStorage.getItem("userId");

    const requestBody = {
      "categories": cuisines,
      "lat": latitude,
      "lng": longitude, 
      "radius": radius, 
      "userid": userId
    }

    if(price >= 1 && price <= 4){
      requestBody["price"] = price
    } 
      
    const restaurants = await client.post(env.apiUrl + 'restaurant', requestBody, {headers: {"Authorization" : `Bearer ${authToken}`}});

    if (restaurants == undefined) {
      AsyncStorage.removeItem("authToken");
      throw new Error("auth invalid")
    }

    if (!restaurants || !restaurants.data || restaurants.data.length == 0 || typeof restaurants.data === 'string') {
      throw 'Restaurants not found';
    } 

    return restaurants.data;
  } catch (err) {
    throw err;
  }
}

export const apiGetDetails = async (id) => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");

    const details = await client.get(env.apiUrl + 'restaurant/'+id, {headers: {"Authorization" : `Bearer ${authToken}`}});

    if (!details || typeof details.data === 'string') {
      throw 'Restaurants not found';
    }

    return details.data;
  } catch (err) {
    throw err;
  }
}

export const apiSwipeOnRestaurant = async (restaurantID, weight) => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");
    const userId = await AsyncStorage.getItem("userId");

    const res = await client.put(env.apiUrl + 'restaurant/swipe/' + restaurantID, {"userId": userId, "weight": weight}, {headers: {"Authorization" : `Bearer ${authToken}`}});
    
    if (!res || res.status != 200) {
      throw 'Unable to record swipe with weight ' + weight + ' on restaurant ID ' + restaurantID + '.';
    }

    console.log('Successfully recorded swipe with weight ' + weight + ' on restaurant ID ' + restaurantID + '.');

  } catch (err) {
    throw err;
  }
}

