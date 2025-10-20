import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import type { NativeProps } from '../YamapLiteViewNativeComponent';
import { Image, type ImageSourcePropType } from 'react-native';
import type { YamapRef } from '../@types';
import YamapLiteView from '../YamapLiteViewNativeComponent';
import { YamapUtils } from '../Utils/YamapUtils';

const Yamap = (props: NativeProps, ref: ForwardedRef<YamapRef>) => {
  const nativeRef = useRef(null);
  const { userLocationIcon, ...otherProps } = props;

  useImperativeHandle(
    ref,
    () => ({
      getCameraPosition: async () => {
        return YamapUtils.getCameraPosition(nativeRef.current!);
      },
      setZoom: (zoom: number) => {
        return YamapUtils.setZoom(nativeRef.current!, zoom);
      },
      setCenter(center, zoom, azimuth, tilt, animation) {
        return YamapUtils.setCenter(
          nativeRef.current!,
          center.lat,
          center.lon,
          zoom,
          azimuth,
          tilt,
          animation
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
};

export default forwardRef(Yamap);
