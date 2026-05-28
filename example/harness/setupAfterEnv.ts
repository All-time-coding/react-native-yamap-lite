import { afterEach, beforeAll, cleanup } from 'react-native-harness';
import { ensureMapKitInitialized } from './ensureMapKitInit';

beforeAll(async () => {
  await ensureMapKitInitialized();
});

afterEach(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 300));
});
