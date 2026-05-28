import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { MarkerProps, MarkerRef, Point } from '../@types';
import { Image, type NativeSyntheticEvent } from 'react-native';
import YamapLiteMarkerView from '../YamapMarkerViewNativeComponents';

export const Marker = forwardRef<MarkerRef, MarkerProps>(
  ({ onPress, source, zIndex, point: pointProp, ...props }, ref) => {
    const [point, setPoint] = useState<Point>(pointProp);
    const prevPointPropRef = useRef(pointProp);

    useEffect(() => {
      if (
        pointProp.lat !== prevPointPropRef.current.lat ||
        pointProp.lon !== prevPointPropRef.current.lon
      ) {
        prevPointPropRef.current = pointProp;
        setPoint(pointProp);
      }
    }, [pointProp]);

    useImperativeHandle(ref, () => ({
      animatedMoveTo: (newPoint: Point, _duration: number) => {
        setPoint(newPoint);
      },
      animatedRotateTo: (_angle: number, _duration: number) => {},
    }));

    const handleMarkerPress = (event: NativeSyntheticEvent<Point>) => {
      onPress?.(event.nativeEvent);
    };

    const markerIconUri = source ? Image.resolveAssetSource(source).uri : '';

    return (
      <YamapLiteMarkerView
        {...props}
        point={point}
        zInd={zIndex ?? 1}
        source={markerIconUri}
        onMarkerPress={handleMarkerPress}
      />
    );
  }
);
