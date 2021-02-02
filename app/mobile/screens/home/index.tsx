import React, {useRef, useState} from 'react';
import { StyleSheet, SafeAreaView, View, Dimensions, Image, ActivityIndicator} from 'react-native';
import * as Icon from '@expo/vector-icons'
import Swiper from 'react-native-deck-swiper';
import {Card, CircleButton} from "../../components";
import {apiGetRestaurants, apiSwipeOnRestaurant} from "../../api/restaurantAPI";
import {apiSuperLikeRestaurant, apiGetSuperLikes, apiGetUserDetails, userLogOut} from "../../api/userAPI";
import colors from '../../constants/Colors';

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
]);

const Home = ({route, navigation}) => {
    const useSwiper = useRef(null)
    const [isLoading, setLoading] = useState(true);
    const [restaurantCards, setCards] = useState([]);
    const [cuisinePreferences, setCuisinePreferences] = useState([])
    const [searchRadius, setSearchRadius] = useState(1.5)
    const [pricePreference, setPricePreference] = useState(0)
    const [buttonsDisabled, setButtonsDisabled] = React.useState(true)
    const [superLikes, setSuperLikes] = React.useState([]); 
    const [userDetails, setUserDetails] = React.useState([]); 
 

    React.useEffect(() => {

        if(route.params.login == true) {
          fetchUserDetails(); 
          fetchSuperLikes();  
        } 

    }, [navigation]);

    React.useEffect(() => {

      setLoading(true);
      fetchRestaurants(cuisinePreferences, searchRadius, pricePreference);

    }, [cuisinePreferences, searchRadius, pricePreference]);


    //functions for fetching data about restaurants, superlikes and user details

    async function fetchRestaurants(cuisine, radius, price) {
      setButtonsDisabled(true);
      
      try {

        const restaurants = await apiGetRestaurants(cuisine, radius, price);

        let cards = [];
        restaurants.forEach((restaurant) => {
          cards.push({
            title: restaurant["name"],
            description: restaurant["categories"],
            photo: {uri: restaurant["imageURL"][0]},
            address: restaurant["address"],
            rating: restaurant["rating"],
            price: restaurant["price"],
            id: restaurant["id"]
          });
        });
        
        setCards(cards)
        setLoading(false)
        setButtonsDisabled(false)
      }
      catch(err) {
        console.log(err)
        if (err.message === "auth invalid") {
          await userLogOut(navigation); 
        } else {
          if (err == "Restaurants not found") {
            alert("No restaurants found! Change preferences to see more.");
          }
         
          setCards([]);
          setLoading(false);
          setButtonsDisabled(true);
        }
      }
    } 


    async function fetchSuperLikes() {
      try {
        let superlikes = await apiGetSuperLikes();
        setSuperLikes(superlikes);
      }
      catch(err) {
        console.log(err)
        if (err.message === "auth invalid") {
          await userLogOut(navigation); 
        } 
      } 
    }

    async function fetchUserDetails() {
      try {
        let userDetails = await apiGetUserDetails();
        setUserDetails(userDetails);
      }
      catch(err) {
        console.log(err)
        if (err.message === "auth invalid") {
          await userLogOut(navigation); 
        } 
      } 
    }


    //callback function after navigating from preferences page, updates the state on this page
    //the updating of the state triggers a React useEffect which fetches new restaurants with the updated preferences
    const updatePreferences = (cuisinePreferences, radius, pricePreference) => {       
      setSearchRadius(radius);
      setCuisinePreferences(cuisinePreferences);
      setPricePreference(pricePreference)
    } 


    //functions corresponding to swipe actions

    const onClickSuperlike = () => {
      if(!buttonsDisabled) {
        useSwiper.current.swipeTop(); 
      } 
    }

    const onClickDislike = () => {
      if(!buttonsDisabled) {
        useSwiper.current.swipeLeft();
      } 
    }
    const onClickLike = () => {
      if(!buttonsDisabled) {
        useSwiper.current.swipeRight();
      } 
    }

    const recordLeftSwipe = (index) => {
      recordSwipe(restaurantCards[index].id, -1)
    }

    const recordRightSwipe = (index) => {     
      recordSwipe(restaurantCards[index].id, 1)
    }

    const recordSuperLike = async (index) => {
      try {
        await apiSuperLikeRestaurant(restaurantCards[index].id);
      }
      catch(err) {
        console.log(err)
        if (err.message === "auth invalid") {
          await userLogOut(navigation); 
        } 
      }

      fetchSuperLikes(); 

    }

    const recordSwipe = async (restaurantID, weight) => {
      try {
        await apiSwipeOnRestaurant(restaurantID, weight);
      }
      catch(err) {
        if (err.message === "auth invalid") {
          await userLogOut(navigation); 
        }
      }
    }

    return (
      
      <SafeAreaView style={styles.container}>        
          <View style={styles.header}> 
            <View> 
              <Icon.FontAwesome.Button  
                name="user-circle"
                color={colors.offWhite} 
                backgroundColor="transparent"
                size = {32}
                onPress={() => navigation.navigate('Profile', {userDetails: userDetails, superlikes: superLikes})} 
              />
            </View> 

            <View> 
              <Image
                style={styles.logo}
                source={require('../../assets/images/temp_logo.png')}
                backgroundColor="transparent"
              />
            </View> 

            <View> 
              <Icon.FontAwesome.Button  
                name="sliders"
                color={colors.offWhite} 
                backgroundColor="transparent"
                size = {32}
                onPress={() => navigation.navigate('Preferences', {onGoBack: updatePreferences, cuisinePreferences: [...cuisinePreferences], searchRadius: searchRadius, pricePreference: pricePreference})} 
              />
            </View> 

          </View>
     
          <View style={styles.swiper}> 
          
            {!isLoading && !buttonsDisabled && ( 
              <Swiper
                  ref={useSwiper}
                  cards={restaurantCards}
                  renderCard={(card) => <Card card={card} navigation = {navigation}/>}
                  onSwipedRight ={(index) => {recordRightSwipe(index)}}
                  onSwipedLeft={(index) => {recordLeftSwipe(index)}}
                  onSwipedTop={(index) => {recordSuperLike(index)}}
                  onSwipedAll={() => {alert('Viewed all restaurants! Change preferences to see more.')}}
                  backgroundColor={colors.darkGray}
                  infinite = {false}
                  verticalSwipe = {true}
                  stackSize= {3}
                  cardStyle={{
                    top: 20,
                    left: 15,
                    bottom: 20,
                    right: 15,
                    width: 'auto',
                    height: 'auto'
                  }}
                  disableBottomSwipe = {true}> 
              </Swiper>)}

              {isLoading && (
                <ActivityIndicator size="large" color={colors.green} />
              )}
          
          </View> 
          
          <View style={styles.footer}>
              <CircleButton name="x" Icon = {Icon.Feather} disabled={buttonsDisabled}
              color={colors.pink} onPress={() => onClickDislike()}
              />
              <CircleButton name="heart" Icon = {Icon.Entypo} disabled={buttonsDisabled}
              color={colors.purple} onPress={() => onClickSuperlike()}
              />
              <CircleButton name="like" Icon = {Icon.SimpleLineIcons} disabled={buttonsDisabled}
              color={colors.green} onPress={() => onClickLike()}
              />
          </View>
      </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignContent: 'center',
      flexDirection: "column", 
      backgroundColor: colors.darkGray
    },
    header: {
      flex: 0.1, 
      flexDirection: "row", 
      justifyContent: 'space-around', 
      alignItems: 'flex-end', 
    },
    swiper: {
      flexDirection: "column", 
      flex: 0.8, 
      justifyContent: 'center'
    },
    footer: {
      flex: 0.1, 
      flexDirection: "row",
      justifyContent: 'center',
      alignItems: 'flex-start',
      bottom: 20,
    }, 
    logo: {
      width: 52, 
      height: 52
    }
  });

export default Home;