import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { YaMap, Marker } from 'react-native-yamap-lite';
import type { YamapRef } from '../../src/@types';

const markers = [
  {
    lat: 55.551244,
    lon: 36.518423,
    source: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    size: 20,
  },
  {
    lat: 43.1164,
    lon: 131.8826,
    source: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    size: 40,
  },
];

export default function App() {
  const mapRef = React.useRef<YamapRef>(null);
  const [zoom, setZoom] = React.useState(10);

  const handleIncreaseZoom = async () => {
    setZoom(zoom + 1);
    await mapRef.current?.setZoom(zoom, 1000, 'SMOOTH');
  };

  const handleDecreaseZoom = async () => {
    setZoom(zoom - 1);
    await mapRef.current?.setZoom(zoom, 1000, 'LINEAR');
  };

  const handleGetCameraPosition = async () => {
    const cameraPosition = await mapRef.current?.getCameraPosition();
    console.log('Camera position', cameraPosition);
  };

  const handleCenterMap = async () => {
    await mapRef.current?.setCenter(
      { lat: 55.551244, lon: 36.518423 },
      10,
      0,
      0,
      1000,
      'SMOOTH'
    );
  };

  const handleFitAllMarkers = async () => {
    await mapRef.current?.fitAllMarkers();
  };

  return (
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.box}
        initialRegion={{ lat: 55.551244, lon: 36.518423, zoom: 10 }}
        onMapLoaded={({ nativeEvent }) => {
          console.log('Map loaded', nativeEvent);
        }}
        onCameraPositionChange={({ nativeEvent }) => {
          console.log('Camera position changed', nativeEvent);
        }}
        onCameraPositionChangeEnd={({ nativeEvent }) => {
          console.log('Camera position changed end', nativeEvent);
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lon}-${index}`}
            point={{ lat: marker.lat, lon: marker.lon }}
            source={marker.source}
            size={marker.size}
            onMarkerPress={(event) => {
              console.log('Marker pressed', event);
            }}
          />
        ))}
      </YaMap>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleIncreaseZoom} style={styles.button}>
          <Text style={styles.buttonTextPlusMinus}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDecreaseZoom} style={styles.button}>
          <Text style={styles.buttonTextPlusMinus}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGetCameraPosition}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Cam</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCenterMap} style={styles.button}>
          <Text style={styles.buttonText}>Center</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFitAllMarkers} style={styles.button}>
          <Text style={styles.buttonText}>Fit All</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    gap: 10,
    position: 'absolute',
    right: 20,
  },
  button: {
    borderRadius: 10,
    width: 50,
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextPlusMinus: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
  },
});
