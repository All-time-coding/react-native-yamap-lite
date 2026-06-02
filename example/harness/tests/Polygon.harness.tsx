import { describe, test, expect } from 'react-native-harness';
import { Polygon } from 'react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays, renderUpdatingOverlays } from '../helpers';

const BASE_POINTS = [
  { lat: MOSCOW.lat + 0.1, lon: MOSCOW.lon + 0.1 },
  { lat: MOSCOW.lat + 0.2, lon: MOSCOW.lon + 0.05 },
  { lat: MOSCOW.lat + 0.15, lon: MOSCOW.lon - 0.05 },
  { lat: MOSCOW.lat + 0.05, lon: MOSCOW.lon },
];

const INNER_RING = [
  { lat: MOSCOW.lat + 0.12, lon: MOSCOW.lon + 0.08 },
  { lat: MOSCOW.lat + 0.16, lon: MOSCOW.lon + 0.06 },
  { lat: MOSCOW.lat + 0.14, lon: MOSCOW.lon + 0.02 },
];

describe('Polygon overlay', () => {
  test('mounts on the map without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={3}
          zIndex={2}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(Number.isFinite(pos.lon)).toBe(true);
    // The polygon must actually reach the native map, not just mount in JS.
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  // Regression guard: an unresolved color prop must not reach the native
  // YMK*MapObject as nil (would assert "Invalid parameter not satisfying").
  test('mounts without any color props without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Polygon points={BASE_POINTS} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  test('mounts with inner rings (hole polygon)', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          innerRings={[INNER_RING]}
          fillColor="#00ff0080"
          strokeColor="#0000ff"
          strokeWidth={2}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  test('mounts with multiple inner rings', async () => {
    const secondHole = [
      { lat: MOSCOW.lat + 0.13, lon: MOSCOW.lon + 0.01 },
      { lat: MOSCOW.lat + 0.17, lon: MOSCOW.lon + 0.02 },
      { lat: MOSCOW.lat + 0.15, lon: MOSCOW.lon + 0.05 },
    ];

    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          innerRings={[INNER_RING, secondHole]}
          fillColor="#ff880033"
          strokeColor="#ff4400"
          strokeWidth={2}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  test('mounts with zIndex and handled props', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          fillColor="#ff000033"
          strokeColor="#ff0000"
          strokeWidth={4}
          zIndex={50}
          handled
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  test('mounts multiple polygons simultaneously', async () => {
    const secondPolygon = BASE_POINTS.map((p) => ({
      lat: p.lat + 0.05,
      lon: p.lon - 0.15,
    }));

    const { mapRef } = await renderMapWithOverlays({
      children: (
        <>
          <Polygon
            points={BASE_POINTS}
            fillColor="#0000ff33"
            strokeColor="#0000ff"
            strokeWidth={2}
            zIndex={1}
          />
          <Polygon
            points={secondPolygon}
            fillColor="#ff000033"
            strokeColor="#ff0000"
            strokeWidth={2}
            zIndex={2}
          />
        </>
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    // Both polygons must reach the map.
    expect(await mapRef.current!.getMapObjectCount()).toBe(2);
  });

  test('registers onPress handler without crashing', async () => {
    let pressCount = 0;
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={3}
          onPress={() => {
            pressCount++;
          }}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(pressCount).toBe(0);
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  // ─── prop updates after mount (updateGeometry / updatePolygon path) ────────

  test('updates points and style after mount without crashing', async () => {
    const shifted = BASE_POINTS.map((p) => ({
      lat: p.lat + 0.05,
      lon: p.lon + 0.05,
    }));

    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: (
        <Polygon
          points={BASE_POINTS}
          fillColor="#0000ff80"
          strokeColor="#ff0000"
          strokeWidth={3}
          zIndex={1}
        />
      ),
      updated: (
        <Polygon
          points={shifted}
          fillColor="#00ff0080"
          strokeColor="#0000ff"
          strokeWidth={6}
          zIndex={5}
        />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    // The polygon survives the prop swap and stays attached to the map.
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  // Regression guard: shrinking down to the minimum ring size must not crash
  // (Polygon.updateGeometry rebuilds only when points.count >= 3).
  test('shrinks to a 3-point ring after mount without crashing', async () => {
    const triangle = BASE_POINTS.slice(0, 3);

    const { mapRef, waitForUpdate } = await renderUpdatingOverlays({
      initial: (
        <Polygon points={BASE_POINTS} fillColor="#0000ff80" strokeWidth={3} />
      ),
      updated: (
        <Polygon points={triangle} fillColor="#0000ff80" strokeWidth={3} />
      ),
    });

    await waitForUpdate();

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
    // A 3-point ring is still a valid polygon — it must remain on the map.
    expect(await mapRef.current!.getMapObjectCount()).toBe(1);
  });

  // ─── edge cases / robustness probes ───────────────────────────────────────
  // These feed degenerate input straight into the native YMK constructors.
  // If any crashes, the native layer needs a guard (cf. the nil-color fix).
  // Object count is intentionally NOT asserted here: whether degenerate
  // geometry produces a map object is platform-dependent, so these stay
  // crash-only smoke tests.

  test('mounts with an empty points array without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: <Polygon points={[]} fillColor="#0000ff80" strokeWidth={2} />,
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts with a degenerate (2-point) inner ring without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={BASE_POINTS}
          innerRings={[
            [
              { lat: MOSCOW.lat + 0.12, lon: MOSCOW.lon + 0.08 },
              { lat: MOSCOW.lat + 0.14, lon: MOSCOW.lon + 0.04 },
            ],
          ]}
          fillColor="#0000ff80"
          strokeWidth={2}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });

  test('mounts at NaN coordinates without crashing', async () => {
    const { mapRef } = await renderMapWithOverlays({
      children: (
        <Polygon
          points={[
            { lat: Number.NaN, lon: Number.NaN },
            { lat: Number.NaN, lon: Number.NaN },
            { lat: Number.NaN, lon: Number.NaN },
            { lat: Number.NaN, lon: Number.NaN },
          ]}
          fillColor="#0000ff80"
          strokeWidth={2}
        />
      ),
    });

    const pos = await mapRef.current!.getCameraPosition();
    expect(Number.isFinite(pos.lat)).toBe(true);
  });
});
