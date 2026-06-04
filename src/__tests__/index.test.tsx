import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('../NativeYamapUtils', () => ({
  default: {
    getCameraPosition: jest.fn().mockResolvedValue({
      lat: 55.7558,
      lon: 37.6173,
      zoom: 10,
      azimuth: 0,
      tilt: 0,
    }),
    getVisibleRegion: jest.fn().mockResolvedValue({
      bottomLeft: { lat: 55.7, lon: 37.5 },
      bottomRight: { lat: 55.7, lon: 37.7 },
      topLeft: { lat: 55.8, lon: 37.5 },
      topRight: { lat: 55.8, lon: 37.7 },
    }),
    getScreenPoints: jest.fn().mockResolvedValue({
      points: [{ x: 100, y: 200 }],
    }),
    getWorldPoints: jest.fn().mockResolvedValue({
      points: [{ lat: 55.75, lon: 37.61 }],
    }),
    init: jest.fn().mockResolvedValue(undefined),
    getLocale: jest.fn().mockResolvedValue('ru_RU'),
    setLocale: jest.fn().mockResolvedValue(undefined),
    resetLocale: jest.fn().mockResolvedValue(undefined),
    setZoom: jest.fn().mockResolvedValue(undefined),
    setCenter: jest.fn().mockResolvedValue(undefined),
    fitAllMarkers: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native/Libraries/Image/Image', () => {
  const actual = jest.requireActual('react-native/Libraries/Image/Image');
  return {
    ...actual,
    resolveAssetSource: jest.fn((source) => ({
      uri: typeof source === 'string' ? source : 'mock://asset',
      width: 24,
      height: 24,
    })),
  };
});

import {
  YaMap,
  ClusteredYamap,
  Marker,
  Circle,
  Polygon,
  Polyline,
  YamapUtils,
  Animation,
} from '../index';

const mockUtils = require('../NativeYamapUtils').default as jest.Mocked<
  typeof import('../NativeYamapUtils').default
>;

function fakeViewId(id = 42) {
  jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(id);
  return id;
}

// Resolves the underlying native Fabric component instance from a rendered tree.
function findNative(instance: any, modulePath: string) {
  return instance.root.findByType(require(modulePath).default);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

describe('Exports', () => {
  it('exports YaMap as forwardRef object', () => {
    expect(YaMap).toBeDefined();
    expect(typeof YaMap).toBe('object');
  });

  it('exports ClusteredYamap', () => {
    expect(ClusteredYamap).toBeDefined();
  });

  it('exports Marker as forwardRef object', () => {
    expect(Marker).toBeDefined();
    expect(typeof Marker).toBe('object');
  });

  it('exports Circle, Polygon, Polyline as functions', () => {
    expect(typeof Circle).toBe('function');
    expect(typeof Polygon).toBe('function');
    expect(typeof Polyline).toBe('function');
  });

  it('exports YamapUtils with all methods', () => {
    const methods = [
      'init',
      'getCameraPosition',
      'getVisibleRegion',
      'getScreenPoints',
      'getWorldPoints',
      'setZoom',
      'setCenter',
      'fitAllMarkers',
      'getLocale',
      'setLocale',
      'resetLocale',
    ];
    for (const method of methods) {
      expect(typeof (YamapUtils as any)[method]).toBe('function');
    }
  });

  it('exports Animation enum with SMOOTH and LINEAR', () => {
    expect(Animation.SMOOTH).toBeDefined();
    expect(Animation.LINEAR).toBeDefined();
  });
});

// ─── YamapUtils ───────────────────────────────────────────────────────────────

describe('YamapUtils', () => {
  beforeEach(() => jest.clearAllMocks());

  it('init delegates to native module', async () => {
    await YamapUtils.init('test-key');
    expect(mockUtils.init).toHaveBeenCalledWith('test-key');
  });

  it('getLocale returns locale string', async () => {
    expect(await YamapUtils.getLocale()).toBe('ru_RU');
  });

  it('setLocale delegates correctly', async () => {
    await YamapUtils.setLocale('en_US');
    expect(mockUtils.setLocale).toHaveBeenCalledWith('en_US');
  });

  it('resetLocale delegates correctly', async () => {
    await YamapUtils.resetLocale();
    expect(mockUtils.resetLocale).toHaveBeenCalled();
  });

  it('getCameraPosition returns position object', async () => {
    const pos = await YamapUtils.getCameraPosition(1);
    expect(pos).toEqual(
      expect.objectContaining({ lat: 55.7558, lon: 37.6173, zoom: 10 })
    );
  });

  it('getVisibleRegion returns region with four corners', async () => {
    const region = await YamapUtils.getVisibleRegion(1);
    expect(region).toHaveProperty('bottomLeft');
    expect(region).toHaveProperty('topRight');
  });

  it('getScreenPoints returns screen point array', async () => {
    const result = await YamapUtils.getScreenPoints(1, [
      { lat: 55.75, lon: 37.61 },
    ]);
    expect(result.points).toEqual([{ x: 100, y: 200 }]);
  });

  it('getWorldPoints returns world point array', async () => {
    const result = await YamapUtils.getWorldPoints(1, [{ x: 100, y: 200 }]);
    expect(result.points).toEqual([{ lat: 55.75, lon: 37.61 }]);
  });

  it('setZoom delegates with all args', async () => {
    await YamapUtils.setZoom(1, 14, 500, 'LINEAR');
    expect(mockUtils.setZoom).toHaveBeenCalledWith(1, 14, 500, 'LINEAR');
  });

  it('setCenter delegates with all args', async () => {
    await YamapUtils.setCenter(1, 55.75, 37.61, 12, 0, 0, 500, 'SMOOTH');
    expect(mockUtils.setCenter).toHaveBeenCalledWith(
      1,
      55.75,
      37.61,
      12,
      0,
      0,
      500,
      'SMOOTH'
    );
  });

  it('fitAllMarkers delegates correctly', async () => {
    await YamapUtils.fitAllMarkers(1);
    expect(mockUtils.fitAllMarkers).toHaveBeenCalledWith(1);
  });
});

// ─── YaMap render ─────────────────────────────────────────────────────────────

describe('YaMap render', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<YaMap style={{ flex: 1 }} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with initialRegion', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <YaMap
          style={{ flex: 1 }}
          initialRegion={{ lat: 55.75, lon: 37.61, zoom: 10 }}
        />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders in nightMode', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<YaMap style={{ flex: 1 }} nightMode />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with satellite mapType', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<YaMap style={{ flex: 1 }} mapType="satellite" />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('interactive=false disables all gesture props on native view', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(
        <YaMap style={{ flex: 1 }} interactive={false} />
      );
    });
    const nativeView = instance.root.findByType(
      require('../YamapLiteViewNativeComponent').default
    );
    expect(nativeView.props.zoomGesturesEnabled).toBe(false);
    expect(nativeView.props.scrollGesturesEnabled).toBe(false);
    expect(nativeView.props.tiltGesturesEnabled).toBe(false);
    expect(nativeView.props.rotateGesturesEnabled).toBe(false);
    expect(nativeView.props.fastTapEnabled).toBe(false);
  });

  it('resolves userLocationIcon to a uri string on the native view', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(
        <YaMap
          style={{ flex: 1 }}
          showUserPosition
          userLocationIcon={{ uri: 'https://example.com/loc.png' }}
        />
      );
    });
    const native = findNative(instance, '../YamapLiteViewNativeComponent');
    expect(native.props.userLocationIcon).toBe('https://example.com/loc.png');
  });

  it('passes an empty userLocationIcon string when none is provided', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<YaMap style={{ flex: 1 }} />);
    });
    const native = findNative(instance, '../YamapLiteViewNativeComponent');
    expect(native.props.userLocationIcon).toBe('');
  });

  it('interactive=true preserves individual gesture props', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(
        <YaMap
          style={{ flex: 1 }}
          interactive={true}
          zoomGesturesEnabled={false}
          scrollGesturesEnabled={false}
        />
      );
    });
    const nativeView = instance.root.findByType(
      require('../YamapLiteViewNativeComponent').default
    );
    expect(nativeView.props.zoomGesturesEnabled).toBe(false);
    expect(nativeView.props.scrollGesturesEnabled).toBe(false);
    expect(nativeView.props.tiltGesturesEnabled).toBe(true);
  });
});

// ─── YaMap events ─────────────────────────────────────────────────────────────

describe('YaMap events', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls onMapPress with lat/lon', () => {
    const onMapPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(
        <YaMap style={{ flex: 1 }} onMapPress={onMapPress} />
      );
    });
    const native = instance.root.findByType(
      require('../YamapLiteViewNativeComponent').default
    );
    act(() => {
      native.props.onMapPress({ nativeEvent: { lat: 55.75, lon: 37.61 } });
    });
    expect(onMapPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.61 });
  });

  it('calls onMapLongPress with lat/lon', () => {
    const onMapLongPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(
        <YaMap style={{ flex: 1 }} onMapLongPress={onMapLongPress} />
      );
    });
    const native = instance.root.findByType(
      require('../YamapLiteViewNativeComponent').default
    );
    act(() => {
      native.props.onMapLongPress({ nativeEvent: { lat: 55.75, lon: 37.61 } });
    });
    expect(onMapLongPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.61 });
  });

  it('does not crash when onMapPress is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<YaMap style={{ flex: 1 }} />);
    });
    const native = instance.root.findByType(
      require('../YamapLiteViewNativeComponent').default
    );
    expect(() => {
      act(() => {
        native.props.onMapPress({ nativeEvent: { lat: 0, lon: 0 } });
      });
    }).not.toThrow();
  });
});

// ─── YaMap ref ────────────────────────────────────────────────────────────────

describe('YaMap ref', () => {
  beforeEach(() => jest.clearAllMocks());

  async function makeMapRef() {
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(<YaMap ref={ref} style={{ flex: 1 }} />);
    });
    fakeViewId();
    return ref;
  }

  it('getCameraPosition resolves with position data', async () => {
    const ref = await makeMapRef();
    const result = await ref.current!.getCameraPosition();
    expect(result).toEqual(expect.objectContaining({ lat: 55.7558, zoom: 10 }));
  });

  it('getCameraPosition fires onCameraPositionReceived callback', async () => {
    const onCameraPositionReceived = jest.fn();
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <YaMap
          ref={ref}
          style={{ flex: 1 }}
          onCameraPositionReceived={onCameraPositionReceived}
        />
      );
    });
    fakeViewId();
    await ref.current!.getCameraPosition();
    expect(onCameraPositionReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeEvent: expect.objectContaining({ lat: 55.7558 }),
      })
    );
  });

  it('getVisibleRegion resolves with region data', async () => {
    const ref = await makeMapRef();
    const region = await ref.current!.getVisibleRegion();
    expect(region).toHaveProperty('bottomLeft');
    expect(region).toHaveProperty('topRight');
  });

  it('getVisibleRegion fires onVisibleRegionReceived callback', async () => {
    const onVisibleRegionReceived = jest.fn();
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <YaMap
          ref={ref}
          style={{ flex: 1 }}
          onVisibleRegionReceived={onVisibleRegionReceived}
        />
      );
    });
    fakeViewId();
    await ref.current!.getVisibleRegion();
    expect(onVisibleRegionReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeEvent: expect.objectContaining({
          bottomLeft: expect.any(Object),
        }),
      })
    );
  });

  it('getScreenPoints resolves with screen points array', async () => {
    const ref = await makeMapRef();
    const pts = await ref.current!.getScreenPoints([
      { lat: 55.75, lon: 37.61 },
    ]);
    expect(pts).toEqual([{ x: 100, y: 200 }]);
  });

  it('getScreenPoints fires onWorldToScreenPointsReceived callback', async () => {
    const onWorldToScreenPointsReceived = jest.fn();
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <YaMap
          ref={ref}
          style={{ flex: 1 }}
          onWorldToScreenPointsReceived={onWorldToScreenPointsReceived}
        />
      );
    });
    fakeViewId();
    await ref.current!.getScreenPoints([{ lat: 55.75, lon: 37.61 }]);
    expect(onWorldToScreenPointsReceived).toHaveBeenCalledWith(
      expect.objectContaining({ nativeEvent: { points: [{ x: 100, y: 200 }] } })
    );
  });

  it('getWorldPoints resolves with world points array', async () => {
    const ref = await makeMapRef();
    const pts = await ref.current!.getWorldPoints([{ x: 100, y: 200 }]);
    expect(pts).toEqual([{ lat: 55.75, lon: 37.61 }]);
  });

  it('getWorldPoints fires onScreenToWorldPointsReceived callback', async () => {
    const onScreenToWorldPointsReceived = jest.fn();
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <YaMap
          ref={ref}
          style={{ flex: 1 }}
          onScreenToWorldPointsReceived={onScreenToWorldPointsReceived}
        />
      );
    });
    fakeViewId();
    await ref.current!.getWorldPoints([{ x: 100, y: 200 }]);
    expect(onScreenToWorldPointsReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeEvent: { points: [{ lat: 55.75, lon: 37.61 }] },
      })
    );
  });

  it('setZoom resolves', async () => {
    const ref = await makeMapRef();
    await expect(
      ref.current!.setZoom(12, 0, 'LINEAR')
    ).resolves.toBeUndefined();
    expect(mockUtils.setZoom).toHaveBeenCalledWith(42, 12, 0, 'LINEAR');
  });

  it('setCenter resolves', async () => {
    const ref = await makeMapRef();
    await expect(
      ref.current!.setCenter({ lat: 59.93, lon: 30.33 }, 12, 0, 0, 0, 'LINEAR')
    ).resolves.toBeUndefined();
    expect(mockUtils.setCenter).toHaveBeenCalledWith(
      42,
      59.93,
      30.33,
      12,
      0,
      0,
      0,
      'LINEAR'
    );
  });

  it('fitAllMarkers resolves', async () => {
    const ref = await makeMapRef();
    await expect(ref.current!.fitAllMarkers()).resolves.toBeUndefined();
    expect(mockUtils.fitAllMarkers).toHaveBeenCalledWith(42);
  });

  it('fitMarkers is an alias for fitAllMarkers', async () => {
    const ref = await makeMapRef();
    await expect(ref.current!.fitMarkers([])).resolves.toBeUndefined();
    expect(mockUtils.fitAllMarkers).toHaveBeenCalledWith(42);
  });

  it('setTrafficVisible is a no-op that does not throw', async () => {
    const ref = await makeMapRef();
    expect(() => ref.current!.setTrafficVisible(true)).not.toThrow();
    expect(() => ref.current!.setTrafficVisible(false)).not.toThrow();
  });
});

// ─── ClusteredYamap ───────────────────────────────────────────────────────────

describe('ClusteredYamap', () => {
  const markers = [
    { point: { lat: 55.75, lon: 37.61 }, data: { id: '1' } },
    { point: { lat: 55.76, lon: 37.62 }, data: { id: '2' } },
  ];

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ClusteredYamap
          style={{ flex: 1 }}
          clusteredMarkers={[]}
          renderMarker={() => null as any}
        />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('calls renderMarker for each marker', () => {
    const renderMarker = jest.fn(() => null as any);
    act(() => {
      renderer.create(
        <ClusteredYamap
          style={{ flex: 1 }}
          clusteredMarkers={markers}
          renderMarker={renderMarker}
        />
      );
    });
    expect(renderMarker.mock.calls.length).toBeGreaterThanOrEqual(
      markers.length
    );
    const calledPoints = renderMarker.mock.calls.map(
      (c) => (c as any)[0].point
    );
    expect(calledPoints).toContainEqual(markers[0]!.point);
    expect(calledPoints).toContainEqual(markers[1]!.point);
  });

  it('interactive=false disables gestures on clustered native view', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(
        <ClusteredYamap
          style={{ flex: 1 }}
          clusteredMarkers={[]}
          renderMarker={() => null as any}
          interactive={false}
        />
      );
    });
    const native = instance.root.findByType(
      require('../ClusteredYamapLiteViewNativeComponent').default
    );
    expect(native.props.zoomGesturesEnabled).toBe(false);
    expect(native.props.scrollGesturesEnabled).toBe(false);
  });

  it('exposes ref with fitAllMarkers, fitMarkers, setTrafficVisible', async () => {
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <ClusteredYamap
          ref={ref}
          style={{ flex: 1 }}
          clusteredMarkers={[]}
          renderMarker={() => null as any}
        />
      );
    });
    fakeViewId();
    await expect(ref.current!.fitAllMarkers()).resolves.toBeUndefined();
    await expect(ref.current!.fitMarkers([])).resolves.toBeUndefined();
    expect(() => ref.current!.setTrafficVisible(true)).not.toThrow();
  });

  it('fires onCameraPositionReceived after getCameraPosition', async () => {
    const onCameraPositionReceived = jest.fn();
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(
        <ClusteredYamap
          ref={ref}
          style={{ flex: 1 }}
          clusteredMarkers={[]}
          renderMarker={() => null as any}
          onCameraPositionReceived={onCameraPositionReceived}
        />
      );
    });
    fakeViewId();
    await ref.current!.getCameraPosition();
    expect(onCameraPositionReceived).toHaveBeenCalled();
  });
});

// ─── Marker ───────────────────────────────────────────────────────────────────

describe('Marker', () => {
  it('renders with required point prop', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<Marker point={{ lat: 55.75, lon: 37.61 }} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with all optional props', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Marker
          point={{ lat: 55.75, lon: 37.61 }}
          size={32}
          scale={1.5}
          zIndex={10}
          rotated
          visible
          handled
          anchor={{ x: 0.5, y: 1.0 }}
          source={{ uri: 'https://example.com/pin.png' }}
        />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('fires onPress with nativeEvent point', () => {
    const onPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(
        <Marker point={{ lat: 55.75, lon: 37.61 }} onPress={onPress} />
      );
    });
    const native = instance.root.findByType(
      require('../YamapMarkerViewNativeComponent').default
    );
    act(() => {
      native.props.onMarkerPress({ nativeEvent: { lat: 55.75, lon: 37.61 } });
    });
    expect(onPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.61 });
  });

  it('does not crash when onPress is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Marker point={{ lat: 55.75, lon: 37.61 }} />);
    });
    const native = instance.root.findByType(
      require('../YamapMarkerViewNativeComponent').default
    );
    expect(() => {
      act(() => {
        native.props.onMarkerPress({ nativeEvent: { lat: 0, lon: 0 } });
      });
    }).not.toThrow();
  });

  it('resolves source URI string from image asset', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(
        <Marker
          point={{ lat: 55.75, lon: 37.61 }}
          source={{ uri: 'https://example.com/icon.png' }}
        />
      );
    });
    const native = instance.root.findByType(
      require('../YamapMarkerViewNativeComponent').default
    );
    expect(typeof native.props.source).toBe('string');
  });

  it('passes an empty source string when source is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Marker point={{ lat: 55.75, lon: 37.61 }} />);
    });
    const native = findNative(instance, '../YamapMarkerViewNativeComponent');
    expect(native.props.source).toBe('');
  });

  it('maps zIndex prop to the native zInd prop (defaulting to 1)', () => {
    let withZ: any;
    let withoutZ: any;
    act(() => {
      withZ = renderer.create(
        <Marker point={{ lat: 55.75, lon: 37.61 }} zIndex={8} />
      );
      withoutZ = renderer.create(<Marker point={{ lat: 55.75, lon: 37.61 }} />);
    });
    expect(
      findNative(withZ, '../YamapMarkerViewNativeComponent').props.zInd
    ).toBe(8);
    // Marker defaults zInd to 1 when zIndex is omitted (zIndex ?? 1)
    expect(
      findNative(withoutZ, '../YamapMarkerViewNativeComponent').props.zInd
    ).toBe(1);
  });

  it('animatedMoveTo updates point via ref', async () => {
    const ref = React.createRef<any>();
    let instance: any;
    act(() => {
      instance = renderer.create(
        <Marker ref={ref} point={{ lat: 55.75, lon: 37.61 }} />
      );
    });
    const newPoint = { lat: 59.93, lon: 30.33 };
    act(() => {
      ref.current!.animatedMoveTo(newPoint, 300);
    });

    const native = instance.root.findByType(
      require('../YamapMarkerViewNativeComponent').default
    );
    expect(native.props.point).toEqual(newPoint);
  });

  it('animatedMoveTo syncs back when point prop changes after it', () => {
    const ref = React.createRef<any>();
    let instance: any;
    act(() => {
      instance = renderer.create(
        <Marker ref={ref} point={{ lat: 55.75, lon: 37.61 }} />
      );
    });

    act(() => {
      ref.current!.animatedMoveTo({ lat: 59.93, lon: 30.33 }, 300);
    });

    // parent updates prop to a new value — component must follow
    act(() => {
      instance.update(<Marker ref={ref} point={{ lat: 60.0, lon: 31.0 }} />);
    });

    const native = instance.root.findByType(
      require('../YamapMarkerViewNativeComponent').default
    );
    expect(native.props.point).toEqual({ lat: 60.0, lon: 31.0 });
  });

  it('animatedRotateTo is a no-op that does not throw', () => {
    const ref = React.createRef<any>();
    act(() => {
      renderer.create(<Marker ref={ref} point={{ lat: 55.75, lon: 37.61 }} />);
    });
    expect(() => ref.current!.animatedRotateTo(90, 300)).not.toThrow();
    expect(() => ref.current!.animatedRotateTo(0, 0)).not.toThrow();
  });
});

// ─── Circle ───────────────────────────────────────────────────────────────────

describe('Circle', () => {
  const defaults = { center: { lat: 55.75, lon: 37.61 }, radius: 5000 };

  it('renders with required props', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<Circle {...defaults} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with zIndex and zInd props', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Circle {...defaults} zIndex={10} fillColor="#ff000044" />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('maps zIndex prop to the native zInd prop', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Circle {...defaults} zIndex={7} />);
    });
    const native = findNative(instance, '../YamapCircleViewNativeComponent');
    expect(native.props.zInd).toBe(7);
  });

  it('fires onPress with nativeEvent point', () => {
    const onPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(<Circle {...defaults} onPress={onPress} />);
    });
    const native = instance.root.findByType(
      require('../YamapCircleViewNativeComponent').default
    );
    act(() => {
      native.props.onCirclePress({ nativeEvent: { lat: 55.75, lon: 37.61 } });
    });
    expect(onPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.61 });
  });

  it('does not crash when onPress is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Circle {...defaults} />);
    });
    const native = instance.root.findByType(
      require('../YamapCircleViewNativeComponent').default
    );
    expect(() => {
      act(() => {
        native.props.onCirclePress({ nativeEvent: { lat: 0, lon: 0 } });
      });
    }).not.toThrow();
  });
});

// ─── Polygon ──────────────────────────────────────────────────────────────────

describe('Polygon', () => {
  const pts = [
    { lat: 55.78, lon: 37.55 },
    { lat: 55.79, lon: 37.68 },
    { lat: 55.72, lon: 37.71 },
  ];

  it('renders with required points', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<Polygon points={pts} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with innerRings (hole polygon)', () => {
    const hole = [
      { lat: 55.765, lon: 37.6 },
      { lat: 55.768, lon: 37.63 },
      { lat: 55.748, lon: 37.64 },
    ];
    let tree: any;
    act(() => {
      tree = renderer.create(<Polygon points={pts} innerRings={[hole]} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('maps zIndex prop to the native zInd prop', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Polygon points={pts} zIndex={9} />);
    });
    const native = findNative(instance, '../YamapPolygonViewNativeComponent');
    expect(native.props.zInd).toBe(9);
  });

  it('fires onPress with nativeEvent point', () => {
    const onPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(<Polygon points={pts} onPress={onPress} />);
    });
    const native = instance.root.findByType(
      require('../YamapPolygonViewNativeComponent').default
    );
    act(() => {
      native.props.onPolygonPress({ nativeEvent: { lat: 55.75, lon: 37.61 } });
    });
    expect(onPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.61 });
  });

  it('does not crash when onPress is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Polygon points={pts} />);
    });
    const native = instance.root.findByType(
      require('../YamapPolygonViewNativeComponent').default
    );
    expect(() => {
      act(() => {
        native.props.onPolygonPress({ nativeEvent: { lat: 0, lon: 0 } });
      });
    }).not.toThrow();
  });
});

// ─── Polyline ─────────────────────────────────────────────────────────────────

describe('Polyline', () => {
  const pts = [
    { lat: 55.74, lon: 37.58 },
    { lat: 55.75, lon: 37.62 },
    { lat: 55.77, lon: 37.6 },
  ];

  it('renders with required points', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<Polyline points={pts} />);
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders with all style props', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Polyline
          points={pts}
          strokeColor="#00cc88"
          strokeWidth={4}
          outlineColor="#004422"
          outlineWidth={1}
          dashLength={10}
          gapLength={5}
          dashOffset={0}
          zIndex={3}
          handled
        />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('maps zIndex prop to the native zInd prop', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Polyline points={pts} zIndex={5} />);
    });
    const native = findNative(instance, '../YamapPolylineViewNativeComponent');
    expect(native.props.zInd).toBe(5);
  });

  it('fires onPress with nativeEvent point', () => {
    const onPress = jest.fn();
    let instance: any;
    act(() => {
      instance = renderer.create(<Polyline points={pts} onPress={onPress} />);
    });
    const native = instance.root.findByType(
      require('../YamapPolylineViewNativeComponent').default
    );
    act(() => {
      native.props.onPolylinePress({ nativeEvent: { lat: 55.75, lon: 37.62 } });
    });
    expect(onPress).toHaveBeenCalledWith({ lat: 55.75, lon: 37.62 });
  });

  it('does not crash when onPress is absent', () => {
    let instance: any;
    act(() => {
      instance = renderer.create(<Polyline points={pts} />);
    });
    const native = instance.root.findByType(
      require('../YamapPolylineViewNativeComponent').default
    );
    expect(() => {
      act(() => {
        native.props.onPolylinePress({ nativeEvent: { lat: 0, lon: 0 } });
      });
    }).not.toThrow();
  });
});
