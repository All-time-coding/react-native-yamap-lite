import React from 'react';
import type {
  CameraPosition,
  MapLoaded,
  Point,
  YaMapRef,
} from '../../../src/@types';

type LogFn = (msg: string) => void;

export const useMap = (log: LogFn) => {
  const mapRef = React.useRef<YaMapRef>(null);
  const [zoom, setZoom] = React.useState(10);
  const [cameraInfo, setCameraInfo] = React.useState('');

  const handleIncreaseZoom = () => {
    const newZoom = zoom + 1;
    setZoom(newZoom);
    mapRef.current?.setZoom(newZoom, 500, 'SMOOTH');
    log(`setZoom → ${newZoom}`);
  };

  const handleDecreaseZoom = () => {
    const newZoom = Math.max(1, zoom - 1);
    setZoom(newZoom);
    mapRef.current?.setZoom(newZoom, 500, 'SMOOTH');
    log(`setZoom → ${newZoom}`);
  };

  const handleGetCameraPosition = async () => {
    const pos = await mapRef.current?.getCameraPosition();
    if (pos) {
      const info = `lat=${pos.lat.toFixed(4)} lon=${pos.lon.toFixed(4)} z=${pos.zoom.toFixed(1)}`;
      setCameraInfo(info);
      log(`getCameraPos: ${info}`);
    }
  };

  const handleCenterMap = () => {
    mapRef.current?.setCenter(
      { lat: 55.7558, lon: 37.6173 },
      10,
      0,
      0,
      800,
      'SMOOTH'
    );
    log('setCenter → Moscow');
  };

  const handleFitAllMarkers = () => {
    mapRef.current?.fitAllMarkers();
    log('fitAllMarkers');
  };

  const onMapLoaded = (event: MapLoaded) => {
    log(`mapLoaded: objects=${event.nativeEvent.renderObjectCount}`);
  };

  const onCameraPositionChange = (event: CameraPosition) => {
    const { point, zoom: z } = event.nativeEvent;
    setCameraInfo(
      `lat=${point.lat.toFixed(4)} lon=${point.lon.toFixed(4)} z=${z.toFixed(1)}`
    );
  };

  const onCameraPositionChangeEnd = (event: CameraPosition) => {
    const { point, zoom: z, reason } = event.nativeEvent;
    log(`camEnd: z=${z.toFixed(1)} reason=${reason}`);
    setCameraInfo(
      `lat=${point.lat.toFixed(4)} lon=${point.lon.toFixed(4)} z=${z.toFixed(1)}`
    );
  };

  const onMapPress = (event: Point) => {
    log(`mapPress: ${event.lat.toFixed(4)}, ${event.lon.toFixed(4)}`);
  };

  const onMapLongPress = (event: Point) => {
    log(`longPress: ${event.lat.toFixed(4)}, ${event.lon.toFixed(4)}`);
  };

  return {
    mapRef,
    cameraInfo,
    handleIncreaseZoom,
    handleDecreaseZoom,
    handleGetCameraPosition,
    handleCenterMap,
    handleFitAllMarkers,
    onMapLoaded,
    onCameraPositionChange,
    onCameraPositionChangeEnd,
    onMapPress,
    onMapLongPress,
  };
};
