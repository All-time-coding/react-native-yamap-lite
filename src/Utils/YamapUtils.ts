import { Platform, NativeModules } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-yamap-lite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

interface IYamapUtilsModule {
  initWithKey(key: string): Promise<void>;
}

const YamapUtilsModule = true
  ? require('../NativeYamapUtils').default
  : NativeModules.TurboExample;

export const YamapUtils: IYamapUtilsModule = YamapUtilsModule
  ? YamapUtilsModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
