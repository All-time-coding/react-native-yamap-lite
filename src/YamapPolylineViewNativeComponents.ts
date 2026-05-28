import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps, ColorValue } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Float,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

interface Point {
  lat: Double;
  lon: Double;
}

export interface NativeProps extends ViewProps {
  strokeColor?: ColorValue;
  strokeWidth?: Float;
  outlineColor?: ColorValue;
  zInd?: Int32;
  dashLength?: Float;
  gapLength?: Float;
  outlineWidth?: Float;
  dashOffset?: Float;
  onPolylinePress?: DirectEventHandler<Readonly<Point>>;
  points: Point[];
  handled?: boolean;
}

export type YamapLitePolylineViewComponent = HostComponent<NativeProps>;

export default codegenNativeComponent<NativeProps>('YamapLitePolylineView');
