import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YaMap, Marker } from 'react-native-yamap-lite';
import type { YamapRef } from '../../src/@types';

export default function App() {
  const mapRef = React.useRef<YamapRef>(null);

  return (
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.box}
        onMapLoaded={(event) => {
          console.log('Map loaded', event);
        }}
        onCameraPositionChange={(event) => {
          console.log('Camera position changed', event);
        }}
        onCameraPositionChangeEnd={(event) => {
          console.log('Camera position changed end', event);
        }}
      >
        <Marker
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
