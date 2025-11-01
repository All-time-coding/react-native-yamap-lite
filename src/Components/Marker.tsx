import React from 'react';
import type { NativeProps } from '../YamapMarkerViewNativeComponents';
import type { Point } from '../@types';
import type { NativeSyntheticEvent } from 'react-native';
import YamapLiteMarkerView from '../YamapMarkerViewNativeComponents';

export interface YaMapMarkerProps extends Omit<NativeProps, 'onMarkerPress'> {
  onMarkerPress?: (event: Point) => void;
}

export const Marker: React.FC<YaMapMarkerProps> = ({
  onMarkerPress,
  ...props
}) => {
  const handleMarkerPress = (event: NativeSyntheticEvent<Point>) => {
    if (onMarkerPress) {
      onMarkerPress({
        lat: event.nativeEvent.lat,
        lon: event.nativeEvent.lon,
      });
    }
  };
  return <YamapLiteMarkerView {...props} onMarkerPress={handleMarkerPress} />;
};
