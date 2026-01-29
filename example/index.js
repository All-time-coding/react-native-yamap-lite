import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { YamapUtils } from 'react-native-yamap-lite';
YamapUtils.init('any_api_key');
AppRegistry.registerComponent(appName, () => App);
