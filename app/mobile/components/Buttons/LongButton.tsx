import { useLinkProps } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Switch, View} from 'react-native';
import { Button } from 'react-native-elements';
import colors from '../../constants/Colors';

export default function LongButton(props) {
    const styles = StyleSheet.create({
        base: {
            height: 45,
            borderRadius: 40
        },
        titleStyle: {
            fontFamily: "Roboto_500Medium",
            fontSize: 16
        },
        secondary: {
            backgroundColor: colors.green,
        },
        regular: {
            backgroundColor: colors.blue
        }
    });

    return (
        <Button
            title={props.title}
            titleStyle={styles.titleStyle}
            buttonStyle={[styles.base, props.secondary ? styles.secondary : styles.regular, props.style]}
            onPress={props.onPress}
            disabled={props.disabled}
        />
    )
}