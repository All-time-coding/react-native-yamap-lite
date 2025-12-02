import React from 'react';
import type { CircleProps, Point } from '../@types';
import { type NativeSyntheticEvent } from 'react-native';
import YamapLiteCircleView from '../YamapCircleViewNativeComponents';

export const Circle: React.FC<CircleProps> = ({ onPress, ...props }) => {
  const handleCirclePress = (event: NativeSyntheticEvent<Point>) => {
    if (onPress) {
      onPress({
        lat: event.nativeEvent.lat,
        lon: event.nativeEvent.lon,
      });
    }
  };

  return <YamapLiteCircleView {...props} onCirclePress={handleCirclePress} />;
};
