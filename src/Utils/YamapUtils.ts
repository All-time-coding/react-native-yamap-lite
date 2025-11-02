import { Platform, NativeModules } from 'react-native';
import type { CameraPosition } from '../@types';

const LINKING_ERROR =
  `The package 'react-native-yamap-lite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

interface IYamapUtilsModule {
  getCameraPosition(viewId: number): Promise<CameraPosition>;
  setZoom(
    viewId: number,
    zoom: number,
    duration: number,
    animation: 'LINEAR' | 'SMOOTH'
  ): Promise<void>;
  setCenter(
    viewId: number,
    latitude: number,
    longitude: number,
    zoom: number,
    azimuth: number,
    tilt: number,
    duration: number,
    animation: 'LINEAR' | 'SMOOTH'
  ): Promise<void>;
  fitAllMarkers(viewId: number): Promise<void>;
}

const YamapUtilsModule = true
  ? require('../NativeYamapUtils').default
  : NativeModules.TurboExample;

export const YamapUtils: IYamapUtilsModule = YamapUtilsModule
  ? YamapUtilsModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
