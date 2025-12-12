import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import { findNodeHandle, Image, type NativeSyntheticEvent } from 'react-native';
import type { Point, YaMapProps, YaMapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

export const YaMap = forwardRef(
  (props: YaMapProps, ref: ForwardedRef<YaMapRef>) => {
    const nativeRef = useRef(null);
    const viewId = findNodeHandle(nativeRef.current);

    const {
      userLocationIcon,
      zoomGesturesEnabled = true,
      scrollGesturesEnabled = true,
      tiltGesturesEnabled = true,
      rotateGesturesEnabled = true,
      fastTapEnabled = true,
      nightMode = false,
      showUserPosition = false,
      userLocationAccuracyFillColor = '#00FF00',
      userLocationAccuracyStrokeColor = '#000000',
      userLocationAccuracyStrokeWidth = 2,
      userLocationIconScale = 1,
      onMapPress,
      onMapLongPress,
      ...otherProps
    } = props;

    useImperativeHandle(
      ref,
      () => ({
        getCameraPosition: async () => {
          return YamapUtils.getCameraPosition(viewId!);
        },
        setZoom: async (
          zoom: number,
          duration?: number,
          animation?: 'LINEAR' | 'SMOOTH'
        ) => {
          return YamapUtils.setZoom(
            viewId!,
            zoom,
            duration ?? 500,
            animation ?? 'SMOOTH'
          );
        },
        setCenter: async (
          center: Point,
          zoom?: number,
          azimuth?: number,
          tilt?: number,
          duration?: number,
          animation?: 'LINEAR' | 'SMOOTH'
        ) => {
          return YamapUtils.setCenter(
            viewId!,
            center.lat,
            center.lon,
            zoom ?? 10,
            azimuth ?? 0,
            tilt ?? 0,
            duration ?? 500,
            animation ?? 'SMOOTH'
          );
        },
        fitAllMarkers: async () => {
          return YamapUtils.fitAllMarkers(viewId!);
        },
      }),
      [viewId]
    );

    const userLocationIconUri = userLocationIcon
      ? Image.resolveAssetSource(userLocationIcon).uri
      : '';

    const handleMapPress = (event: NativeSyntheticEvent<Point>) => {
      if (onMapPress) {
        onMapPress({
          lat: event.nativeEvent.lat,
          lon: event.nativeEvent.lon,
        });
      }
    };

    const handleMapLongPress = (event: NativeSyntheticEvent<Point>) => {
      if (onMapLongPress) {
        onMapLongPress({
          lat: event.nativeEvent.lat,
          lon: event.nativeEvent.lon,
        });
      }
    };

    return (
      <YamapLiteView
        ref={nativeRef}
        userLocationIcon={userLocationIconUri}
        zoomGesturesEnabled={zoomGesturesEnabled}
        scrollGesturesEnabled={scrollGesturesEnabled}
        tiltGesturesEnabled={tiltGesturesEnabled}
        rotateGesturesEnabled={rotateGesturesEnabled}
        fastTapEnabled={fastTapEnabled}
        nightMode={nightMode}
        showUserPosition={showUserPosition}
        userLocationAccuracyFillColor={userLocationAccuracyFillColor}
        userLocationAccuracyStrokeColor={userLocationAccuracyStrokeColor}
        userLocationAccuracyStrokeWidth={userLocationAccuracyStrokeWidth}
        userLocationIconScale={userLocationIconScale}
        onMapPress={handleMapPress}
        onMapLongPress={handleMapLongPress}
        {...otherProps}
      />
    );
  }
);
