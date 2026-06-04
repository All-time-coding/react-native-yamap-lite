import React from 'react';
import type { Point, PolygonProps } from '../@types';
import { type NativeSyntheticEvent } from 'react-native';
import YamapLitePolygonView from '../YamapPolygonViewNativeComponent';

export const Polygon: React.FC<PolygonProps> = ({
  onPress,
  zIndex,
  ...props
}) => {
  const handlePolygonPress = (event: NativeSyntheticEvent<Point>) => {
    if (onPress) {
      onPress({
        lat: event.nativeEvent.lat,
        lon: event.nativeEvent.lon,
      });
    }
  };

  return (
    <YamapLitePolygonView
      {...props}
      onPolygonPress={handlePolygonPress}
      zInd={zIndex}
    />
  );
};
