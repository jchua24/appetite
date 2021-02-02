
import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';
import colors from '../../constants/Colors';
import { RFValue } from "react-native-responsive-fontsize";

//component for displaying personal information about the user 
//currently displays the user's name only and an avatar, but could be expanded for future deliverables

export default function PersonalInfo(props) {
    const styles = StyleSheet.create({
        container: {
            flex: 1, 
            alignItems: 'center'
        },     
        userAvatar: {
            width: 150,
            height: 150,
            borderRadius: 150/2
        }, name: {
            padding: 15,
            color: colors.offWhite, 
            fontSize: RFValue(20, 800),
            fontFamily: 'Roboto_400Regular'
        }

    });
    const {firstname, lastname} = props
    const avatarURI = "https://ui-avatars.com/api?name=" + firstname + "+" + lastname + "&background=" + colors.greenRaw + "&color=" + colors.offWhiteRaw + "&size=" + 512; 

    return (
        <View style={styles.container}>
            <Image style={styles.userAvatar}source={{ uri: avatarURI}}/>
            <Text style={styles.name}>{firstname + " " + lastname} </Text> 
        </View> 
        
    )
}