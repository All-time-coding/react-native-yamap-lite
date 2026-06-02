import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import { findNodeHandle, Image, type NativeSyntheticEvent } from 'react-native';
import type { Point, ScreenPoint, YaMapProps, YaMapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

export const YaMap = forwardRef(
  (props: YaMapProps, ref: ForwardedRef<YaMapRef>) => {
    const nativeRef = useRef(null);
    // Always holds the latest props without closing over stale values in imperative handle
    const latestProps = useRef(props);
    latestProps.current = props;

    const {
      userLocationIcon,
      interactive = true,
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
      // Destructure backward-compat callbacks so they don't leak into otherProps
      onCameraPositionReceived: _onCameraPositionReceived,
      onVisibleRegionReceived: _onVisibleRegionReceived,
      onWorldToScreenPointsReceived: _onWorldToScreenPointsReceived,
      onScreenToWorldPointsReceived: _onScreenToWorldPointsReceived,
      ...otherProps
    } = props;

    useImperativeHandle(
      ref,
      () => ({
        getCameraPosition: async () => {
          const result = await YamapUtils.getCameraPosition(
            findNodeHandle(nativeRef.current)!
          );
          latestProps.current.onCameraPositionReceived?.({
            nativeEvent: result,
          });
          return result;
        },
        getVisibleRegion: async () => {
          const result = await YamapUtils.getVisibleRegion(
            findNodeHandle(nativeRef.current)!
          );
          latestProps.current.onVisibleRegionReceived?.({
            nativeEvent: result,
          });
          return result;
        },
        getScreenPoints: async (points: Point[]) => {
          const result = await YamapUtils.getScreenPoints(
            findNodeHandle(nativeRef.current)!,
            points
          );
          latestProps.current.onWorldToScreenPointsReceived?.({
            nativeEvent: { points: result.points },
          });
          return result.points;
        },
        getWorldPoints: async (points: ScreenPoint[]) => {
          const result = await YamapUtils.getWorldPoints(
            findNodeHandle(nativeRef.current)!,
            points
          );
          latestProps.current.onScreenToWorldPointsReceived?.({
            nativeEvent: { points: result.points },
          });
          return result.points;
        },
        setZoom: async (
          zoom: number,
          duration?: number,
          animation?: 'LINEAR' | 'SMOOTH'
        ) => {
          await YamapUtils.setZoom(
            findNodeHandle(nativeRef.current)!,
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
          await YamapUtils.setCenter(
            findNodeHandle(nativeRef.current)!,
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
          await YamapUtils.fitAllMarkers(findNodeHandle(nativeRef.current)!);
        },
        fitMarkers: async (_markers: any[]) => {
          await YamapUtils.fitAllMarkers(findNodeHandle(nativeRef.current)!);
        },
        getMapObjectCount: async () => {
          return YamapUtils.getMapObjectCount(
            findNodeHandle(nativeRef.current)!
          );
        },
        setTrafficVisible: (_visible: boolean) => {
          // Traffic layer is not available in lite SDK
        },
      }),
      []
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
        zoomGesturesEnabled={interactive ? zoomGesturesEnabled : false}
        scrollGesturesEnabled={interactive ? scrollGesturesEnabled : false}
        tiltGesturesEnabled={interactive ? tiltGesturesEnabled : false}
        rotateGesturesEnabled={interactive ? rotateGesturesEnabled : false}
        fastTapEnabled={interactive ? fastTapEnabled : false}
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
