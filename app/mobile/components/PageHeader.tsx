import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';
import * as Icon from '@expo/vector-icons'
import colors from '../constants/Colors';
import { RFValue } from "react-native-responsive-fontsize";


const PageHeader = (props) => {

    const styles = StyleSheet.create({
        header: {
          flex: 1, 
          flexDirection: 'row', 
          alignItems: 'center'
        }, 
        title: {
            flex: 1.5, 
            fontSize: RFValue(32, 800),
            fontWeight: 'bold',
            color: colors.offWhite
        }
      });

    return (
        <View style={styles.header}> 
            <Icon.FontAwesome.Button  
                name="times-circle"
                color={colors.offWhite} 
                backgroundColor="transparent"
                size = {32}
                onPress={() => props.navigationFunction()} 
            />
            <Text style={styles.title}>{props.title}</Text>
        </View> 
    );
} 

export default PageHeader;
