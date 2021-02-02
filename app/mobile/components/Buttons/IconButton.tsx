
import React from 'react';
import { StyleSheet, Switch, View} from 'react-native';
import colors from '../../constants/Colors';
import {FontAwesome} from '@expo/vector-icons'

export default function IconButton(props) {

    const {name, color, iconSize, onPress } = props
    return (
        <FontAwesome.Button name={name} 
            size={iconSize} 
            color= {color} 
            onPress={onPress} 
        />
    )
}