import { describe, test, expect } from 'react-native-harness';
import { Polyline } from 'react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays, renderUpdatingOverlays } from '../helpers';

const BASE_POINTS = [
  { lat: MOSCOW.lat, lon: MOSCOW.lon },
  { lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon + 0.03 },
  { lat: MOSCOW.lat + 0.1, lon: MOSCOW.lon + 0.01 },
  { lat: MOSCOW.lat + 0.08, lon: MOSCOW.lon - 0.04 },
];

describe('Polyline overlay', () => {
  test('mounts on the map without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polyline
          points={BASE_POINTS}
          strokeColor="#00cc88"
          strokeWidth={4}
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
      children: <Polyline points={BASE_POINTS} strokeWidth={4} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with full style props (outline, dash)', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polyline
          points={BASE_POINTS}
          strokeColor="#ff4400"
          strokeWidth={6}
          outlineColor="#440000"
          outlineWidth={2}
          dashLength={12}
          gapLength={8}
          dashOffset={0}
          zIndex={5}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts multiple polylines simultaneously', async () => {
    const shifted = BASE_POINTS.map((p) => ({
      lat: p.lat + 0.03,
      lon: p.lon + 0.03,
    }));

    const { mapRef } = await renderMapWithOverlays({
      children: (
        <>
          <Polyline
            points={BASE_POINTS}
            strokeColor="#00cc88"
            strokeWidth={3}
            zIndex={1}
          />
          <Polyline
            points={shifted}
            strokeColor="#cc0088"
            strokeWidth={3}
            zIndex={2}
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
        <Polyline
          points={BASE_POINTS}
          strokeColor="#00cc88"
          strokeWidth={4}
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

  // ─── prop updates after mount (updateGeometry / updatePolyline path) ───────

  test('updates points and style after mount without crashing', async () => {
    const shifted = BASE_POINTS.map((p) => ({
      lat: p.lat + 0.04,
      lon: p.lon + 0.04,
    }));

    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: (
        <Polyline points={BASE_POINTS} strokeColor="#00cc88" strokeWidth={4} />
      ),
      updated: (
        <Polyline
          points={shifted}
          strokeColor="#cc0088"
          strokeWidth={8}
          outlineColor="#220022"
          outlineWidth={2}
          zIndex={3}
        />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // Regression guard: shrinking below 2 points must not crash
  // (Polyline.updateGeometry rebuilds only when points.count >= 2).
  test('shrinks to a single point after mount without crashing', async () => {
    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: (
        <Polyline points={BASE_POINTS} strokeColor="#00cc88" strokeWidth={4} />
      ),
      updated: (
        <Polyline
          points={[BASE_POINTS[0]!]}
          strokeColor="#00cc88"
          strokeWidth={4}
        />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  // ─── edge cases / robustness probes ───────────────────────────────────────
  // Degenerate input fed straight into the native YMKPolyline constructor.

  test('mounts with an empty points array without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Polyline points={[]} strokeColor="#00cc88" strokeWidth={4} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with a single point without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polyline
          points={[{ lat: MOSCOW.lat, lon: MOSCOW.lon }]}
          strokeColor="#00cc88"
          strokeWidth={4}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts at NaN coordinates without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polyline
          points={[
            { lat: Number.NaN, lon: Number.NaN },
            { lat: Number.NaN, lon: Number.NaN },
          ]}
          strokeColor="#00cc88"
          strokeWidth={4}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });
});
