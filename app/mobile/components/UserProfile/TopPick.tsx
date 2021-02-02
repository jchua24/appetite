import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import colors from '../../constants/Colors';

import { RFValue } from "react-native-responsive-fontsize";

//component that allows users to view and interact with a restaurant they have previously superliked

export default function TopPick(props) {
    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'flex-start'
        },     
        restaurantImage: {
            width: 48,
            height: 48,
            borderRadius: 48/2
        }, 
        name: {
            padding: 15,
            color: colors.offWhite, 
            fontSize: RFValue(16, 800),
            fontWeight: 'bold'
        }, 
        categories: {
            padding: 15,
            color: colors.offWhite, 
            fontSize: RFValue(16, 800),
            fontStyle: 'italic'
        }, 
        rating: {
            padding: 15,
            color: 'gold', 
            fontSize: RFValue(18, 800),
            fontWeight: 'bold', 
        }, 

        imageContainer: {
            width: '15%'
        },

        nameContainer: {
            width: '35%'
        },

        categoriesContainer: {
            width: '32%', 
        },

        ratingContainer: {
            width: '18%'
        }
    });

    return (
        <TouchableOpacity style={styles.container} onPress={() => props.navigation.navigate('Restaurant Details', 
        {title: props.card.name, 
            description: props.card.categories,
            photo: {uri: props.card.imageURL[0]},
            address: props.card.address,
            rating: props.card.rating,
            price: props.card.price,
            id: props.card.id
          })}>
            <View style={styles.imageContainer}> 
                <Image style={styles.restaurantImage} source={{ uri: props.card.imageURL[0]}}/>
            </View> 

            <View style={styles.nameContainer}> 
                <Text style={styles.name}>{props.card.name}</Text> 
            </View> 

            <View style={styles.categoriesContainer}> 
                <Text style={styles.categories}>{props.card.categories[0]}</Text> 
            </View> 

            <View style={styles.ratingContainer}> 
                <Text style={styles.rating}>{props.card.rating}</Text> 
            </View>
        </TouchableOpacity>
        
    )
}