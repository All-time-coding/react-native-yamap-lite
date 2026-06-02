import {
  androidPlatform,
  androidEmulator,
  physicalAndroidDevice,
} from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';

// By default we run against an already-connected device (e.g. Genymotion),
// which only needs `adb`. Set HARNESS_ANDROID_AVD to make the harness manage
// its own SDK AVD instead (requires a runnable `emulator` binary).
const androidDevice = process.env.HARNESS_ANDROID_AVD
  ? androidEmulator(process.env.HARNESS_ANDROID_AVD, {
      apiLevel: Number(process.env.HARNESS_ANDROID_API_LEVEL ?? 35),
      profile: process.env.HARNESS_ANDROID_PROFILE ?? 'pixel_6',
      diskSize: '2G',
      heapSize: '2G',
    })
  : physicalAndroidDevice(
      process.env.HARNESS_ANDROID_MANUFACTURER ?? 'Genymobile',
      process.env.HARNESS_ANDROID_MODEL ?? 'Pixel 3 XL'
    );

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'YamapLiteExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: androidDevice,
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
  bridgeTimeout: 30_000,
  platformReadyTimeout: 120_000,
  bundleStartTimeout: 120_000,
  resetEnvironmentBetweenTestFiles: true,
  forwardClientLogs: true,
  disableViewFlattening: true,
  detectNativeCrashes: true,
  crashDetectionInterval: 500,

  coverage: {
    root: '..',
  },
};

export default config;
