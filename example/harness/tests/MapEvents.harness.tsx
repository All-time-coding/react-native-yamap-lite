import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  describe,
  test,
  expect,
  render,
  waitUntil,
} from 'react-native-harness';
import {
  YaMap,
  type YaMapRef,
  type CameraPosition,
  type MapLoaded,
} from '@exterio/react-native-yamap-lite';
import {
  INITIAL_REGION,
  MOSCOW,
  CAMERA_ANIMATION_TIMEOUT,
  MAP_LOAD_TIMEOUT,
} from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import { waitForMapReady, expectNear } from '../helpers';

const styles = StyleSheet.create({
  container: { width: 400, height: 400 },
  map: { flex: 1 },
});

// ─── helpers ──────────────────────────────────────────────────────────────────

type EventMapOptions = {
  onMapLoaded?: (e: MapLoaded) => void;
  onCameraPositionChange?: (e: CameraPosition) => void;
  onCameraPositionChangeEnd?: (e: CameraPosition) => void;
};

async function renderEventMap(
  opts: EventMapOptions = {}
): Promise<{ mapRef: React.MutableRefObject<YaMapRef | null> }> {
  await ensureMapKitInitialized();

  const mapRef = { current: null as YaMapRef | null };
  let mapLoaded = false;

  await render(
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onMapLoaded={(e) => {
          mapLoaded = true;
          opts.onMapLoaded?.(e);
        }}
        onCameraPositionChange={opts.onCameraPositionChange}
        onCameraPositionChangeEnd={opts.onCameraPositionChangeEnd}
      />
    </View>
  );

  await waitForMapReady(mapRef, () => mapLoaded);
  return { mapRef };
}

// ─── onMapLoaded ──────────────────────────────────────────────────────────────

describe('Map events', () => {
  describe('onMapLoaded', () => {
    test('fires with a valid data shape', async () => {
      let loadedEvent: MapLoaded['nativeEvent'] | null = null;

      await renderEventMap({
        onMapLoaded: (e) => {
          loadedEvent = e.nativeEvent;
        },
      });

      // waitForMapReady can return via getCameraPosition() before onMapLoaded
      // fires from the native side — wait for it explicitly.
      await waitUntil(() => loadedEvent !== null, {
        timeout: MAP_LOAD_TIMEOUT,
      });

      expect(loadedEvent).not.toBeNull();
      expect(typeof loadedEvent!.renderObjectCount).toBe('number');
      expect(typeof loadedEvent!.fullyLoaded).toBe('number');
      expect(typeof loadedEvent!.tileMemoryUsage).toBe('number');
    });
  });

  // ─── onCameraPositionChangeEnd ─────────────────────────────────────────────

  describe('onCameraPositionChangeEnd', () => {
    test('fires after setCenter with correct coordinates', async () => {
      const target = { lat: 59.9343, lon: 30.3351 };
      let lastEnd: CameraPosition['nativeEvent'] | null = null;

      const { mapRef } = await renderEventMap({
        onCameraPositionChangeEnd: (e) => {
          lastEnd = e.nativeEvent;
        },
      });

      await mapRef.current!.setCenter(target, 12, 0, 0, 0, 'LINEAR');

      await waitUntil(
        () => lastEnd !== null && Math.abs(lastEnd.point.lat - target.lat) < 1,
        { timeout: CAMERA_ANIMATION_TIMEOUT }
      );

      expect(lastEnd).not.toBeNull();
      expectNear(lastEnd!.point.lat, target.lat);
      expectNear(lastEnd!.point.lon, target.lon);
      expect(lastEnd!.reason).toBe('APPLICATION');
    });

    test('fires after setZoom with updated zoom value', async () => {
      const targetZoom = 14;
      let lastEnd: CameraPosition['nativeEvent'] | null = null;

      const { mapRef } = await renderEventMap({
        onCameraPositionChangeEnd: (e) => {
          lastEnd = e.nativeEvent;
        },
      });

      await mapRef.current!.setZoom(targetZoom, 0, 'LINEAR');

      await waitUntil(
        () => lastEnd !== null && Math.abs(lastEnd.zoom - targetZoom) < 1,
        { timeout: CAMERA_ANIMATION_TIMEOUT }
      );

      expect(lastEnd).not.toBeNull();
      expectNear(lastEnd!.zoom, targetZoom, 1);
    });
  });

  // ─── onCameraPositionChange ────────────────────────────────────────────────

  describe('onCameraPositionChange', () => {
    test('fires at least once during a setCenter animation', async () => {
      let changeCount = 0;

      const { mapRef } = await renderEventMap({
        onCameraPositionChange: () => {
          changeCount++;
        },
      });

      await mapRef.current!.setCenter(
        { lat: MOSCOW.lat + 2, lon: MOSCOW.lon + 2 },
        8,
        0,
        0,
        300,
        'SMOOTH'
      );

      await waitUntil(() => changeCount > 0, {
        timeout: CAMERA_ANIMATION_TIMEOUT,
      });

      expect(changeCount).toBeGreaterThan(0);
    });

    test('provides a valid nativeEvent shape', async () => {
      let receivedEvent: CameraPosition['nativeEvent'] | null = null;

      const { mapRef } = await renderEventMap({
        onCameraPositionChange: (e) => {
          if (!receivedEvent) {
            receivedEvent = e.nativeEvent;
          }
        },
      });

      await mapRef.current!.setZoom(11, 0, 'LINEAR');

      await waitUntil(() => receivedEvent !== null, {
        timeout: CAMERA_ANIMATION_TIMEOUT,
      });

      expect(typeof receivedEvent!.zoom).toBe('number');
      expect(typeof receivedEvent!.azimuth).toBe('number');
      expect(typeof receivedEvent!.tilt).toBe('number');
      expect(typeof receivedEvent!.point.lat).toBe('number');
      expect(typeof receivedEvent!.point.lon).toBe('number');
      expect(typeof receivedEvent!.finished).toBe('boolean');
    });
  });
});
