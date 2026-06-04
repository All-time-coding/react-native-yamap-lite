import React from 'react';
import type { CircleProps, Point } from '../@types';
import { type NativeSyntheticEvent } from 'react-native';
import YamapLiteCircleView from '../YamapCircleViewNativeComponent';

export const Circle: React.FC<CircleProps> = ({
  onPress,
  zIndex,
  ...props
}) => {
  const handleCirclePress = (event: NativeSyntheticEvent<Point>) => {
    onPress?.(event.nativeEvent);
  };

  return (
    <YamapLiteCircleView
      {...props}
      zInd={zIndex}
      onCirclePress={handleCirclePress}
    />
  );
};
