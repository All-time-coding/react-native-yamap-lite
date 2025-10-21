import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { YamapLiteView, YamapUtils } from 'react-native-yamap-lite';

export default function App() {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    YamapUtils.initWithKey('API_KEY').then(() => {
      setIsInitialized(true);
    });
  }, []);

  return (
    <View style={styles.container}>
      {isInitialized ? (
        <YamapLiteView style={styles.box} />
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    height: '100%',
  },
});
