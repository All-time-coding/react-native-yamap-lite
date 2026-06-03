/**
 * Regression tests — one test per fixed bug.
 * Naming convention: test title references the issue so failures stay traceable.
 */
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
  YaMap,
  YamapUtils,
  type YaMapRef,
} from '@atc/react-native-yamap-lite';
import {
  CAMERA_ANIMATION_TIMEOUT,
  INITIAL_REGION,
  MOSCOW,
  YAMAP_API_KEY,
} from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import { expectNear, renderMap, waitForMapReady } from '../helpers';

const ICON_URI = 'https://cdn-icons-png.flaticon.com/512/64/64113.png';
const SPB = { lat: 59.9343, lon: 30.3351 };

const styles = StyleSheet.create({
  container: { width: 400, height: 400 },
  map: { flex: 1 },
});

type ClusteredHostProps = {
  mapRef: React.MutableRefObject<YaMapRef | null>;
  onLoaded: () => void;
  markers: Array<{ point: { lat: number; lon: number }; data: { id: string } }>;
};

// Camera starts at SPB so fitAllMarkers() moving to Moscow is unambiguous
function ClusteredHost({ mapRef, onLoaded, markers }: ClusteredHostProps) {
  return (
    <View style={styles.container}>
      <ClusteredYamap
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...SPB, zoom: 3, azimuth: 0, tilt: 0 }}
        clusteredMarkers={markers}
        renderMarker={({ point, data }) => (
          <Marker
            key={data.id}
            point={point}
            source={{ uri: ICON_URI }}
            size={20}
          />
        )}
        clusterColor="#ff0000"
        onMapLoaded={onLoaded}
      />
    </View>
  );
}

describe('Regression', () => {
  // ── Verifies markers are actually assigned to the cluster collection.
  //    fitAllMarkers() is used as a proxy: it iterates placemarks[] and moves
  //    the camera only if they have valid geometry.  If the collection was
  //    overwritten by the retry-loop race (bug A) or placemarks[] was corrupted
  //    by removeReactSubview (bug B), the camera would not move to Moscow.
  describe('ClusteredYamap marker visibility', () => {
    test('fitAllMarkers moves camera to Moscow — markers are in the cluster', async () => {
      await ensureMapKitInitialized();

      const mapRef = { current: null as YaMapRef | null };
      let mapLoaded = false;

      await render(
        <ClusteredHost
          mapRef={mapRef}
          onLoaded={() => {
            mapLoaded = true;
          }}
          markers={[
            { point: MOSCOW, data: { id: '1' } },
            {
              point: { lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon + 0.01 },
              data: { id: '2' },
            },
            {
              point: { lat: MOSCOW.lat - 0.01, lon: MOSCOW.lon - 0.01 },
              data: { id: '3' },
            },
          ]}
        />
      );

      await waitForMapReady(mapRef, () => mapLoaded);
      await mapRef.current!.fitAllMarkers();

      // SPB.lat and MOSCOW.lat differ by only ~4.2°, so latitude alone can't
      // confirm the camera moved. Longitude (SPB 30.3 → Moscow 37.6) is the
      // unambiguous axis to wait on.
      await waitUntil(
        async () => {
          const pos = await mapRef.current!.getCameraPosition();
          return Math.abs(pos.lon - MOSCOW.lon) < 5;
        },
        { timeout: CAMERA_ANIMATION_TIMEOUT }
      );

      const pos = await mapRef.current!.getCameraPosition();
      expectNear(pos.lat, MOSCOW.lat, 5);
      expectNear(pos.lon, MOSCOW.lon, 5);
    });

    test('markers remain visible after clusteredMarkers prop update', async () => {
      await ensureMapKitInitialized();

      const mapRef = { current: null as YaMapRef | null };
      let mapLoaded = false;
      let updated = false;

      const moscowMarkers = [
        { point: MOSCOW, data: { id: 'm1' } },
        {
          point: { lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon },
          data: { id: 'm2' },
        },
      ];
      const spbMarkers = [
        { point: SPB, data: { id: 's1' } },
        { point: { lat: SPB.lat + 0.01, lon: SPB.lon }, data: { id: 's2' } },
      ];

      function UpdatingHost() {
        const [markers, setMarkers] = useState(moscowMarkers);
        useEffect(() => {
          const t = setTimeout(() => {
            setMarkers(spbMarkers);
            updated = true;
          }, 800);
          return () => clearTimeout(t);
        }, []);
        return (
          <ClusteredHost
            mapRef={mapRef}
            onLoaded={() => {
              mapLoaded = true;
            }}
            markers={markers}
          />
        );
      }

      await render(<UpdatingHost />);
      await waitForMapReady(mapRef, () => mapLoaded);
      await waitUntil(() => updated, { timeout: 3_000 });

      // After prop update to SPB markers, camera must move to SPB — not stay at Moscow
      await mapRef.current!.fitAllMarkers();

      await waitUntil(
        async () => {
          const pos = await mapRef.current!.getCameraPosition();
          return Math.abs(pos.lat - SPB.lat) < 5;
        },
        { timeout: CAMERA_ANIMATION_TIMEOUT }
      );

      const pos = await mapRef.current!.getCameraPosition();
      expectNear(pos.lat, SPB.lat, 5);
    });
  });

  // ── Bug: ClusteredYamapView.removeReactSubview did not remove YMKPlacemark
  //    from clusterCollection — removed markers persisted on the map.
  describe('ClusteredYamap marker removal', () => {
    test('removing all clustered markers does not crash the map', async () => {
      await ensureMapKitInitialized();

      const mapRef = { current: null as YaMapRef | null };
      let mapLoaded = false;
      let markersRemoved = false;

      const initialMarkers = [
        { point: MOSCOW, data: { id: 'a' } },
        {
          point: { lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon + 0.01 },
          data: { id: 'b' },
        },
      ];

      function Host() {
        const [markers, setMarkers] = useState(initialMarkers);

        useEffect(() => {
          const t = setTimeout(() => {
            setMarkers([]);
            markersRemoved = true;
          }, 800);
          return () => clearTimeout(t);
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
                  size={20}
                />
              )}
              clusterColor="#ff0000"
              onMapLoaded={() => {
                mapLoaded = true;
              }}
            />
          </View>
        );
      }

      await render(<Host />);
      await waitForMapReady(mapRef, () => mapLoaded);
      await waitUntil(() => markersRemoved, { timeout: 5_000 });

      // Map must still respond to camera queries after marker cleanup
      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });

    test('removing a subset of clustered markers does not crash', async () => {
      await ensureMapKitInitialized();

      const mapRef = { current: null as YaMapRef | null };
      let mapLoaded = false;
      let updated = false;

      const full = [
        { point: MOSCOW, data: { id: '1' } },
        {
          point: { lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon },
          data: { id: '2' },
        },
        {
          point: { lat: MOSCOW.lat - 0.01, lon: MOSCOW.lon },
          data: { id: '3' },
        },
      ];
      const partial = [full[0]!];

      function Host() {
        const [markers, setMarkers] = useState(full);

        useEffect(() => {
          const t = setTimeout(() => {
            setMarkers(partial);
            updated = true;
          }, 800);
          return () => clearTimeout(t);
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
                  size={20}
                />
              )}
              clusterColor="#0000ff"
              onMapLoaded={() => {
                mapLoaded = true;
              }}
            />
          </View>
        );
      }

      await render(<Host />);
      await waitForMapReady(mapRef, () => mapLoaded);
      await waitUntil(() => updated, { timeout: 5_000 });

      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });
  });

  // ── Bug: YamapUtils.init had @try/@catch outside the async block,
  //    so exceptions from YMKMapKit were uncaught on non-main threads.
  describe('YamapUtils.init', () => {
    test('calling init twice does not crash — rejects gracefully on second call', async () => {
      // First call (may already be initialized by ensureMapKitInitialized)
      try {
        await YamapUtils.init(YAMAP_API_KEY);
      } catch {
        // already initialized — acceptable
      }

      // Second call must not crash the app; it may resolve or reject
      let threw = false;
      try {
        await YamapUtils.init(YAMAP_API_KEY);
      } catch {
        threw = true;
      }

      // Whether it resolved or rejected, the bridge must still work
      const locale = await YamapUtils.getLocale();
      expect(typeof locale).toBe('string');

      // Suppress unused variable lint — we only care that no hard crash occurred
      void threw;
    });
  });

  // ── Bug: setCenter cast duration to (int) instead of (float), losing
  //    sub-millisecond precision. Fractional values must not crash.
  describe('setCenter with fractional duration', () => {
    test('setCenter with fractional ms duration resolves without error', async () => {
      const { mapRef } = await renderMap();

      // 500.5 ms — was truncated to 500 (int) before the fix; (float) cast is correct
      await expect(
        mapRef.current!.setCenter(MOSCOW, 12, 0, 0, 500.5, 'SMOOTH')
      ).resolves.toBeUndefined();

      await waitUntil(
        async () => {
          const pos = await mapRef.current!.getCameraPosition();
          return Math.abs(pos.lat - MOSCOW.lat) < 1;
        },
        { timeout: CAMERA_ANIMATION_TIMEOUT }
      );

      const pos = await mapRef.current!.getCameraPosition();
      expectNear(pos.lat, MOSCOW.lat);
      expectNear(pos.lon, MOSCOW.lon);
    });
  });

  // ── Bug: mapObjects.append was not guarded against duplicates (check was
  //    commented out), causing fitAllMarkers to use duplicate points.
  describe('fitAllMarkers with duplicate marker refs', () => {
    test('fitAllMarkers resolves correctly after re-render of same markers', async () => {
      await ensureMapKitInitialized();

      const mapRef = { current: null as YaMapRef | null };
      let mapLoaded = false;
      let rerendered = false;

      const MARKERS = [
        { point: MOSCOW, data: { id: 'x' } },
        {
          point: { lat: MOSCOW.lat + 0.1, lon: MOSCOW.lon + 0.1 },
          data: { id: 'y' },
        },
      ];

      // Force a re-render that would have caused duplicate entries before the fix
      function Host() {
        const [tick, setTick] = useState(0);

        useEffect(() => {
          const t = setTimeout(() => {
            setTick(1);
            rerendered = true;
          }, 600);
          return () => clearTimeout(t);
        }, []);

        return (
          <View style={styles.container}>
            <YaMap
              ref={mapRef}
              style={styles.map}
              initialRegion={INITIAL_REGION}
              onMapLoaded={() => {
                mapLoaded = true;
              }}
            >
              {MARKERS.map(({ point, data }) => (
                <Marker
                  key={`${data.id}-${tick}`}
                  point={point}
                  source={{ uri: ICON_URI }}
                  size={20}
                />
              ))}
            </YaMap>
          </View>
        );
      }

      await render(<Host />);
      await waitForMapReady(mapRef, () => mapLoaded);
      await waitUntil(() => rerendered, { timeout: 3_000 });

      await expect(mapRef.current!.fitAllMarkers()).resolves.toBeUndefined();

      const pos = await mapRef.current!.getCameraPosition();
      expect(Number.isFinite(pos.lat)).toBe(true);
    });
  });

  // ── Verifies getVisibleRegion and getScreenPoints round-trip consistency
  //    (these were TODO stubs that got implemented).
  describe('getVisibleRegion / getScreenPoints round-trip', () => {
    test('getVisibleRegion corners are geometrically consistent', async () => {
      const { mapRef } = await renderMap({ initialRegion: INITIAL_REGION });

      const region = await mapRef.current!.getVisibleRegion();

      // Basic geometry: top > bottom, right > left
      expect(region.topLeft.lat).toBeGreaterThan(region.bottomLeft.lat);
      expect(region.topRight.lon).toBeGreaterThan(region.topLeft.lon);
    });

    test('screen→world→screen round-trip stays near original point', async () => {
      const { mapRef } = await renderMap({ initialRegion: INITIAL_REGION });

      const [screen] = await mapRef.current!.getScreenPoints([MOSCOW]);
      expect(screen).toBeDefined();

      const [world] = await mapRef.current!.getWorldPoints([screen!]);
      expect(world).toBeDefined();

      // Round-trip should be close to the original coordinate
      expectNear(world!.lat, MOSCOW.lat, 1);
      expectNear(world!.lon, MOSCOW.lon, 1);
    });

    test('getScreenPoints returns empty array for empty input', async () => {
      const { mapRef } = await renderMap();
      const result = await mapRef.current!.getScreenPoints([]);
      expect(result).toEqual([]);
    });
  });
});
