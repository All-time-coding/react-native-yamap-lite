import { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import {
  YaMap,
  ClusteredYamap,
  Marker,
  Circle,
  Polygon,
  Polyline,
} from '@exterio/react-native-yamap-lite';
import { ensureMapKitInitialized } from '../harness/ensureMapKitInit';
import { markers } from './constants/markers';
import {
  CIRCLE,
  POLYGON_POINTS,
  POLYGON_INNER_RING,
  POLYLINE_POINTS,
} from './constants/overlays';
import { useMap } from './hooks/useMap';
import { useMapSettings } from './hooks/useMapSettings';
import { useEventLog } from './hooks/useEventLog';
import { ControlPanel, SettingsBar, EventLog } from './components';

const INITIAL_REGION = { lat: 55.7558, lon: 37.6173, zoom: 10 };

export default function App() {
  const [mapKitReady, setMapKitReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureMapKitInitialized()
      .then(() => {
        if (!cancelled) setMapKitReady(true);
      })
      .catch((error) => {
        console.warn('YamapUtils.init failed:', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { events, log } = useEventLog();
  const {
    mapMode,
    mapType,
    nightMode,
    showCircle,
    showPolygon,
    showPolyline,
    scrollGesturesEnabled,
    zoomGesturesEnabled,
    cycleMapType,
    toggleMapMode,
    toggleNightMode,
    toggleCircle,
    togglePolygon,
    togglePolyline,
    toggleScrollGestures,
    toggleZoomGestures,
  } = useMapSettings();

  const {
    mapRef,
    cameraInfo,
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
  } = useMap(log);

  const sharedMapProps = {
    ref: mapRef,
    style: styles.map,
    initialRegion: INITIAL_REGION,
    mapType,
    nightMode,
    scrollGesturesEnabled,
    zoomGesturesEnabled,
    onMapLoaded,
    onCameraPositionChange,
    onCameraPositionChangeEnd,
    onMapPress,
    onMapLongPress,
    userLocationIcon: require('./assets/user-pin.png'),
    userLocationIconScale: 1.2,
    userLocationAccuracyFillColor: '#4488ff33',
    userLocationAccuracyStrokeColor: '#4488ff',
    userLocationAccuracyStrokeWidth: 2,
    logoPadding: { horizontal: 8, vertical: 8 },
    logoPosition: { horizontal: 'left' as const, vertical: 'bottom' as const },
  };

  const overlays = (
    <>
      {showCircle && (
        <Circle
          center={CIRCLE.center}
          radius={CIRCLE.radius}
          fillColor={CIRCLE.fillColor}
          strokeColor={CIRCLE.strokeColor}
          strokeWidth={CIRCLE.strokeWidth}
          zIndex={1}
          onPress={(pt) =>
            log(`circlePress: ${pt.lat.toFixed(4)}, ${pt.lon.toFixed(4)}`)
          }
        />
      )}
      {showPolygon && (
        <Polygon
          points={POLYGON_POINTS}
          innerRings={[POLYGON_INNER_RING]}
          fillColor="#ff884433"
          strokeColor="#ff4400"
          strokeWidth={2}
          zIndex={2}
          onPress={(pt) =>
            log(`polygonPress: ${pt.lat.toFixed(4)}, ${pt.lon.toFixed(4)}`)
          }
        />
      )}
      {showPolyline && (
        <Polyline
          points={POLYLINE_POINTS}
          strokeColor="#00cc88"
          strokeWidth={4}
          outlineColor="#004422"
          outlineWidth={1}
          zIndex={3}
          onPress={(pt) =>
            log(`polylinePress: ${pt.lat.toFixed(4)}, ${pt.lon.toFixed(4)}`)
          }
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SettingsBar
        mapMode={mapMode}
        mapType={mapType}
        nightMode={nightMode}
        showCircle={showCircle}
        showPolygon={showPolygon}
        showPolyline={showPolyline}
        scrollGesturesEnabled={scrollGesturesEnabled}
        zoomGesturesEnabled={zoomGesturesEnabled}
        onToggleMapMode={toggleMapMode}
        onCycleMapType={cycleMapType}
        onToggleNightMode={toggleNightMode}
        onToggleCircle={toggleCircle}
        onTogglePolygon={togglePolygon}
        onTogglePolyline={togglePolyline}
        onToggleScroll={toggleScrollGestures}
        onToggleZoom={toggleZoomGestures}
      />

      <View style={styles.mapContainer}>
        {!mapKitReady ? null : mapMode === 'clustered' ? (
          <ClusteredYamap
            {...sharedMapProps}
            clusterColor="#ff00ff"
            clusteredMarkers={markers.map((m) => ({ point: m, data: m }))}
            renderMarker={({ point, data }) => (
              <Marker
                key={`${point.lat}-${point.lon}`}
                point={point}
                source={{ uri: data.source }}
                size={data.size}
                onPress={(pt) =>
                  log(`markerPress: ${pt.lat.toFixed(4)}, ${pt.lon.toFixed(4)}`)
                }
              />
            )}
          >
            {overlays}
          </ClusteredYamap>
        ) : (
          <YaMap {...sharedMapProps}>
            {markers.map((m, i) => (
              <Marker
                key={`${m.lat}-${m.lon}-${i}`}
                point={m}
                source={{ uri: m.source }}
                size={m.size}
                onPress={(pt) =>
                  log(`markerPress: ${pt.lat.toFixed(4)}, ${pt.lon.toFixed(4)}`)
                }
              />
            ))}
            {overlays}
          </YaMap>
        )}

        <ControlPanel
          onIncreaseZoom={handleIncreaseZoom}
          onDecreaseZoom={handleDecreaseZoom}
          onGetCameraPosition={handleGetCameraPosition}
          onCenterMap={handleCenterMap}
          onFitAllMarkers={handleFitAllMarkers}
        />
      </View>

      <EventLog events={events} cameraInfo={cameraInfo} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
