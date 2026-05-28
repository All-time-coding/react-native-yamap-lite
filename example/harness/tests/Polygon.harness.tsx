import { describe, test, expect } from 'react-native-harness';
import { Polygon } from 'react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays } from '../helpers';

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
  });
});
