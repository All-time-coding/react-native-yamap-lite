import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';
import type { Point, ScreenPoint } from './@types';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): Promise<number>;

  getCameraPosition(viewId: Double): Promise<{
    latitude: Double;
    longitude: Double;
    zoom: Double;
    azimuth: Double;
    tilt: Double;
  }>;

  getScreenPoints(viewId: Double, points: Point[]): Promise<ScreenPoint>;
  getVisibleRegion(viewId: Double): Promise<unknown>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('YamapUtils');
