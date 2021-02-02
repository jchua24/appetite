import React from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import {LongButton, Container, LoginForm, SignupForm} from "../../components";
import env from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiLogin, apiSignup} from '../../api/authAPI';
import colors from "../../constants/Colors"

const Auth = ({navigation}) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [currentView, setView] = React.useState('main');

    React.useEffect(() => {
        async function fetchAuth() {
            try {
              const authToken = await AsyncStorage.getItem('authToken');
              if (authToken !== null) {
                navigation.navigate('Home', {login: true});
              }
            } catch (error) {
              console.log(error);
            }
          }

        fetchAuth();
    }, []);

    const login = async () => {
        setError('');
        try {
          const user = await apiLogin(email, password);
          try {
            await AsyncStorage.setItem('authToken', user.access_token);
            await AsyncStorage.setItem('userId', user.id)

            navigation.navigate('Home', {login: true});
          } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
            setError('Error storing authentication token and/or user ID.');
          }
        } catch (error) {
            console.log("error")
          setError('Error signing in');
        }
    };

    const signup = async () => {
        setError('');
        try {
          const user = await apiSignup(email, password, name);
          try {
            await AsyncStorage.setItem('authToken', user.access_token);
            await AsyncStorage.setItem('userId', user.id)

            navigation.navigate('Home', {login: true});
          } catch (error) {
            console.log('AsyncStorage error: ' + error.message);
            setError('Error storing authentication token and/or user ID.');
          }
        } catch (error) {
          setError('Error signing in');
        }
    };

    const changeView = (viewName: string) => {
        setView(viewName)
        setError('');
    }

    const styles = StyleSheet.create({
        logo: {
          width: 270,
          height: 100,
          alignSelf: 'center',
        },
        logoMain: {
            justifyContent: 'center',
            height: '70%',
        },
        main: {
            justifyContent: 'center',
            height: '95%'
        },
        form: {
            height: '95%',
        },
        buttonHolder: {
            height: '30%',
        },
        loginButton: {
            marginVertical: 15
        },
        logoForm: {
            justifyContent: 'center',
            height: '40%'
        },
        loginForm: {
            height: '30%'
        },
        text: {
            color: colors.pink,
            fontFamily: 'Roboto_500Medium'
        }
      });

    const Main = (
        <View style={styles.main}>
            <View style={styles.logoMain}>
                <Image
                style={styles.logo}
                source={require('../../assets/images/logo.png')}
                />
            </View>
            <View style={styles.buttonHolder}>
                <LongButton style={styles.loginButton} title="LOGIN" onPress={() => changeView("login")}/>
                <LongButton style={styles.loginButton} title="SIGN UP" onPress={() => changeView("signup")} secondary />
            </View>
        </View>
    )
    
    const Login = (
        <View style={styles.form}>
            <View style={styles.logoForm}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/images/logo.png')}
                />
            </View>
            <LoginForm style={styles.loginForm} onChangeEmail={(email) => setEmail(email)} onChangePassword={(password) => setPassword(password)} />
            {error.length > 0 && <Text style={styles.text}>{error}</Text>}
            <View style={styles.buttonHolder}>
                <LongButton style={styles.loginButton} title="LOGIN" onPress={() => login()} disabled={email.length == 0 || password.length == 0}/>
                <LongButton style={styles.loginButton} title="BACK" onPress={() => changeView("main")} secondary/>
            </View>
        </View>
    )

    const SignUp = (
        <View style={styles.form}>
            <View style={styles.logoForm}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/images/logo.png')}
                />
            </View>
            <SignupForm style={styles.loginForm} onChangeEmail={(email) => setEmail(email)} onChangePassword={(password) => setPassword(password)} onChangeName={(name) => setName(name)} />
            {error.length > 0 && <Text style={styles.text}>{error}</Text>}
            <View style={styles.buttonHolder}>
                <LongButton style={styles.loginButton} title="SIGN UP" onPress={() => signup()} disabled={email.length == 0 || password.length == 0 || name.length == 0} />
                <LongButton style={styles.loginButton} title="BACK" onPress={() => changeView("main")} secondary/>
            </View>
        </View>
    )

    let view;
    if (currentView == 'main') {
        view = Main;
    } else if (currentView == 'login') {
        view = Login;
    } else {
        view = SignUp;
    }
    
    return (
        <Container>
            {view}
        </Container>
    )
}

export default Auth; 