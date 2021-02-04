import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from "../env";
import client from "./axios";

//api calls for retrieving user details, getting a user's list of previous superlikes, superliking a restaurant

export const apiGetUserDetails = async () => {

  try {
    const authToken = await AsyncStorage.getItem("authToken");
    const userId = await AsyncStorage.getItem("userId");

    const res = await client.get(env.apiUrl + 'user/' + userId, {headers: {"Authorization" : `Bearer ${authToken}`}});

    if (!res || res.status != 200) {
      throw 'Unable to retrieve user details.';
    } 

    console.log("user details: " + res.data.name)

    return res.data;

  } catch (err) {
    throw err;
  }
}


export const apiGetSuperLikes = async () => {

    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");
  
      const res = await client.get(env.apiUrl + 'user/superlike/' + userId, {headers: {"Authorization" : `Bearer ${authToken}`}});

      if (!res || res.status != 200) {
        throw 'Unable to retrieve superlikes.';
      }

    } catch (err) {
      throw err;
    }
}

export const apiSuperLikeRestaurant = async (restaurantId) => {

    try {
  
      const authToken = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      const res = await client.post(env.apiUrl + 'user/superlike/' + userId, {restaurantId: restaurantId}, {headers: {"Authorization" : `Bearer ${authToken}`}});

      if (!res || res.status != 200) {
        throw `Unable to record superlike of restaurant ${restaurantId} for user ${userId}.`;
      } 
        
      console.log(`Successfully recorded superlike of restaurant ${restaurantId} for user ${userId}.`);
  
    } catch (err) {
      throw err; 
    }
}

export const userLogOut = async (navigation) => {
    try {
        //removes auth token and id, to allow other users to sign in 
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userId");
    }
    catch(exception) {
      console.log("Unable to remove authtoken or userid on logout.")
    } finally {
      console.log("logging out!");
      navigation.navigate("Auth"); 
    }
}


