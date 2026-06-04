import {
  describe,
  test,
  expect,
  waitUntil,
  render,
} from 'react-native-harness';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { YaMap, type YaMapRef } from '@exterio/react-native-yamap-lite';
import { CAMERA_ANIMATION_TIMEOUT, INITIAL_REGION, MOSCOW } from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import { expectNear, renderMap, waitForMapReady } from '../helpers';

// Minimal valid Yandex MapKit style — empty ruleset, overrides nothing
const EMPTY_MAP_STYLE = '[]';
// Local bundled asset used as a custom user-location icon.
const LOCAL_ICON = require('../../src/assets/user-pin.png');

describe('YaMap', () => {
  // ─── mount & ref API ──────────────────────────────────────────────────────

  test('mounts and becomes interactive', async () => {
    const { mapRef } = await renderMap();

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
    expect(Number.isFinite(position.lon)).toBe(true);
    expect(Number.isFinite(position.zoom)).toBe(true);
    expect(Number.isFinite(position.azimuth)).toBe(true);
    expect(Number.isFinite(position.tilt)).toBe(true);
  });

  test('reports initial camera position matching initialRegion', async () => {
    const { mapRef } = await renderMap({
      initialRegion: INITIAL_REGION,
    });

    const position = await mapRef.current!.getCameraPosition();

    expectNear(position.lat, MOSCOW.lat);
    expectNear(position.lon, MOSCOW.lon);
    expectNear(position.zoom, INITIAL_REGION.zoom ?? 10, 2);
  });

  test('setZoom changes the camera zoom level', async () => {
    const { mapRef } = await renderMap();
    const targetZoom = 14;

    await mapRef.current!.setZoom(targetZoom, 0, 'LINEAR');

    await waitUntil(
      async () => {
        const position = await mapRef.current!.getCameraPosition();
        return Math.abs(position.zoom - targetZoom) < 1;
      },
      { timeout: CAMERA_ANIMATION_TIMEOUT }
    );

    const position = await mapRef.current!.getCameraPosition();
    expectNear(position.zoom, targetZoom, 1);
  });

  test('setZoom with SMOOTH animation completes without error', async () => {
    const { mapRef } = await renderMap();
    await expect(
      mapRef.current!.setZoom(12, 300, 'SMOOTH')
    ).resolves.toBeUndefined();
  });

  test('setCenter moves the camera to the requested coordinates', async () => {
    const { mapRef } = await renderMap();
    const target = { lat: 59.9343, lon: 30.3351 };

    await mapRef.current!.setCenter(target, 12, 0, 0, 0, 'LINEAR');

    await waitUntil(
      async () => {
        const position = await mapRef.current!.getCameraPosition();
        return (
          Math.abs(position.lat - target.lat) < 1 &&
          Math.abs(position.lon - target.lon) < 1
        );
      },
      { timeout: CAMERA_ANIMATION_TIMEOUT }
    );

    const position = await mapRef.current!.getCameraPosition();
    expectNear(position.lat, target.lat);
    expectNear(position.lon, target.lon);
    expectNear(position.zoom, 12, 1);
  });

  test('fitAllMarkers completes without error', async () => {
    const { mapRef } = await renderMap();
    await expect(mapRef.current!.fitAllMarkers()).resolves.toBeUndefined();
  });

  // ─── display modes ────────────────────────────────────────────────────────

  test('renders in night mode without crashing', async () => {
    const { mapRef } = await renderMap({ nightMode: true });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  test('renders in satellite mapType without crashing', async () => {
    const { mapRef } = await renderMap({ mapType: 'satellite' });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  test('renders in hybrid mapType without crashing', async () => {
    const { mapRef } = await renderMap({ mapType: 'hybrid' });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  // ─── showUserPosition ─────────────────────────────────────────────────────

  test('renders with showUserPosition=true without crashing', async () => {
    const { mapRef } = await renderMap({ showUserPosition: true });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  test('renders with a custom userLocationIcon and showUserPosition', async () => {
    // Exercises the setUserLocationIconWithPath path on the plain map
    // (regression: the plain map's updateProps used to drop it).
    const { mapRef } = await renderMap({
      showUserPosition: true,
      userLocationIcon: LOCAL_ICON,
      userLocationIconScale: 1.5,
    });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  test('toggles showUserPosition from false to true without crashing', async () => {
    // Regression guard: showUserPosition must apply on update, not only at
    // mount (plain map's updateProps only set the stored flag before).
    await ensureMapKitInitialized();

    const mapRef = { current: null as YaMapRef | null };
    let mapLoaded = false;
    let toggled = false;

    const styles = StyleSheet.create({
      container: { width: 400, height: 400 },
      map: { flex: 1 },
    });

    function ToggleHost() {
      const [show, setShow] = useState(false);
      useEffect(() => {
        const timer = setTimeout(() => {
          setShow(true);
          toggled = true;
        }, 800);
        return () => clearTimeout(timer);
      }, []);
      return (
        <View style={styles.container}>
          <YaMap
            ref={mapRef}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showUserPosition={show}
            userLocationIcon={LOCAL_ICON}
            onMapLoaded={() => {
              mapLoaded = true;
            }}
          />
        </View>
      );
    }

    await render(<ToggleHost />);
    await waitForMapReady(mapRef, () => mapLoaded);
    await waitUntil(() => toggled, { timeout: 5000 });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  // ─── mapStyle ─────────────────────────────────────────────────────────────

  test('renders with a custom mapStyle string without crashing', async () => {
    const { mapRef } = await renderMap({ mapStyle: EMPTY_MAP_STYLE });

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  // ─── setCenter with azimuth and tilt ──────────────────────────────────────

  test('setCenter applies azimuth and tilt to the camera', async () => {
    const { mapRef } = await renderMap();
    const target = { lat: MOSCOW.lat, lon: MOSCOW.lon };
    const targetAzimuth = 45;
    const targetTilt = 30;

    await mapRef.current!.setCenter(
      target,
      15,
      targetAzimuth,
      targetTilt,
      0,
      'LINEAR'
    );

    await waitUntil(
      async () => {
        const pos = await mapRef.current!.getCameraPosition();
        return Math.abs(pos.lat - target.lat) < 1;
      },
      { timeout: CAMERA_ANIMATION_TIMEOUT }
    );

    const position = await mapRef.current!.getCameraPosition();
    expectNear(position.lat, target.lat);
    expectNear(position.lon, target.lon);
    expectNear(position.azimuth, targetAzimuth, 5);
    expectNear(position.tilt, targetTilt, 5);
  });

  // ─── gesture flags ────────────────────────────────────────────────────────

  test('map is still interactive when all gesture props are disabled', async () => {
    const { mapRef } = await renderMap({
      scrollGesturesEnabled: false,
      zoomGesturesEnabled: false,
      tiltGesturesEnabled: false,
      rotateGesturesEnabled: false,
      fastTapEnabled: false,
    });

    // Imperative API still works even when gesture input is disabled
    await expect(
      mapRef.current!.setZoom(11, 0, 'LINEAR')
    ).resolves.toBeUndefined();

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  // ─── backward-compat API ──────────────────────────────────────────────────

  test('getVisibleRegion returns region with four corners', async () => {
    const { mapRef } = await renderMap();

    const region = await mapRef.current!.getVisibleRegion();

    expect(typeof region.bottomLeft.lat).toBe('number');
    expect(typeof region.bottomLeft.lon).toBe('number');
    expect(typeof region.topRight.lat).toBe('number');
    expect(typeof region.topRight.lon).toBe('number');
    // Sanity: region spans non-zero area
    expect(region.topRight.lat).toBeGreaterThan(region.bottomLeft.lat);
  });

  test('getScreenPoints returns screen coordinates for a world point', async () => {
    const { mapRef } = await renderMap({ initialRegion: INITIAL_REGION });

    const screenPts = await mapRef.current!.getScreenPoints([MOSCOW]);

    expect(screenPts.length).toBe(1);
    expect(typeof screenPts[0]!.x).toBe('number');
    expect(typeof screenPts[0]!.y).toBe('number');
    // Visible map is 400×400, center point should be near the middle
    expect(screenPts[0]!.x).toBeGreaterThan(0);
    expect(screenPts[0]!.y).toBeGreaterThan(0);
  });

  test('getWorldPoints converts a screen point back to world coordinates', async () => {
    const { mapRef } = await renderMap({ initialRegion: INITIAL_REGION });

    // Project Moscow to screen then back
    const screenPts = await mapRef.current!.getScreenPoints([MOSCOW]);
    const worldPts = await mapRef.current!.getWorldPoints(screenPts);

    expect(worldPts.length).toBe(1);
    expect(typeof worldPts[0]!.lat).toBe('number');
    expect(typeof worldPts[0]!.lon).toBe('number');
  });

  test('fitMarkers resolves without error (alias for fitAllMarkers)', async () => {
    const { mapRef } = await renderMap();
    await expect(mapRef.current!.fitMarkers([])).resolves.toBeUndefined();
  });

  test('setTrafficVisible does not throw (no-op in lite SDK)', async () => {
    const { mapRef } = await renderMap();
    expect(() => mapRef.current!.setTrafficVisible(true)).not.toThrow();
    expect(() => mapRef.current!.setTrafficVisible(false)).not.toThrow();
  });

  test('interactive=false still allows imperative camera control', async () => {
    const { mapRef } = await renderMap({ interactive: false });

    await expect(
      mapRef.current!.setZoom(12, 0, 'LINEAR')
    ).resolves.toBeUndefined();

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });

  test('onCameraPositionReceived callback fires after getCameraPosition', async () => {
    let received: any = null;
    const { mapRef } = await renderMap({
      onCameraPositionReceived: (e) => {
        received = e.nativeEvent;
      },
    });

    await mapRef.current!.getCameraPosition();

    expect(received).not.toBeNull();
    expect(typeof received.lat).toBe('number');
    expect(typeof received.zoom).toBe('number');
  });

  test('onVisibleRegionReceived callback fires after getVisibleRegion', async () => {
    let received: any = null;
    const { mapRef } = await renderMap({
      onVisibleRegionReceived: (e) => {
        received = e.nativeEvent;
      },
    });

    await mapRef.current!.getVisibleRegion();

    expect(received).not.toBeNull();
    expect(received).toHaveProperty('bottomLeft');
    expect(received).toHaveProperty('topRight');
  });

  // ─── edge cases / robustness probes ───────────────────────────────────────
  // Imperative API fed out-of-range / invalid input — must not crash native.

  test('setZoom with out-of-range zoom does not crash', async () => {
    const { mapRef } = await renderMap();

    await expect(
      mapRef.current!.setZoom(100, 0, 'LINEAR')
    ).resolves.toBeUndefined();
    await expect(
      mapRef.current!.setZoom(-5, 0, 'LINEAR')
    ).resolves.toBeUndefined();

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.zoom)).toBe(true);
  });

  test('setCenter with NaN coordinates does not crash', async () => {
    const { mapRef } = await renderMap();

    await expect(
      mapRef.current!.setCenter(
        { lat: Number.NaN, lon: Number.NaN },
        12,
        0,
        0,
        0,
        'LINEAR'
      )
    ).resolves.toBeUndefined();

    const position = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(position.lat)).toBe(true);
  });
});
