import { Platform } from 'react-native';
import { YamapUtils } from 'react-native-yamap-lite';
import { YAMAP_API_KEY } from './constants';

/** @type {Promise<void> | null} */
let initPromise: Promise<void> | null = null;

export function ensureMapKitInitialized() {
  if (Platform.OS !== 'ios') {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = YamapUtils.init(YAMAP_API_KEY).catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}
