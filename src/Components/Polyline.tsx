import React from 'react';
import type { Point, PolylineProps } from '../@types';
import { type NativeSyntheticEvent } from 'react-native';
import YamapLitePolylineView from '../YamapPolylineViewNativeComponent';

export const Polyline: React.FC<PolylineProps> = ({
  onPress,
  zIndex,
  ...props
}) => {
  const handlePolylinePress = (event: NativeSyntheticEvent<Point>) => {
    if (onPress) {
      onPress({
        lat: event.nativeEvent.lat,
        lon: event.nativeEvent.lon,
      });
    }
  };

  return (
    <YamapLitePolylineView
      {...props}
      onPolylinePress={handlePolylinePress}
      zInd={zIndex}
    />
  );
};
