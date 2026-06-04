import { YamapUtils } from '@exterio/react-native-yamap-lite';
import { YAMAP_API_KEY } from './constants';

/** @type {Promise<void> | null} */
let initPromise: Promise<void> | null = null;

export function ensureMapKitInitialized() {
  if (!initPromise) {
    initPromise = YamapUtils.init(YAMAP_API_KEY).catch((error) => {
      console.error('YamapUtils.init failed:', error);
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}
