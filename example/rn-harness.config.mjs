import {
  androidPlatform,
  androidEmulator,
} from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'YamapLiteExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: androidEmulator(
        process.env.HARNESS_ANDROID_AVD ?? 'Pixel_8_API_35',
        {
          apiLevel: Number(process.env.HARNESS_ANDROID_API_LEVEL ?? 35),
          profile: process.env.HARNESS_ANDROID_PROFILE ?? 'pixel_6',
          diskSize: '2G',
          heapSize: '2G',
        }
      ),
      bundleId: 'yamaplite.example',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator(
        process.env.HARNESS_IOS_DEVICE ?? 'iPhone 17 Pro',
        process.env.HARNESS_IOS_VERSION ?? '26.1'
      ),
      bundleId: 'yamaplite.example',
    }),
  ],

  defaultRunner: 'ios',
  bridgeTimeout: 120_000,
  platformReadyTimeout: 120_000,
  bundleStartTimeout: 120_000,
  resetEnvironmentBetweenTestFiles: true,
  forwardClientLogs: true,
  disableViewFlattening: true,

  coverage: {
    root: '..',
  },
};

export default config;
