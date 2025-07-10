import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

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
  latitude: Double;
  longitude: Double;
  zoom?: Double;
  azimuth?: Double;
  tilt?: Double;
}
interface CameraPosition {
  latitude: Double;
  longitude: Double;
  zoom: Double;
  azimuth: Double;
  tilt: Double;
}

export interface NativeProps extends ViewProps {
  userLocationIcon?: string; //✅✅ from link
  userLocationIconScale?: Float; //✅✅
  showUserPosition?: boolean; //✅✅
  nightMode?: boolean; //✅✅
  mapStyle?: string;

  onCameraPositionChange?: DirectEventHandler<Readonly<CameraPosition>>; //✅✅
  onCameraPositionChangeEnd?: DirectEventHandler<Readonly<CameraPosition>>; //✅✅
  // onMapPress?: (event: NativeSyntheticEvent<Point>) => void;
  // onMapLongPress?: (event: NativeSyntheticEvent<Point>) => void;
  onMapLoaded?: DirectEventHandler<Readonly<MapLoad>>; //✅✅
  userLocationAccuracyFillColor?: string; //
  userLocationAccuracyStrokeColor?: string; //
  userLocationAccuracyStrokeWidth?: Float; //
  scrollGesturesEnabled?: boolean; //✅
  zoomGesturesEnabled?: boolean; //✅
  tiltGesturesEnabled?: boolean; //✅
  rotateGesturesEnabled?: boolean; //✅
  fastTapEnabled?: boolean; //✅
  initialRegion?: InitialRegion; //✅✅
  maxFps?: Float; //✅
  mapType?: WithDefault<'map' | 'satellite' | 'hybrid', 'map'>;
  followUser?: boolean;
  logoPosition?: YandexLogoPosition; //✅✅;
  logoPadding?: YandexLogoPadding; //✅✅;
}

export type YamapViewComponent = HostComponent<NativeProps>;
export interface YamapViewNativeCommands {
  getCameraPosition: (
    viewRef: React.ElementRef<YamapViewComponent>
  ) => Readonly<CameraPosition>;
  reload: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  setCenter: (
    viewRef: React.ElementRef<YamapViewComponent>,
    latitude: Double,
    longitude: Double,
    zoom: Float,
    azimuth: Float,
    tilt: Float,
    duration: Float
    // animation: string
  ) => void;
  setZoom: (
    viewRef: React.ElementRef<YamapViewComponent>,
    zoom?: Float
    // duration?: Float,
    // type?: string
  ) => void;
  fitAllMarkers: (viewRef: React.ElementRef<YamapViewComponent>) => void;
}

export const Commands = codegenNativeCommands<YamapViewNativeCommands>({
  supportedCommands: [
    'reload',
    'getCameraPosition',
    'setCenter',
    'setZoom',
    'fitAllMarkers',
  ],
});

export default codegenNativeComponent<NativeProps>('YamapLiteView');
