import { describe, test, expect, render } from 'react-native-harness';
import {
  Marker,
  YaMap,
  type MarkerRef,
  type YaMapRef,
} from '@atc/react-native-yamap-lite';
import { StyleSheet, View } from 'react-native';
import { INITIAL_REGION, MOSCOW } from '../constants';
import { ensureMapKitInitialized } from '../ensureMapKitInit';
import {
  renderMapWithOverlays,
  renderUpdatingOverlays,
  waitForMapReady,
} from '../helpers';

const ICON_URI = 'https://cdn-icons-png.flaticon.com/512/64/64113.png';
// Local bundled asset — exercises the synchronous file:// decode branch of
// ResolveImageHelper (the remote-URI tests never touch it).
const LOCAL_ICON = require('../../src/assets/user-pin.png');

describe('Marker', () => {
  test('mounts on the map without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Marker point={MOSCOW} source={{ uri: ICON_URI }} size={24} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(Number.isFinite(pos.lon)).toBe(true);
  });

  test('mounts with anchor, scale and zIndex props', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Marker
          point={{ lat: MOSCOW.lat + 0.01, lon: MOSCOW.lon + 0.01 }}
          source={{ uri: ICON_URI }}
          size={32}
          scale={1.5}
          anchor={{ x: 0.5, y: 1.0 }}
          zIndex={10}
          rotated
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with visible=false without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Marker
          point={MOSCOW}
          source={{ uri: ICON_URI }}
          size={24}
          visible={false}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts multiple markers simultaneously', async () => {
    const offsets = [0, 0.01, -0.01, 0.02, -0.02];
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <>
          {offsets.map((d, i) => (
            <Marker
              key={i}
              point={{ lat: MOSCOW.lat + d, lon: MOSCOW.lon + d }}
              source={{ uri: ICON_URI }}
              size={20}
            />
          ))}
        </>
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('registers onPress handler without crashing', async () => {
    let pressCount = 0;
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Marker
          point={MOSCOW}
          source={{ uri: ICON_URI }}
          size={24}
          onPress={() => {
            pressCount++;
          }}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    // pressCount stays 0 — we are not simulating touch, just ensuring handler doesn't crash on mount
    expect(pressCount).toBe(0);
  });

  // ─── local (bundled) icon ─────────────────────────────────────────────────

  test('mounts with a local require() asset without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Marker point={MOSCOW} source={LOCAL_ICON} size={28} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── prop updates after mount (updateMarker path) ─────────────────────────

  test('updates point, source and size after mount without crashing', async () => {
    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: <Marker point={MOSCOW} source={{ uri: ICON_URI }} size={24} />,
      updated: (
        <Marker
          point={{ lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon + 0.05 }}
          source={LOCAL_ICON}
          size={40}
          scale={1.5}
          zIndex={10}
        />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── backward-compat ref API ──────────────────────────────────────────────

  test('animatedMoveTo immediately repositions marker without crashing', async () => {
    await ensureMapKitInitialized();

    const mapRef = { current: null as YaMapRef | null };
    const markerRef = { current: null as MarkerRef | null };
    let mapLoaded = false;

    const styles = StyleSheet.create({
      container: { width: 400, height: 400 },
      map: { flex: 1 },
    });

    function Host() {
      return (
        <View style={styles.container}>
          <YaMap
            ref={(r) => {
              (mapRef as any).current = r;
            }}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            onMapLoaded={() => {
              mapLoaded = true;
            }}
          >
            <Marker
              ref={markerRef}
              point={MOSCOW}
              source={{ uri: ICON_URI }}
              size={24}
            />
          </YaMap>
        </View>
      );
    }

    await render(<Host />);
    await waitForMapReady(mapRef, () => mapLoaded);

    // Move to Saint Petersburg — should not throw
    const spb = { lat: 59.9343, lon: 30.3351 };
    expect(() => {
      markerRef.current!.animatedMoveTo(spb, 300);
    }).not.toThrow();

    // Map stays alive after the move
    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('animatedRotateTo is a no-op that does not crash', async () => {
    await ensureMapKitInitialized();

    const mapRef = { current: null as YaMapRef | null };
    const markerRef = { current: null as MarkerRef | null };
    let mapLoaded = false;

    const styles = StyleSheet.create({
      container: { width: 400, height: 400 },
      map: { flex: 1 },
    });

    function Host() {
      return (
        <View style={styles.container}>
          <YaMap
            ref={(r) => {
              (mapRef as any).current = r;
            }}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            onMapLoaded={() => {
              mapLoaded = true;
            }}
          >
            <Marker
              ref={markerRef}
              point={MOSCOW}
              source={{ uri: ICON_URI }}
              size={24}
            />
          </YaMap>
        </View>
      );
    }

    await render(<Host />);
    await waitForMapReady(mapRef, () => mapLoaded);

    expect(() => markerRef.current!.animatedRotateTo(90, 300)).not.toThrow();
    expect(() => markerRef.current!.animatedRotateTo(0, 0)).not.toThrow();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── edge cases / robustness probes ───────────────────────────────────────

  test('mounts at NaN coordinates without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Marker
          point={{ lat: Number.NaN, lon: Number.NaN }}
          source={{ uri: ICON_URI }}
          size={24}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with an empty source uri without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Marker point={MOSCOW} source={{ uri: '' }} size={24} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });
});
