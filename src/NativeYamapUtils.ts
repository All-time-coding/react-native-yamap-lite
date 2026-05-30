import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';
import type { Point, ScreenPoint, VisibleRegion } from './@types';

export interface Spec extends TurboModule {
  getCameraPosition(viewId: Double): Promise<{
    lat: Double;
    lon: Double;
    zoom: Double;
    azimuth: Double;
    tilt: Double;
  }>;
  getScreenPoints(
    viewId: Double,
    points: Point[]
  ): Promise<{ points: ScreenPoint[] }>;
  getVisibleRegion(viewId: Double): Promise<VisibleRegion>;
  getWorldPoints(
    viewId: Double,
    points: ScreenPoint[]
  ): Promise<{ points: Point[] }>;
  fitAllMarkers(viewId: Double): Promise<void>;
  setZoom(
    viewId: Double,
    zoom: Double,
    duration: Double,
    animation: string
  ): Promise<void>;
  setCenter(
    viewId: Double,
    latitude: Double,
    longitude: Double,
    zoom: Double,
    azimuth: Double,
    tilt: Double,
    duration: Double,
    animation: string
  ): Promise<void>;

  init(apiKey: string): Promise<void>;
  getLocale(): Promise<string>;
  setLocale(locale: string): Promise<void>;
  resetLocale(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('YamapUtils');
