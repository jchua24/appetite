import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList} from 'react-native';
import {LongButton, PersonalInfo, PageHeader, TopPick} from "../../components";
import colors from '../../constants/Colors';
import {userLogOut} from "../../api/userAPI";
import { RFValue } from "react-native-responsive-fontsize";

//displays the user's name through PersonalInfo component, list of 10 superliked restaurants, and logout button

export const Profile = ({route, navigation}) => {
    const [userDetails, setUserDetails] = React.useState(route.params.userDetails); 
    const [superlikes, setSuperLikes] = React.useState(route.params.superlikes); 

    const firstname = userDetails.name.substr(0, userDetails.name.indexOf(' ')); 
    const lastname = userDetails.name.substr(userDetails.name.indexOf(' ')+1);

    const logOut = async () => {
      await userLogOut(navigation); 
    }
    
    return (
  
        <SafeAreaView style={styles.container}> 

          <PageHeader title="Your Profile" navigationFunction={() => navigation.navigate('Home', {login: false})} /> 
        
          <View style={styles.userInfo}> 
              <PersonalInfo firstname={firstname} lastname={lastname}/> 
          </View>
    
          <View style={styles.topPicks}> 
              <Text style={styles.title}>Top Restaurant Picks</Text>
              {(superlikes != [] && 
              <FlatList style={styles.topPicksList}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              data={superlikes.slice(0, 10)}
              renderItem={({ item }) => <TopPick card={item} navigation = {navigation}/>}
              keyExtractor={(item) => item.name}
              />)} 
          </View> 
    
    
          <View> 
              <LongButton style={styles.logoutButton} title="LOGOUT" onPress={() => logOut()}/>
          </View> 
    
        </SafeAreaView> 

    );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', 
      margin: 20
    },
    title: {
      fontSize: RFValue(24, 800),
      fontFamily: 'Roboto_700Bold',
      color: colors.offWhite
    },
    userInfo: {
      flex: 2, 
      width: '100%', 
    },
    topPicks: {
      flex: 3, 
      width: '100%', 
      alignItems: 'center', 
    }, topPicksList: {
      marginTop: 20
    }, 
    logoutButton: {
      marginTop: 25,
      width: '100%'
    }
  });


export default Profile;
