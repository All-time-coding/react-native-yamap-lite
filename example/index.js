import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { ensureMapKitInitialized } from './harness/ensureMapKitInit';

ensureMapKitInitialized().catch((error) => {
  console.warn('YamapUtils.init failed:', error);
});

AppRegistry.registerComponent(appName, () => App);
