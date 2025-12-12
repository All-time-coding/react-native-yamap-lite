import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YaMap, Marker, Circle } from 'react-native-yamap-lite';
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
    onMapPress,
    onMapLongPress,
  } = useMap();

  return (
    <View style={styles.container}>
      {/* <ClusteredYamap
        ref={mapRef}
        style={styles.box}
        initialRegion={{ lat: 55.551244, lon: 36.518423, zoom: 10 }}
        onMapLoaded={onMapLoaded}
        onCameraPositionChange={onCameraPositionChange}
        onCameraPositionChangeEnd={onCameraPositionChangeEnd}
        onMapPress={onMapPress}
        onMapLongPress={onMapLongPress}
        zoomGesturesEnabled={false}
        scrollGesturesEnabled={false}
        tiltGesturesEnabled={false}
        rotateGesturesEnabled={false}
        fastTapEnabled={false}
        nightMode={true}
        showUserPosition={true}
        userLocationIcon={require('./assets/user-pin.png')}
        userLocationIconScale={1.5}
        userLocationAccuracyFillColor="#ff0000"
        userLocationAccuracyStrokeColor="#ff0000"
        userLocationAccuracyStrokeWidth={100}
        logoPadding={{ horizontal: 100, vertical: 100 }}
        logoPosition={{ horizontal: 'left', vertical: 'bottom' }}
        followUser={true}
        renderMarker={({ point, data }) => (
          <Marker
            key={`${point.lat}-${point.lon}-${data.index}`}
            point={point}
            source={{ uri: data.source }}
            size={data.size}
          />
        )}
        clusteredMarkers={markers.map((marker) => ({
          point: marker,
          data: marker,
        }))}
      /> */}
      <YaMap
        ref={mapRef}
        style={styles.box}
        initialRegion={{ lat: 55.551244, lon: 36.518423, zoom: 10 }}
        onMapLoaded={onMapLoaded}
        onCameraPositionChange={onCameraPositionChange}
        onCameraPositionChangeEnd={onCameraPositionChangeEnd}
        onMapPress={onMapPress}
        onMapLongPress={onMapLongPress}
        zoomGesturesEnabled={false}
        scrollGesturesEnabled={false}
        tiltGesturesEnabled={false}
        rotateGesturesEnabled={false}
        fastTapEnabled={false}
        nightMode={true}
        showUserPosition={true}
        userLocationIcon={{
          uri: 'https://www.shutterstock.com/image-vector/user-location-icon-vector-graphics-260nw-1496198948.jpg',
        }}
        userLocationIconScale={1.5}
        userLocationAccuracyFillColor="#ff0000"
        userLocationAccuracyStrokeColor="#ff0000"
        userLocationAccuracyStrokeWidth={100}
        logoPadding={{ horizontal: 100, vertical: 100 }}
        logoPosition={{ horizontal: 'left', vertical: 'bottom' }}
        followUser={true}
      >
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lon}-${index}`}
            point={{ lat: marker.lat, lon: marker.lon }}
            source={{ uri: marker.source }}
            size={marker.size}
            onPress={(event) => {
              console.log('Marker pressed', event);
            }}
          />
        ))}
        <Circle
          center={{ lat: 55.751244, lon: 36.518423 }}
          radius={10000}
          fillColor="#0000ff"
          strokeColor="#ff0000"
          strokeWidth={10}
          zInd={1000}
          onPress={(event) => {
            console.log('Circle pressed', event);
          }}
        />
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
