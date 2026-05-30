import React from 'react';
import { StyleSheet, View } from 'react-native';
import { expect, render, waitUntil } from 'react-native-harness';
import {
  ClusteredYamap,
  YaMap,
  type InitialRegion,
  type YaMapProps,
  type YaMapRef,
} from 'react-native-yamap-lite';
import { INITIAL_REGION, MAP_LOAD_TIMEOUT } from './constants';
import { ensureMapKitInitialized } from './ensureMapKitInit';

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 400,
  },
  map: {
    flex: 1,
  },
});

type RenderMapOptions = Partial<YaMapProps> & {
  initialRegion?: InitialRegion;
  children?: React.ReactNode;
};

type MapHostProps = RenderMapOptions & {
  mapRef: React.MutableRefObject<YaMapRef | null>;
  onLoaded: () => void;
};

function MapHost({
  mapRef,
  onLoaded,
  initialRegion,
  onMapLoaded,
  ...rest
}: MapHostProps) {
  return (
    <View style={styles.container}>
      <YaMap
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion ?? INITIAL_REGION}
        onMapLoaded={(event) => {
          onLoaded();
          onMapLoaded?.(event);
        }}
        {...rest}
      />
    </View>
  );
}

type OverlayMapHostProps = RenderMapOptions & {
  mapRef: React.MutableRefObject<YaMapRef | null>;
  onLoaded: () => void;
};

function OverlayMapHost({
  mapRef,
  onLoaded,
  initialRegion,
  onMapLoaded,
  children,
  ...rest
}: OverlayMapHostProps) {
  return (
    <View style={styles.container}>
      <ClusteredYamap
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion ?? INITIAL_REGION}
        clusteredMarkers={[]}
        renderMarker={() => <View />}
        onMapLoaded={(event) => {
          onLoaded();
          onMapLoaded?.(event);
        }}
        {...rest}
      >
        {children}
      </ClusteredYamap>
    </View>
  );
}

export async function waitForMapReady(
  mapRef: React.MutableRefObject<YaMapRef | null>,
  isLoaded: () => boolean
): Promise<void> {
  await waitUntil(() => mapRef.current != null, { timeout: MAP_LOAD_TIMEOUT });

  if (isLoaded()) {
    return;
  }

  await waitUntil(
    async () => {
      if (!mapRef.current) {
        return false;
      }

      try {
        const position = await mapRef.current.getCameraPosition();
        return Number.isFinite(position.lat) && Number.isFinite(position.lon);
      } catch {
        return false;
      }
    },
    { timeout: MAP_LOAD_TIMEOUT }
  );
}

export async function renderMap(
  options: RenderMapOptions = {}
): Promise<{ mapRef: React.MutableRefObject<YaMapRef | null> }> {
  await ensureMapKitInitialized();

  const mapRef = { current: null as YaMapRef | null };
  let mapLoaded = false;

  await render(
    <MapHost
      mapRef={mapRef}
      onLoaded={() => {
        mapLoaded = true;
      }}
      {...options}
    />
  );

  await waitForMapReady(mapRef, () => mapLoaded);

  return { mapRef };
}

export async function renderMapWithOverlays(
  options: RenderMapOptions = {}
): Promise<{ mapRef: React.MutableRefObject<YaMapRef | null> }> {
  await ensureMapKitInitialized();

  const mapRef = { current: null as YaMapRef | null };
  let mapLoaded = false;

  await render(
    <OverlayMapHost
      mapRef={mapRef}
      onLoaded={() => {
        mapLoaded = true;
      }}
      {...options}
    />
  );

  await waitForMapReady(mapRef, () => mapLoaded);

  return { mapRef };
}

/**
 * Renders an overlay (Marker / Circle / Polygon / Polyline) inside a map,
 * then swaps it for a second variant after `delayMs`. Use to exercise the
 * native updateProps / didSet path (geometry & style updates), which the
 * mount-only overlay tests never touch.
 *
 * Returns `waitForUpdate()` which resolves once the prop swap has been applied.
 */
export async function renderUpdatingOverlays(options: {
  initial: React.ReactNode;
  updated: React.ReactNode;
  initialRegion?: InitialRegion;
  delayMs?: number;
}): Promise<{
  mapRef: React.MutableRefObject<YaMapRef | null>;
  waitForUpdate: () => Promise<void>;
}> {
  await ensureMapKitInitialized();

  const mapRef = { current: null as YaMapRef | null };
  let mapLoaded = false;
  let updated = false;

  function UpdatingHost() {
    const [phase, setPhase] = React.useState<'initial' | 'updated'>('initial');

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setPhase('updated');
        updated = true;
      }, options.delayMs ?? 800);
      return () => clearTimeout(timer);
    }, []);

    return (
      <View style={styles.container}>
        <ClusteredYamap
          ref={mapRef}
          style={styles.map}
          initialRegion={options.initialRegion ?? INITIAL_REGION}
          clusteredMarkers={[]}
          renderMarker={() => <View />}
          onMapLoaded={() => {
            mapLoaded = true;
          }}
        >
          {phase === 'initial' ? options.initial : options.updated}
        </ClusteredYamap>
      </View>
    );
  }

  await render(<UpdatingHost />);
  await waitForMapReady(mapRef, () => mapLoaded);

  return {
    mapRef,
    waitForUpdate: () =>
      waitUntil(() => updated, {
        timeout: MAP_LOAD_TIMEOUT,
      }) as unknown as Promise<void>,
  };
}

export function expectNear(
  actual: number,
  expected: number,
  precision = 1
): void {
  expect(actual).toBeGreaterThanOrEqual(expected - precision);
  expect(actual).toBeLessThanOrEqual(expected + precision);
}
