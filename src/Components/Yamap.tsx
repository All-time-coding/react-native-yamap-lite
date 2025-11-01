import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import type { NativeProps } from '../YamapLiteViewNativeComponent';
import { Image, type ImageSourcePropType } from 'react-native';
import type { Point, YamapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

export const YaMap = forwardRef(
  (props: NativeProps, ref: ForwardedRef<YamapRef>) => {
    const nativeRef = useRef(null);
    const { userLocationIcon, ...otherProps } = props;

    useImperativeHandle(
      ref,
      () => ({
        getCameraPosition: async () => {
          return YamapUtils.getCameraPosition(nativeRef.current!);
        },
        setZoom: async (zoom: number) => {
          return YamapUtils.setZoom(nativeRef.current!, zoom);
        },
        setCenter: async (
          center: Point,
          zoom: number,
          azimuth: number,
          tilt: number,
          animationDuration: number
        ) => {
          return YamapUtils.setCenter(
            nativeRef.current!,
            center.lat,
            center.lon,
            zoom,
            azimuth,
            tilt,
            animationDuration
          );
        },
      }),
      []
    );

    const userIcon = userLocationIcon
      ? Image.resolveAssetSource(userLocationIcon as ImageSourcePropType).uri
      : '';

    return (
      <YamapLiteView
        ref={nativeRef}
        {...otherProps}
        userLocationIcon={userIcon}
      />
    );
  }
);
