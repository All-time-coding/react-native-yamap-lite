import type { ImageSourcePropType, ViewProps } from 'react-native';

export type YaMapRef = {
  getCameraPosition: () => Promise<{
    lat: number;
    lon: number;
    zoom: number;
    azimuth: number;
    tilt: number;
  }>;
  setZoom: (
    zoom: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => void;
  setCenter: (
    center: { lat: number; lon: number },
    zoom?: number,
    azimuth?: number,
    tilt?: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => void;
  fitAllMarkers: () => void;
};

export interface MarkerProps extends ViewProps {
  point: Point;
  zInd?: number;
  scale?: number;
  rotated?: boolean;
  onPress?: (event: Point) => void;
  source?: ImageSourcePropType;
  anchor?: {
    x: number;
    y: number;
  };
  visible?: boolean;
  handled?: boolean;
  size?: number;
}

export interface CircleProps extends ViewProps {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zInd?: number;
  onPress?: (event: Point) => void;
  center: Point;
  radius: number;
  handled?: boolean;
}

export interface YaMapProps extends ViewProps {
  userLocationIcon?: ImageSourcePropType;

  /** @default 1 */
  userLocationIconScale?: number;

  /** @default false */
  showUserPosition?: boolean;

  /** @default false */
  nightMode?: boolean;

  mapStyle?: string;

  onCameraPositionChange?: (event: CameraPosition) => void;

  onCameraPositionChangeEnd?: (event: CameraPosition) => void;

  onMapPress?: (event: Point) => void;

  onMapLongPress?: (event: Point) => void;

  onMapLoaded?: (event: MapLoaded) => void;

  /** @default #00FF00 */
  userLocationAccuracyFillColor?: string;

  /** @default #000000 */
  userLocationAccuracyStrokeColor?: string;

  /** @default 2 */
  userLocationAccuracyStrokeWidth?: number;

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

  /** @default 60 */
  maxFps?: number;

  /** @default 'map' */
  mapType?: 'map' | 'satellite' | 'hybrid';

  /** @default false */
  followUser?: boolean;

  logoPosition?: YandexLogoPosition;

  logoPadding?: YandexLogoPadding;
}

export interface ClusteredYamapProps<T = any> extends YaMapProps {
  clusteredMarkers: ReadonlyArray<{ point: Point; data: T }>;
  renderMarker: (
    info: { point: Point; data: T },
    index: number
  ) => React.ReactElement;
  clusterColor?: string;
}

export interface Point {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  southWest: Point;
  northEast: Point;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface MapLoaded {
  nativeEvent: {
    renderObjectCount: number;
    curZoomModelsLoaded: number;
    curZoomPlacemarksLoaded: number;
    curZoomLabelsLoaded: number;
    curZoomGeometryLoaded: number;
    tileMemoryUsage: number;
    delayedGeometryLoaded: number;
    fullyAppeared: number;
    fullyLoaded: number;
  };
}

export interface InitialRegion {
  lat: number;
  lon: number;
  zoom?: number;
  azimuth?: number;
  tilt?: number;
}

export type MasstransitVehicles =
  | 'bus'
  | 'trolleybus'
  | 'tramway'
  | 'minibus'
  | 'suburban'
  | 'underground'
  | 'ferry'
  | 'cable'
  | 'funicular';

export type Vehicles = MasstransitVehicles | 'walk' | 'car';

export interface DrivingInfo {
  time: string;
  timeWithTraffic: string;
  distance: number;
}

export interface MasstransitInfo {
  time: string;
  transferCount: number;
  walkingDistance: number;
}

export interface RouteInfo<T extends DrivingInfo | MasstransitInfo> {
  id: string;
  sections: {
    points: Point[];
    sectionInfo: T;
    routeInfo: T;
    routeIndex: number;
    stops: any[];
    type: string;
    transports?: any;
    sectionColor?: string;
  }[];
}

export interface RoutesFoundEvent<T extends DrivingInfo | MasstransitInfo> {
  nativeEvent: {
    status: 'success' | 'error';
    id: string;
    routes: RouteInfo<T>[];
  };
}

export interface CameraPosition {
  nativeEvent: {
    zoom: number;
    tilt: number;
    azimuth: number;
    point: { lat: number; lon: number };
    finished: boolean;
    target: number;
    reason: 'GESTURES' | 'APPLICATION';
  };
}

export type VisibleRegion = {
  bottomLeft: Point;
  bottomRight: Point;
  topLeft: Point;
  topRight: Point;
};

export enum Animation {
  SMOOTH,
  LINEAR,
}

export type YandexLogoPosition = {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'bottom';
};

export type YandexLogoPadding = {
  horizontal?: number;
  vertical?: number;
};
