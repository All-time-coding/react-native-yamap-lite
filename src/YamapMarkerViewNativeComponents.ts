import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

interface Point {
  lat: Double;
  lon: Double;
}

export interface NativeProps extends ViewProps {
  point: Point;
  zInd?: Int32;
  scale?: Double;
  rotated?: boolean;
  onMarkerPress?: DirectEventHandler<Readonly<Point>>;
  source?: string; // ImageSourcePropType
  anchor?: {
    x: Double;
    y: Double;
  };
  visible?: boolean;
  handled?: boolean;
  size?: Int32;
}

export type YamapLiteMarkerViewComponent = HostComponent<NativeProps>;

export default codegenNativeComponent<NativeProps>('YamapLiteMarkerView');
