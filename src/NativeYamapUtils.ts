import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';
import type { Point, ScreenPoint } from './@types';

export interface Spec extends TurboModule {
  getCameraPosition(viewId: Double): Promise<{
    latitude: Double;
    longitude: Double;
    zoom: Double;
    azimuth: Double;
    tilt: Double;
  }>;
  getScreenPoints(viewId: Double, points: Point[]): Promise<ScreenPoint>;
  getVisibleRegion(viewId: Double): Promise<unknown>;
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
}

export default TurboModuleRegistry.getEnforcing<Spec>('YamapUtils');
