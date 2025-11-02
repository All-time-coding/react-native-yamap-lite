import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import type { NativeProps } from '../YamapLiteViewNativeComponent';
import { findNodeHandle, Image, type ImageSourcePropType } from 'react-native';
import type { Point, YamapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

// 'reload',
export const YaMap = forwardRef(
  (props: NativeProps, ref: ForwardedRef<YamapRef>) => {
    const nativeRef = useRef(null);
    const { userLocationIcon, ...otherProps } = props;
    const viewId = findNodeHandle(nativeRef.current);

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

    const userIcon = userLocationIcon
      ? Image.resolveAssetSource(userLocationIcon as ImageSourcePropType).uri
      : '';

    return (
      <YamapLiteView
        ref={nativeRef}
        userLocationIcon={userIcon}
        {...otherProps}
      />
    );
  }
);
