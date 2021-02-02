import React from 'react';
import { StyleSheet, View} from 'react-native';

export default function Container(props) {
    const styles = StyleSheet.create({
        main: {
            padding: 20
        }
    });

    return (
        <View style={styles.main}>
            {props.children}
        </View>
    )
}