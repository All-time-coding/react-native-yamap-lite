import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import type { NativeProps } from '../YamapLiteViewNativeComponent';
import {
  findNodeHandle,
  Image,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
} from 'react-native';
import type { CameraPosition, MapLoaded, Point, YamapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

// 'reload',
export const YaMap = forwardRef(
  (props: NativeProps, ref: ForwardedRef<YamapRef>) => {
    const nativeRef = useRef(null);
    const {
      userLocationIcon,
      onMapLoaded,
      onCameraPositionChange,
      onCameraPositionChangeEnd,
      ...otherProps
    } = props;
    const viewId = findNodeHandle(nativeRef.current);

    useImperativeHandle(
      ref,
      () => ({
        getCameraPosition: async () => {
          return YamapUtils.getCameraPosition(viewId!);
        },
        setZoom: async (zoom: number) => {
          return YamapUtils.setZoom(viewId!, zoom);
        },
        setCenter: async (
          center: Point,
          zoom: number,
          azimuth: number,
          tilt: number,
          animationDuration: number
        ) => {
          return YamapUtils.setCenter(
            viewId!,
            center.lat,
            center.lon,
            zoom,
            azimuth,
            tilt,
            animationDuration
          );
        },
        fitAllMarkers: async (points: Point[]) => {
          return YamapUtils.fitAllMarkers(viewId!, points);
        },
      }),
      [viewId]
    );

    const userIcon = userLocationIcon
      ? Image.resolveAssetSource(userLocationIcon as ImageSourcePropType).uri
      : '';

    const handleMapLoaded = (event: NativeSyntheticEvent<MapLoaded>) => {
      if (onMapLoaded) {
        onMapLoaded({ ...event.nativeEvent } as any);
      }
    };

    const handleCameraPositionChange = (
      event: NativeSyntheticEvent<CameraPosition>
    ) => {
      if (!event.nativeEvent.finished) {
        if (onCameraPositionChange) {
          onCameraPositionChange({ ...event.nativeEvent } as any);
        }
      }
    };

    const handleCameraPositionChangeEnd = (
      event: NativeSyntheticEvent<CameraPosition>
    ) => {
      if (onCameraPositionChangeEnd) {
        onCameraPositionChangeEnd({ ...event.nativeEvent } as any);
      }
    };

    return (
      <YamapLiteView
        ref={nativeRef}
        onMapLoaded={handleMapLoaded}
        onCameraPositionChange={handleCameraPositionChange}
        onCameraPositionChangeEnd={handleCameraPositionChangeEnd}
        userLocationIcon={userIcon}
        {...otherProps}
      />
    );
  }
);
