import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create();
// Interceptors take 2 parameters:
// Axios calls the first function if the request succeeds
// Axios calls the second function if the request fails
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 400) {
        AsyncStorage.removeItem("authToken")
        throw new Error("auth invalid")
    } else {
        err
    }
  }
)

export default client;