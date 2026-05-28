/**
 * UI / smoke tests.
 *
 * @react-native-harness/ui provides screen.screenshot() which returns
 * { data: Uint8Array, width, height }. There is no built-in image-diff matcher,
 * so each test verifies:
 *   1. The map renders (screenshot is non-null with non-zero data).
 *   2. The native ref is accessible and camera position is valid.
 *   3. Where applicable, the camera lands at the expected coordinate.
 *
 * These are end-to-end smoke tests on a real simulator — they catch crashes,
 * hangs, and silent render failures that unit tests cannot.
 */
import React from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import { describe, test, expect, render } from 'react-native-harness';
import { screen } from '@react-native-harness/ui';
import {
  ClusteredYamap,
  Marker,
  YaMap,
  type YaMapRef,
} from 'react-native-yamap-lite';
import { INITIAL_REGION, MOSCOW } from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import { waitForMapReady, expectNear } from '../helpers';

const MAP_SIZE = 400;

const RED_ICON_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

const styles = StyleSheet.create({
  container: { width: MAP_SIZE, height: MAP_SIZE },
  map: { flex: 1 },
});

// ─── helpers ──────────────────────────────────────────────────────────────────

type SimpleMapHostProps = {
  mapRef: { current: YaMapRef | null };
  onLoaded: () => void;
  nightMode?: boolean;
  mapType?: string;
  children?: React.ReactNode;
};

function SimpleMapHost({
  mapRef,
  onLoaded,
  nightMode,
  mapType,
  children,
}: SimpleMapHostProps) {
  return (
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        nightMode={nightMode ?? false}
        mapType={(mapType as any) ?? 'map'}
        onMapLoaded={() => onLoaded()}
      >
        {children}
      </YaMap>
    </View>
  );
}

type ClusteredMapHostProps = {
  mapRef: { current: YaMapRef | null };
  onLoaded: () => void;
  markers: Array<{ point: { lat: number; lon: number }; data: { id: string } }>;
  clusterColor?: string;
};

function ClusteredMapHost({
  mapRef,
  onLoaded,
  markers,
  clusterColor,
}: ClusteredMapHostProps) {
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
            source={{ uri: RED_ICON_URI }}
            size={20}
          />
        )}
        clusterColor={clusterColor ?? '#e53935'}
        onMapLoaded={() => onLoaded()}
      />
    </View>
  );
}

async function renderSimpleMap(
  mapRef: { current: YaMapRef | null },
  props: Omit<SimpleMapHostProps, 'mapRef' | 'onLoaded'>
) {
  await ensureMapKitInitialized();
  let loaded = false;
  await render(
    <SimpleMapHost
      mapRef={mapRef}
      onLoaded={() => {
        loaded = true;
      }}
      {...props}
    />
  );
  await waitForMapReady(mapRef, () => loaded);
}

async function renderClusteredMap(
  mapRef: { current: YaMapRef | null },
  props: Omit<ClusteredMapHostProps, 'mapRef' | 'onLoaded'>
) {
  await ensureMapKitInitialized();
  let loaded = false;
  await render(
    <ClusteredMapHost
      mapRef={mapRef}
      onLoaded={() => {
        loaded = true;
      }}
      {...props}
    />
  );
  await waitForMapReady(mapRef, () => loaded);
}

function assertScreenshot(
  shot: { data: Uint8Array; width: number; height: number } | null
) {
  expect(shot).not.toBeNull();
  expect(shot!.data.length).toBeGreaterThan(0);
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('UI snapshots', () => {
  // ── 1. Night mode
  //  Verifies the map renders in both day and night modes without crashing.
  //  We can't pixel-diff tiles, but a non-null screenshot with non-zero data
  //  confirms the map surface actually painted something.
  describe('Night mode', () => {
    test('day mode renders without error', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderSimpleMap(mapRef, { nightMode: false });

      const shot = await screen.screenshot();
      assertScreenshot(shot);

      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });

    test('night mode renders without error', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderSimpleMap(mapRef, { nightMode: true });

      const shot = await screen.screenshot();
      assertScreenshot(shot);

      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });
  });

  // ── 2. Cluster bubble
  //  Five tightly-grouped Moscow markers → one cluster at zoom 10.
  //  Camera starts on INITIAL_REGION (Moscow) so getCameraPosition should
  //  be near Moscow after map loads.
  describe('Cluster bubble', () => {
    const CLUSTER_MARKERS = [
      { point: MOSCOW, data: { id: '1' } },
      {
        point: { lat: MOSCOW.lat + 0.001, lon: MOSCOW.lon + 0.001 },
        data: { id: '2' },
      },
      {
        point: { lat: MOSCOW.lat - 0.001, lon: MOSCOW.lon - 0.001 },
        data: { id: '3' },
      },
      {
        point: { lat: MOSCOW.lat + 0.001, lon: MOSCOW.lon - 0.001 },
        data: { id: '4' },
      },
      {
        point: { lat: MOSCOW.lat - 0.001, lon: MOSCOW.lon + 0.001 },
        data: { id: '5' },
      },
    ];

    test('cluster renders and camera is near the cluster center', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderClusteredMap(mapRef, {
        markers: CLUSTER_MARKERS,
        clusterColor: '#e53935',
      });

      const shot = await screen.screenshot();
      assertScreenshot(shot);

      const pos = await mapRef.current!.getCameraPosition();
      expectNear(pos.lat, MOSCOW.lat, 5);
      expectNear(pos.lon, MOSCOW.lon, 5);
    });

    test('cluster renders with custom clusterColor without crashing', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderClusteredMap(mapRef, {
        markers: CLUSTER_MARKERS.slice(0, 3),
        clusterColor: '#1565c0',
      });

      const shot = await screen.screenshot();
      assertScreenshot(shot);
    });
  });

  // ── 3. Marker icon
  //  A single marker at Moscow. We verify the map rendered and the screen
  //  point for Moscow is within the canvas bounds.
  describe('Marker icon', () => {
    test('marker renders and its screen position is within the map bounds', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderSimpleMap(mapRef, {
        children: (
          <Marker point={MOSCOW} source={{ uri: RED_ICON_URI }} size={24} />
        ),
      });

      const shot = await screen.screenshot();
      assertScreenshot(shot);

      // worldToScreen (matching react-native-yamap) returns physical pixels,
      // not logical points — so the upper bound is MAP_SIZE × device scale.
      const maxPx = MAP_SIZE * PixelRatio.get();
      const [screenPt] = await mapRef.current!.getScreenPoints([MOSCOW]);
      expect(screenPt).toBeDefined();
      expect(screenPt!.x).toBeGreaterThanOrEqual(0);
      expect(screenPt!.x).toBeLessThanOrEqual(maxPx);
      expect(screenPt!.y).toBeGreaterThanOrEqual(0);
      expect(screenPt!.y).toBeLessThanOrEqual(maxPx);
    });

    test('invisible marker renders without crash', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderSimpleMap(mapRef, {
        children: (
          <Marker
            point={MOSCOW}
            source={{ uri: RED_ICON_URI }}
            size={24}
            visible={false}
          />
        ),
      });

      const shot = await screen.screenshot();
      assertScreenshot(shot);
    });
  });

  // ── 4. Map type
  //  Satellite tiles are fetched from a different source. We verify the map
  //  renders (screenshot has data) and the camera position is finite.
  describe('Map type', () => {
    test('satellite mapType renders without error', async () => {
      const mapRef = { current: null as YaMapRef | null };
      await renderSimpleMap(mapRef, { mapType: 'satellite' });

      const shot = await screen.screenshot();
      assertScreenshot(shot);

      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });
  });
});
