import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  describe,
  test,
  expect,
  render,
  waitUntil,
} from 'react-native-harness';
import {
  ClusteredYamap,
  Marker,
  type ClusteredYamapProps,
  type YaMapRef,
} from '@atc/react-native-yamap-lite';
import { CAMERA_ANIMATION_TIMEOUT, INITIAL_REGION, MOSCOW } from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import { waitForMapReady, expectNear } from '../helpers';

const styles = StyleSheet.create({
  container: { width: 400, height: 400 },
  map: { flex: 1 },
});

const ICON_URI = 'https://cdn-icons-png.flaticon.com/512/64/64113.png';

const CLUSTERED_MARKERS = [
  { point: { lat: MOSCOW.lat, lon: MOSCOW.lon }, data: { id: '1' } },
  {
    point: { lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon + 0.01 },
    data: { id: '2' },
  },
  {
    point: { lat: MOSCOW.lat - 0.01, lon: MOSCOW.lon - 0.01 },
    data: { id: '3' },
  },
  { point: { lat: 59.9343, lon: 30.3351 }, data: { id: '4' } },
  { point: { lat: 59.94, lon: 30.34 }, data: { id: '5' } },
];

const UPDATED_MARKERS = [
  {
    point: { lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon + 0.05 },
    data: { id: '6' },
  },
  {
    point: { lat: MOSCOW.lat - 0.05, lon: MOSCOW.lon - 0.05 },
    data: { id: '7' },
  },
];

// ─── host components ──────────────────────────────────────────────────────────

type ClusteredMapHostProps = Pick<
  ClusteredYamapProps,
  | 'clusteredMarkers'
  | 'renderMarker'
  | 'clusterColor'
  | 'children'
  | 'nightMode'
  | 'mapType'
> & {
  mapRef: React.MutableRefObject<YaMapRef | null>;
  onLoaded: () => void;
};

function ClusteredMapHost({
  mapRef,
  onLoaded,
  clusteredMarkers,
  renderMarker,
  clusterColor,
  nightMode,
  mapType,
  children,
}: ClusteredMapHostProps) {
  return (
    <View style={styles.container}>
      <ClusteredYamap
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        clusteredMarkers={clusteredMarkers}
        renderMarker={renderMarker}
        clusterColor={clusterColor}
        nightMode={nightMode}
        mapType={mapType}
        onMapLoaded={onLoaded}
      >
        {children}
      </ClusteredYamap>
    </View>
  );
}

// Self-updating host: starts with initialMarkers, swaps to updatedMarkers
// after `delayMs`. Used to test dynamic clusteredMarkers prop updates.
type DynamicMarkersHostProps = {
  mapRef: React.MutableRefObject<YaMapRef | null>;
  onLoaded: () => void;
  initialMarkers: typeof CLUSTERED_MARKERS;
  updatedMarkers: typeof CLUSTERED_MARKERS;
  delayMs: number;
  onUpdated: () => void;
};

function DynamicMarkersHost({
  mapRef,
  onLoaded,
  initialMarkers,
  updatedMarkers,
  delayMs,
  onUpdated,
}: DynamicMarkersHostProps) {
  const [markers, setMarkers] = useState(initialMarkers);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMarkers(updatedMarkers);
      onUpdated();
    }, delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <ClusteredYamap
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        clusteredMarkers={markers}
        renderMarker={({ point, data }) => (
          <Marker
            key={data.id}
            point={point}
            source={{ uri: ICON_URI }}
            size={24}
          />
        )}
        clusterColor="#ff00ff"
        onMapLoaded={onLoaded}
      />
    </View>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function renderClusteredMap(
  options: Partial<Omit<ClusteredMapHostProps, 'mapRef' | 'onLoaded'>> = {}
): Promise<{ mapRef: React.MutableRefObject<YaMapRef | null> }> {
  await ensureMapKitInitialized();

  const mapRef = { current: null as YaMapRef | null };
  let mapLoaded = false;

  await render(
    <ClusteredMapHost
      mapRef={mapRef}
      onLoaded={() => {
        mapLoaded = true;
      }}
      clusteredMarkers={options.clusteredMarkers ?? CLUSTERED_MARKERS}
      renderMarker={
        options.renderMarker ??
        (({ point, data }) => (
          <Marker
            key={data.id}
            point={point}
            source={{ uri: ICON_URI }}
            size={24}
          />
        ))
      }
      clusterColor={options.clusterColor ?? '#ff00ff'}
      nightMode={options.nightMode}
      mapType={options.mapType}
      children={options.children}
    />
  );

  await waitForMapReady(mapRef, () => mapLoaded);
  return { mapRef };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('ClusteredYamap', () => {
  // ─── mount ────────────────────────────────────────────────────────────────

  test('mounts with clustered markers and ref is accessible', async () => {
    const { mapRef } = await renderClusteredMap();
    expect(mapRef.current).not.toBeNull();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with an empty markers list', async () => {
    const { mapRef } = await renderClusteredMap({ clusteredMarkers: [] });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with custom clusterColor', async () => {
    const { mapRef } = await renderClusteredMap({ clusterColor: '#00aaff' });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── display modes ────────────────────────────────────────────────────────

  test('renders with nightMode=true without crashing', async () => {
    const { mapRef } = await renderClusteredMap({ nightMode: true });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('renders with mapType="satellite" without crashing', async () => {
    const { mapRef } = await renderClusteredMap({ mapType: 'satellite' });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('renders with mapType="hybrid" without crashing', async () => {
    const { mapRef } = await renderClusteredMap({ mapType: 'hybrid' });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── imperative API ───────────────────────────────────────────────────────

  test('fitAllMarkers completes without error', async () => {
    const { mapRef } = await renderClusteredMap();

    await expect(mapRef.current!.fitAllMarkers()).resolves.toBeUndefined();
  });

  test('setZoom works on clustered map', async () => {
    const { mapRef } = await renderClusteredMap();
    const targetZoom = 13;

    await mapRef.current!.setZoom(targetZoom, 0, 'LINEAR');

    await waitUntil(
      async () => {
        const pos = await mapRef.current!.getCameraPosition();
        return Math.abs(pos.zoom - targetZoom) < 1;
      },
      { timeout: CAMERA_ANIMATION_TIMEOUT }
    );

    const pos = await mapRef.current!.getCameraPosition();
    expectNear(pos.zoom, targetZoom, 1);
  });

  test('setCenter moves the camera', async () => {
    const { mapRef } = await renderClusteredMap();
    const target = { lat: 59.9343, lon: 30.3351 };

    await mapRef.current!.setCenter(target, 10, 0, 0, 0, 'LINEAR');

    await waitUntil(
      async () => {
        const pos = await mapRef.current!.getCameraPosition();
        return Math.abs(pos.lat - target.lat) < 1;
      },
      { timeout: CAMERA_ANIMATION_TIMEOUT }
    );

    const pos = await mapRef.current!.getCameraPosition();
    expectNear(pos.lat, target.lat);
    expectNear(pos.lon, target.lon);
  });

  // ─── dynamic prop updates ─────────────────────────────────────────────────

  test('updates clusteredMarkers prop without crashing', async () => {
    await ensureMapKitInitialized();

    const mapRef = { current: null as YaMapRef | null };
    let mapLoaded = false;
    let markersUpdated = false;

    await render(
      <DynamicMarkersHost
        mapRef={mapRef}
        onLoaded={() => {
          mapLoaded = true;
        }}
        initialMarkers={CLUSTERED_MARKERS}
        updatedMarkers={UPDATED_MARKERS}
        delayMs={1500}
        onUpdated={() => {
          markersUpdated = true;
        }}
      />
    );

    await waitForMapReady(mapRef, () => mapLoaded);

    // Wait for the internal state update to fire
    await waitUntil(() => markersUpdated, { timeout: 5000 });

    // Map must still be interactive after a prop update
    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('updates from populated to empty clusteredMarkers without crashing', async () => {
    await ensureMapKitInitialized();

    const mapRef = { current: null as YaMapRef | null };
    let mapLoaded = false;
    let markersUpdated = false;

    await render(
      <DynamicMarkersHost
        mapRef={mapRef}
        onLoaded={() => {
          mapLoaded = true;
        }}
        initialMarkers={CLUSTERED_MARKERS}
        updatedMarkers={[]}
        delayMs={1500}
        onUpdated={() => {
          markersUpdated = true;
        }}
      />
    );

    await waitForMapReady(mapRef, () => mapLoaded);
    await waitUntil(() => markersUpdated, { timeout: 5000 });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── children (overlays inside ClusteredYamap) ────────────────────────────

  test('renders with overlay children without crashing', async () => {
    const { mapRef } = await renderClusteredMap({
      children: <Marker point={MOSCOW} source={{ uri: ICON_URI }} size={24} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });
});
