import { Platform, NativeModules } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-yamap-lite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

interface IYamapUtilsModule {
  getCameraPosition(viewId: number): Promise<{
    lat: number;
    lon: number;
    zoom: number;
    azimuth: number;
    tilt: number;
  }>;
  init(apiKey: string): Promise<void>;
  getLocale(): Promise<string>;
  setLocale(locale: string): Promise<void>;
  resetLocale(): Promise<void>;
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
