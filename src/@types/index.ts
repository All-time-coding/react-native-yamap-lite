import type { ImageSourcePropType, ViewProps } from 'react-native';

export type CameraPositionResult = {
  lat: number;
  lon: number;
  zoom: number;
  azimuth: number;
  tilt: number;
};

export type YaMapRef = {
  getCameraPosition: () => Promise<CameraPositionResult>;
  getVisibleRegion: () => Promise<VisibleRegion>;
  getScreenPoints: (points: Point[]) => Promise<ScreenPoint[]>;
  getWorldPoints: (points: ScreenPoint[]) => Promise<Point[]>;
  setZoom: (
    zoom: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => Promise<void>;
  setCenter: (
    center: { lat: number; lon: number },
    zoom?: number,
    azimuth?: number,
    tilt?: number,
    duration?: number,
    animation?: 'LINEAR' | 'SMOOTH'
  ) => Promise<void>;
  fitAllMarkers: () => Promise<void>;
  /** Alias for fitAllMarkers — lite SDK does not support targeting specific markers */
  fitMarkers: (markers: any[]) => Promise<void>;
  /** No-op — traffic layer is not available in lite SDK */
  setTrafficVisible: (visible: boolean) => void;
  getMapObjectCount: () => Promise<number>;
};

export type MarkerRef = {
  /**
   * @deprecated Not supported in lite SDK. Update the `point` prop instead
   */
  animatedMoveTo: (point: Point, duration: number) => void;
  /**
   * @deprecated Not supported in lite SDK
   */
  animatedRotateTo: (angle: number, duration: number) => void;
};

export interface MarkerProps extends ViewProps {
  point: Point;
  zIndex?: number;
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
  zIndex?: number;
  onPress?: (event: Point) => void;
  center: Point;
  radius: number;
  handled?: boolean;
}

export interface PolygonProps extends ViewProps {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;
  onPress?: (event: Point) => void;
  points: Point[];
  innerRings?: Point[][];
  handled?: boolean;
}

export interface PolylineProps extends ViewProps {
  strokeColor?: string;
  strokeWidth?: number;
  outlineColor?: string;
  outlineWidth?: number;
  zIndex?: number;
  dashLength?: number;
  gapLength?: number;
  dashOffset?: number;
  onPress?: (event: Point) => void;
  points: Point[];
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

  /**
   * Disables all map gestures when false.
   * @default true
   */
  interactive?: boolean;

  /** Fired after getCameraPosition() resolves — for backward compatibility with react-native-yamap */
  onCameraPositionReceived?: (event: {
    nativeEvent: CameraPositionResult;
  }) => void;

  /** Fired after getVisibleRegion() resolves — for backward compatibility with react-native-yamap */
  onVisibleRegionReceived?: (event: { nativeEvent: VisibleRegion }) => void;

  /** Fired after getScreenPoints() resolves — for backward compatibility with react-native-yamap */
  onWorldToScreenPointsReceived?: (event: {
    nativeEvent: { points: ScreenPoint[] };
  }) => void;

  /** Fired after getWorldPoints() resolves — for backward compatibility with react-native-yamap */
  onScreenToWorldPointsReceived?: (event: {
    nativeEvent: { points: Point[] };
  }) => void;
}

export interface ClusteredYamapProps<T = any> extends YaMapProps {
  clusteredMarkers: ReadonlyArray<{ point: Point; data: T }>;
  renderMarker: (
    info: { point: Point; data: T },
    index: number
  ) => React.ReactElement;
  /** @default #FF0000 */
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
