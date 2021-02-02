import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from "../env";

//api calls for login and signout functionality

export const apiLogin = async (email: string, password: string) => {
  try {
    const user = await axios.post(env.apiUrl + 'user/auth', {
      email,
      password,
    });

    if (!user || user.status != 200 || typeof(user.data) == "string") {
      throw 'User not found.';
    }

    return user.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const apiSignup = async (email: string, password: string, name: string) => {

  console.log("attempting to sign up w/ email: " + email + " , password: " + password + " , name: " + name)

    try {
      const user = await axios.post(env.apiUrl  + 'user/add', {
        email,
        password,
        name
      });

      if (!user || user.status != 200 || typeof(user.data) == "string") {
        throw 'Could not create new user.';
      }

      return user.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
};
