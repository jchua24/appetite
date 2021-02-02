import * as React from 'react';

export default function Text(props) {
  return <Text {...props} style={[props.style, props.medium ? {fontFamily: 'Roboto_500Medium' } : {fontFamily: 'Roboto_400Regular'}]}>
      {props.children}
  </Text>;
}
