import * as React from 'react';
import { StyleSheet, Switch, View} from 'react-native';
import { CheckBox } from 'react-native-elements';
import colors from '../../constants/Colors';

//component that represents one type of cuisine preference 
//upon being checked, the component updates the state through the function that is passed as a prop 

export default function CuisineOption(props: any) {
  const [isChecked, setIsChecked] = React.useState(props.checked);
  const toggleCheckBox = () => {
    setIsChecked(!isChecked);
    props.updatePreferences(props.cuisineID, !isChecked);
  }

  return (
      <CheckBox
        textStyle={styles.textStyle}
        containerStyle={styles.buttonStyle}
        title={props.cuisineName}
        iconRight
        iconType='material'
        checkedIcon='check'
        uncheckedIcon='add'
        checkedColor={colors.green}
        checked={isChecked}
        onPress={toggleCheckBox}
      />
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 10,
    fontWeight: 'bold',
  }, 
  buttonStyle: {
    margin: 5,
    padding: 0
  }
});
