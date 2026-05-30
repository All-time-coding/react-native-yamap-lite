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
  fillColor?: ColorValue;
  strokeColor?: ColorValue;
  strokeWidth?: Float;
  zInd?: Int32;
  onPolygonPress?: DirectEventHandler<Readonly<Point>>;
  points: Point[];
  innerRings?: Point[][];
  handled?: boolean;
}

export type YamapLitePolygonViewComponent = HostComponent<NativeProps>;

export default codegenNativeComponent<NativeProps>('YamapLitePolygonView');
