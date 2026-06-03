import { describe, test, expect } from 'react-native-harness';
import { Circle } from '@atc/react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays, renderUpdatingOverlays } from '../helpers';

describe('Circle overlay', () => {
  test('mounts on the map without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Circle
          center={MOSCOW}
          radius={5000}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={2}
          zIndex={1}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(Number.isFinite(pos.lon)).toBe(true);
  });

  // Regression guard: an unresolved color prop must not reach the native
  // YMK*MapObject as nil (would assert "Invalid parameter not satisfying").
  test('mounts without any color props without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Circle center={MOSCOW} radius={5000} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('accepts large radius and different colors', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Circle
          center={{ lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon + 0.05 }}
          radius={20000}
          fillColor="#00ff0080"
          strokeColor="#0000ff"
          strokeWidth={5}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with zIndex and handled props', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Circle
          center={MOSCOW}
          radius={3000}
          fillColor="#ff000033"
          strokeColor="#ff0000"
          strokeWidth={3}
          zIndex={100}
          handled
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts multiple circles simultaneously', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <>
          <Circle
            center={MOSCOW}
            radius={2000}
            fillColor="#ff000033"
            strokeColor="#ff0000"
            strokeWidth={2}
            zIndex={1}
          />
          <Circle
            center={{ lat: MOSCOW.lat + 0.03, lon: MOSCOW.lon + 0.03 }}
            radius={3000}
            fillColor="#0000ff33"
            strokeColor="#0000ff"
            strokeWidth={2}
            zIndex={2}
          />
          <Circle
            center={{ lat: MOSCOW.lat - 0.03, lon: MOSCOW.lon - 0.03 }}
            radius={1500}
            fillColor="#00ff0033"
            strokeColor="#00ff00"
            strokeWidth={2}
            zIndex={3}
          />
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
        <Circle
          center={MOSCOW}
          radius={5000}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={2}
          onPress={() => {
            pressCount++;
          }}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(pressCount).toBe(0);
  });

  // ─── prop updates after mount (updateGeometry / updateCircle path) ─────────

  test('updates center, radius and colors after mount without crashing', async () => {
    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: (
        <Circle
          center={MOSCOW}
          radius={5000}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={2}
          zIndex={1}
        />
      ),
      updated: (
        <Circle
          center={{ lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon + 0.05 }}
          radius={12000}
          fillColor="#00ff0080"
          strokeColor="#0000ff"
          strokeWidth={6}
          zIndex={4}
        />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── edge cases / robustness probes ───────────────────────────────────────
  // Degenerate geometry fed straight into the native YMKCircle constructor.

  test('mounts with zero radius without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Circle center={MOSCOW} radius={0} fillColor="#0000ff80" />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts at NaN center without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Circle
          center={{ lat: Number.NaN, lon: Number.NaN }}
          radius={5000}
          fillColor="#0000ff80"
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });
});
