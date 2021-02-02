import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import {Button } from 'react-native-elements';
import colors from "../constants/Colors"
import { RFValue } from "react-native-responsive-fontsize";

//the design for each restaurant card in the main swiper 

export const Card = (props: any) => 

(
  <View style={styles.card}>
    <Image
      style={styles.image}
      source={props.card.photo}
      resizeMode="cover"
    />
    <View style={styles.box}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {`${(shorten_str(props.card.title, 18))}`}
        </Text>
      </View>
    
    <View style = {styles.rightSideContainer}>
        <Text style={styles.category}>
          {`${(shorten_str(props.card.description.slice(0,3).join(' | '), 26))}`}
        </Text>
        <View style = {{flex: 0.3}}> 
          <Button 
            title="Details >"
            titleStyle={{
              color: colors.offWhite,
              fontSize: RFValue(18, 800),
              fontFamily: 'Roboto_400Regular',
            }}
            type="clear"
            onPress={() => props.navigation.navigate('Restaurant Details', 
            {title: props.card.title, 
              description: props.card.description,
              photo: props.card.photo,
              address: props.card.address,
              rating: props.card.rating,
              price: props.card.price,
              id: props.card.id
            })}/>
        </View>
    </View>
    </View>
  </View>
)
function shorten_str(str: String, limit: number) {
  if (str.length > limit) {
    return str.substring(0, limit) + "...";
  } else {
    return str;
  }
}
const styles = StyleSheet.create({
    card: {
      flex: 1, 
      backgroundColor: colors.black,
      borderRadius: 10
    },
    image: {
      borderRadius: 10,
      flex: 0.80,
      width: '100%',
    },
    box: {
      borderRadius: 10,
      flex: 0.20,
    },
    titleContainer: {
      top: 10,
      alignSelf: 'flex-start',
      flex: 0.6,
    },
    rightSideContainer: {
      flexShrink: 1,
      justifyContent: 'space-between',
      flexDirection: 'row',
      flex: 0.4,
      position: 'relative',
    },
    title: {
      textAlign: 'center',
      left: 15,
      fontSize: RFValue(32, 800),
      color: colors.offWhite,
      fontFamily: 'Roboto_500Medium',
    },
    category: {
      flexDirection: "row",
      flex: 0.8,
      left: 15,
      paddingTop: 10,
      fontSize: RFValue(18, 800),
      color: colors.offWhite,
      opacity: 0.60,
      fontFamily: 'Roboto_400Regular',
    },
  })
export default Card