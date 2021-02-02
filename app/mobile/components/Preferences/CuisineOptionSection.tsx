import * as React from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import CuisineOption from './CuisineOption';
import colors from '../../constants/Colors';
import { RFValue } from "react-native-responsive-fontsize";


//displays one section of the cuisine preferences, generating a flatlist for all the items passed in through props 

export default function CuisineOptionSection(props: any) {

  return (
    <View style={styles.container}>
        <Text style={styles.sectionHeader}>
          {props.sectionName}
        </Text>

        <FlatList
            numColumns= {3}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            data={props.options}
            renderItem={({ item }) => <CuisineOption cuisineName={item.displayText} cuisineID={item.id} updatePreferences={props.updatePreferences} checked={item.selected}/>}
            keyExtractor={(item) => item.displayText}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  sectionHeader: {
    paddingLeft: 10,
    paddingBottom: 2,
    fontSize: RFValue(20, 800),
    fontFamily: 'Roboto_500Medium',
    fontWeight: 'bold',
    color: colors.offWhite
  }
});
