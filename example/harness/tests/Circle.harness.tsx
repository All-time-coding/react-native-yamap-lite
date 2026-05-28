import { describe, test, expect } from 'react-native-harness';
import { Circle } from 'react-native-yamap-lite';
import { MOSCOW } from '../constants';
import { renderMapWithOverlays } from '../helpers';

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
});
