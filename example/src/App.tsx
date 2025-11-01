import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YaMap, YaMapMarker } from 'react-native-yamap-lite';

export default function App() {
  return (
    <View style={styles.container}>
      <YaMap style={styles.box}>
        <YaMapMarker
          point={{ lat: 55.551244, lon: 36.518423 }}
          source={'https://cdn-icons-png.flaticon.com/512/64/64113.png'}
          size={50}
          onMarkerPress={(event) => {
            console.log('Marker pressed', event.lat, event.lon);
          }}
        />
      </YaMap>
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
