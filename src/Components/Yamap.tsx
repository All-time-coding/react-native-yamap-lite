import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from 'react';
import type { NativeProps } from '../YamapLiteViewNativeComponent';
import {
  Alert,
  findNodeHandle,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import type { YamapRef } from '../@types';
import YamapLiteView, { Commands } from '../YamapLiteViewNativeComponent';
import { YamapLiteUtils } from 'react-native-yamap-lite';
const Yamap = (rest: NativeProps, ref: ForwardedRef<YamapRef>) => {
  const nativeRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      getCameraPosition: async () => {
        const handler = findNodeHandle(nativeRef.current) ?? -1;
        Alert.alert('111');

        return YamapLiteUtils.getCameraPosition(handler);
      },
      setZoom: (zoom: number) => {
        return Commands.setZoom(nativeRef.current!, zoom);
      },
      setCenter(center, zoom, azimuth, tilt, animation) {
        return Commands.setCenter(
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

  const userIcon = rest.userLocationIcon
    ? Image.resolveAssetSource(rest.userLocationIcon as ImageSourcePropType).uri
    : '';
  return (
    <YamapLiteView ref={nativeRef} {...rest} userLocationIcon={userIcon} />
  );
};

export default forwardRef(Yamap);
