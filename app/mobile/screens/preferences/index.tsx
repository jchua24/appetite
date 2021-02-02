import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView} from 'react-native';
import {LongButton, PageHeader} from "../../components";
import {HorizontalScrollPicker} from '../../components/react-native-horizontal-scroll-picker';
import CuisineOptionSection from '../../components/Preferences/CuisineOptionSection';
import Slider from '@react-native-community/slider';
import colors from '../../constants/Colors';
import layout from "../../constants/Layout";
import { RFValue } from "react-native-responsive-fontsize";

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

//allows users to modify their preferences based on cuisine, price and distance

const priceOptions = [{label: 'Any Price', value: 0}, {label: '$', value: 1}, {label: '$$', value: 2}, {label: '$$$', value: 3}, {label: '$$$$', value: 4}]

const Preferences = ({route, navigation}) => {
  const [cuisinePreferences, setCuisinePreferences] = React.useState(route.params.cuisinePreferences); 
  const [distanceRadius, setDistanceRadius] = React.useState(route.params.searchRadius); 
  const [pricePreference, setPricePreference] = React.useState(route.params.pricePreference)
  
  const isSelected = (item: string) => {
    return cuisinePreferences.includes(item) 
  }

  const cuisines = [
    {name: "Cuisines", options: [{displayText: 'Traditional American', id: 'American (Traditional)', selected: isSelected('American (Traditional)')}, {displayText: 'Italian', id: 'Italian', selected: isSelected('Italian')}, {displayText: 'Chinese', id: 'Chinese', selected: isSelected('Chinese')}, {displayText: 'Korean', id: 'Korean', selected: isSelected('Korean')}, {displayText: 'Japanese', id: 'Japanese', selected: isSelected('Japanese')}, {displayText: 'Greek', id: 'Greek', selected: isSelected('Greek')}]}, 
    {name: "Popular Items", options: [{displayText: 'Sandwiches', id: 'Sandwiches', selected: isSelected('Sandwiches')}, {displayText: 'Bakeries', id: 'Bakeries', selected: isSelected('Bakeries')}, {displayText: 'Pizza', id: 'Pizza', selected: isSelected('Ice Cream & Frozen Yogurt')}, {displayText: 'Salad', id: 'Salad', selected: isSelected('Salad')}, {displayText: 'Desserts', id: 'Desserts', selected: isSelected('Desserts')}, {displayText: 'Coffee', id: 'Coffee & Tea', selected: isSelected('Coffee & Tea')}]},
    {name: "Dietary", options: [{displayText: 'Gluten Free ', id: 'Gluten-Free', selected: isSelected('Gluten-Free')}, {displayText: 'Vegan', id: 'Vegan', selected: isSelected('Vegan')}]} 
  ]

  //function that is passed to child components, to update the list of selected cuisines
  const updatePreferences = (option: string, checked: boolean) => {
    
    if(cuisinePreferences.includes(option) && !checked){
      cuisinePreferences.splice(cuisinePreferences.indexOf(option), 1)
    } else if (!cuisinePreferences.includes(option) && checked){
      cuisinePreferences.push(option)
    }

    setCuisinePreferences(cuisinePreferences) 
  }

  //maps the cuisines array to sections and options that will be visible to user 
  const cuisineSections = cuisines.map((section,index) => <CuisineOptionSection key={index} sectionName={section.name} options ={section.options} updatePreferences={updatePreferences}/>)

  const applyPreferences = () => {
    //passes in the selected cuisines and distance radius to the main page 
    navigation.navigate('Home', {login: false}); 
    route.params.onGoBack(cuisinePreferences, distanceRadius, pricePreference);
  }

  return (
    <SafeAreaView style={styles.container}>

        <PageHeader title="User Preferences" navigationFunction={() => navigation.navigate('Home', {login: false})} /> 

        <View style={styles.cuisineSections}> 
        {cuisineSections}
        </View>

        <View style={styles.distanceSlider}> 
            <Slider
            step={0.1}
            minimumValue={0.1}
            maximumValue={2}
            value={distanceRadius}
            onValueChange={slideValue => setDistanceRadius(slideValue)}
            minimumTrackTintColor="#1fb28a"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#b9e4c9"
            />
            
            <Text style={{color: colors.offWhite, alignSelf: 'center', fontSize: 14, fontStyle: 'italic'}} >
            Look for restaurants within: {distanceRadius.toFixed(1)}km
            </Text>
        </View> 


        <View style={styles.priceOptions}> 
          <HorizontalScrollPicker
            items={priceOptions}
            textStyle={styles.textStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.pricesContainer}
            itemStyle={styles.itemContainer}
            selectorStyle={styles.selectedItem}
            onSelect={(selection) => setPricePreference(selection)}
            initialIdx={pricePreference}
          />
        </View> 


        <View style={styles.buttonsPanel}> 
            <LongButton title="Apply" onPress={() => applyPreferences()} primary/>
        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20
  },
  cuisineSections: {
    flex: 3.5,
    paddingTop: 20,
    margin: 0
  },
  buttonsPanel: {
    flex: 1, 
    justifyContent: 'center', 
    width: layout.window.width * 0.7
  },
  distanceSlider: {
    width: layout.window.width * 0.7, 
    flex: 0.5, 
    marginTop: -40
  },   
  priceOptions: {
    flex: 1, 
    justifyContent: 'flex-end', 
  }, 
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0,
    padding: 10
  },
  selectedItem: {
    flex: 1,
    position: 'absolute',
    top: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: "gold", 
    borderRadius: 12,
  },
  textStyle: {
      textAlign: 'center',
      textAlignVertical: 'center',
      color: colors.offWhite, 
      fontSize: RFValue(18, 800),
      fontFamily: 'Roboto_400Regular',
  },
  selectedTextStyle: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: "gold", 
    fontSize: RFValue(18, 800),
    fontFamily: 'Roboto_400Regular',
    fontWeight: 'bold',
  },
  pricesContainer: {
    flexGrow: 0,
    flexDirection: 'row',
  },  
});



export default Preferences;