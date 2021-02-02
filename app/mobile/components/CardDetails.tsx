import React, {useState} from 'react';
import { View, Text, Image, Dimensions, ActivityIndicator, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import * as Icon from '@expo/vector-icons';
import {apiGetDetails} from "../api/restaurantAPI";
import colors from "../constants/Colors";
import layout from "../constants/Layout";
import Carousel from "react-native-snap-carousel";
import { RFValue } from "react-native-responsive-fontsize";

import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); 

// component to display additional information about a restaurant card 
// makes an additional api to get details such as store hours and Yelp reviews

const { height } = Dimensions.get('window')
export default function CardDetails({ route, navigation }) {
  const {title, description, photo, address, rating, price, id} = route.params;
  const [isLoading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  React.useEffect(() => {
    navigation.addListener('focus', () => {
      fetchDetails()});
    }, [navigation]);

  async function fetchDetails() {
    try {
      console.log(height)
      const details = await apiGetDetails(id);
      console.log(details)
      setDetails(details)
      setLoading(false)
    }
    catch(err) {
      if (err.message === "auth invalid") {
        navigation.navigate("Auth");
      }
    }
    }

    const renderItem = ({item, index}) => {
      console.log(item)
      return (
        <View style={styles.carousel} key={index}>
        <Image
          style={styles.image}
          source={{uri: item}}
          resizeMode="cover"
        />
      </View>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        
        <View style={styles.upper}>
         {isLoading && photo != undefined && ( 
          <Image
            style={styles.image}
            source={photo}
            resizeMode="cover"
          /> )} 
        {!isLoading && (
          <Carousel
          layout={"default"}
          data={details["imageURL"]}
          sliderWidth={layout.window.width-10}
          itemWidth={layout.window.width-10}
          renderItem={renderItem}
          autoplay={true}
          loop={true}
          /> 
        )}
        </View> 
        <ScrollView style={styles.lower}>
        <View style={styles.lower}>
        <Text style={styles.heading}>{`${description.join(' | ')}`}</Text>
        <View style={{ flexDirection: 'column'}}>
          <View style={styles.row}>
              <Icon.MaterialIcons name="location-on" style={styles.icons} iconRight title="Mail" color={colors.blue}/>
              <Text style={styles.details}>{`${address}`}</Text>
          </View>

          {!isLoading && (
          <View style={styles.row}>
            <Icon.MaterialIcons name="phone" style={styles.icons} color={colors.blue}/>
             <Text style={styles.details}>{`${details["phonenumber"]}`}</Text>
          </View>)} 

          <View style={styles.row}>
              {rating % 1 == 0.5 && (Array.from(Array(rating-0.5), (e, i) => {
                return (
                  <Icon.MaterialIcons name="star" style={styles.icons} color={"gold"} key={i}/>  
                )
              }))}
              {rating % 1 == 0.5 && 
                  <Icon.MaterialIcons name="star-half" style={styles.icons} color={"gold"}/>  
              }
              {rating % 1 == 0.5 && (Array.from(Array(4-rating+0.5), (e, i) => {
                return (
                  <Icon.MaterialIcons name="star-border" style={styles.icons} color={"gold"} key={i}/>  
                )
              }))}
              {rating % 1 == 0 && (Array.from(Array(rating), (e, i) => {
                return (
                  <Icon.MaterialIcons name="star" style={styles.icons} color={"gold"} key={i}/>  
                )
              }))}
              {rating % 1 == 0 && (Array.from(Array(5-rating), (e, i) => {
                return (
                  <Icon.MaterialIcons name="star-border" style={styles.icons} color={"gold"} key={i}/>  
                )
              }))}
          </View>
          <View style={styles.row}>
            {(Array.from(Array(price), (e, i) => {
                  return (
                    <Icon.MaterialIcons name="attach-money" style={styles.icons} color={colors.green} key={i}/>  
                  )
                }))}
          </View>
          
   
          {!isLoading && "hours" in details &&  ( 
          <View>
            <Text style={styles.heading}>Hours</Text>
            <Text style = {styles.hours}>{"Sun:         " + `${details["hours"]["Sunday"]}`}</Text>
            <Text style = {styles.hours}>{"Mon:        " + `${details["hours"]["Monday"]}`}</Text>
            <Text style = {styles.hours}>{"Tues:       " + `${details["hours"]["Tuesday"]}`}</Text>
            <Text style = {styles.hours}>{"Wed:        " + `${details["hours"]["Wednesday"]}`}</Text>
            <Text style = {styles.hours}>{"Thurs:      " + `${details["hours"]["Thursday"]}`}</Text>
            <Text style = {styles.hours}>{"Fri:          " + `${details["hours"]["Friday"]}`}</Text>
            <Text style = {styles.hours}>{"Sat:         " +`${details["hours"]["Saturday"]}`}</Text>
          </View>
          )}

     
          {!isLoading && ( 
          <View>
          <Text style={styles.heading}>Top Review</Text>
          <Text style={styles.review}>{`${details["topreview"]["reviewtext"]}`}</Text>
          </View>)}
        </View>
        </View>

        {isLoading && (
              <ActivityIndicator style={styles.activityIndicator} size="large" color={colors.green} />
        )}
          
        </ScrollView>
      </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      marginLeft: 15, 
      alignSelf: 'center'
    },
    carousel: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    upper: {
      backgroundColor: colors.darkGray,
      paddingTop:20,
      height: height - height*0.70,
      paddingBottom:20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lower: {
      backgroundColor: colors.white,
      flex: 5,
    },
    image: {
      borderRadius: 10,
      flex: 1,
      width: layout.window.width-25
    },

    heading: {
      backgroundColor: colors.green, 
      padding: 5, 
      marginTop: 10,
      marginLeft: 5,
      marginRight: 5,
      marginBottom: 10,
      textAlign: 'center',
      fontSize: RFValue(20, 800),
      color: colors.offWhite
    },

    icons: {
      margin: 5,
      fontSize: 22
    },

    details: {
      margin: 5,
      fontSize: RFValue(16, 800),
      color: colors.blue
    },

    review: {
      margin: 15,
      textAlign: 'center',
      fontSize: RFValue(16, 800),
      color: colors.black,
    },

    hours: {
      margin: 5,
      paddingLeft: 30,
      paddingRight: 30,
      textAlign: 'center',
      fontSize: RFValue(16, 800),
      color: colors.black,
    }, 

    activityIndicator: {
      marginTop: 100, 
      marginBottom: 100
    } 
  })