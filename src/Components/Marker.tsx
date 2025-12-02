import React from 'react';
import type { MarkerProps, Point } from '../@types';
import { Image, type NativeSyntheticEvent } from 'react-native';
import YamapLiteMarkerView from '../YamapMarkerViewNativeComponents';

export const Marker: React.FC<MarkerProps> = ({
  onPress,
  source,
  ...props
}) => {
  const handleMarkerPress = (event: NativeSyntheticEvent<Point>) => {
    if (onPress) {
      onPress({
        lat: event.nativeEvent.lat,
        lon: event.nativeEvent.lon,
      });
    }
  };

  const markerIconUri = source ? Image.resolveAssetSource(source).uri : '';

  return (
    <YamapLiteMarkerView
      {...props}
      source={markerIconUri}
      onMarkerPress={handleMarkerPress}
    />
  );
};
