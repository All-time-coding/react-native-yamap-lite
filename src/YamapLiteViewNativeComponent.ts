import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

interface Point {
  lat: Double;
  lon: Double;
}

interface YandexLogoPosition {
  vertical?: WithDefault<'top' | 'bottom', 'bottom'>;
  horizontal?: WithDefault<'left' | 'center' | 'right', 'left'>;
}

interface YandexLogoPadding {
  vertical?: Double;
  horizontal?: Double;
}

interface MapLoad {
  renderObjectCount: Double;
  curZoomModelsLoaded: Double;
  curZoomPlacemarksLoaded: Double;
  curZoomLabelsLoaded: Double;
  curZoomGeometryLoaded: Double;
  tileMemoryUsage: Double;
  delayedGeometryLoaded: Double;
  fullyAppeared: Double;
  fullyLoaded: Double;
}

interface InitialRegion {
  lat: Double;
  lon: Double;
  zoom?: Double;
  azimuth?: Double;
  tilt?: Double;
}

interface CameraPosition {
  finished: boolean;
  point: {
    lat: Double;
    lon: Double;
  };
  zoom: Double;
  azimuth: Double;
  tilt: Double;
  target: Double;
  reason: 'GESTURES' | 'APPLICATION';
}

export interface NativeProps extends ViewProps {
  userLocationIcon?: string;
  userLocationIconScale?: Float;
  /** @default false */
  showUserPosition?: boolean;
  /** @default false */
  nightMode?: boolean;
  mapStyle?: string;
  onCameraPositionChange?: DirectEventHandler<Readonly<CameraPosition>>;
  onCameraPositionChangeEnd?: DirectEventHandler<Readonly<CameraPosition>>;
  onMapPress?: DirectEventHandler<Readonly<Point>>;
  onMapLongPress?: DirectEventHandler<Readonly<Point>>;
  onMapLoaded?: DirectEventHandler<Readonly<MapLoad>>;
  /** @default #00FF00 */
  userLocationAccuracyFillColor?: string;
  /** @default #000000 */
  userLocationAccuracyStrokeColor?: string;
  /** @default 2 */
  userLocationAccuracyStrokeWidth?: Float;
  /** @default true */
  scrollGesturesEnabled?: boolean;
  /** @default true */
  zoomGesturesEnabled?: boolean;
  /** @default true */
  tiltGesturesEnabled?: boolean;
  /** @default true */
  rotateGesturesEnabled?: boolean;
  /** @default true */
  fastTapEnabled?: boolean;
  initialRegion?: InitialRegion;
  maxFps?: Float;
  mapType?: WithDefault<'map' | 'satellite' | 'hybrid', 'map'>;
  /** @default false */
  followUser?: boolean;
  logoPosition?: YandexLogoPosition;
  logoPadding?: YandexLogoPadding;
}

export type YamapViewComponent = HostComponent<NativeProps>;

export default codegenNativeComponent<NativeProps>('YamapLiteView');
