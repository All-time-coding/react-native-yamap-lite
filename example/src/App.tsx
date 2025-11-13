import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YaMap, Marker } from 'react-native-yamap-lite';
import { markers } from './constants/markers';
import { useMap } from './hooks/useMap';
import { ControlPanel } from './components/ControlPanel';

export default function App() {
  const {
    mapRef,
    handleIncreaseZoom,
    handleDecreaseZoom,
    handleGetCameraPosition,
    handleCenterMap,
    handleFitAllMarkers,
    onMapLoaded,
    onCameraPositionChange,
    onCameraPositionChangeEnd,
  } = useMap();

  return (
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.box}
        initialRegion={{ lat: 55.551244, lon: 36.518423, zoom: 10 }}
        onMapLoaded={onMapLoaded}
        onCameraPositionChange={onCameraPositionChange}
        onCameraPositionChangeEnd={onCameraPositionChangeEnd}
        zoomGesturesEnabled={false}
        scrollGesturesEnabled={false}
        tiltGesturesEnabled={false}
        rotateGesturesEnabled={false}
        fastTapEnabled={false}
        nightMode={true}
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
      <ControlPanel
        handleIncreaseZoom={handleIncreaseZoom}
        handleDecreaseZoom={handleDecreaseZoom}
        handleGetCameraPosition={handleGetCameraPosition}
        handleCenterMap={handleCenterMap}
        handleFitAllMarkers={handleFitAllMarkers}
      />
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
