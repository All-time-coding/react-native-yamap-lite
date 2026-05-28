import { describe, test, expect } from 'react-native-harness';
import { Polyline } from 'react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays } from '../helpers';

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
});
