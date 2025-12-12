import React from 'react';
import type {
  CameraPosition,
  MapLoaded,
  Point,
  YaMapRef,
} from '../../../src/@types';

export const useMap = () => {
  const mapRef = React.useRef<YaMapRef>(null);
  const [zoom, setZoom] = React.useState(10);

  const handleIncreaseZoom = async () => {
    const newZoom = zoom + 1;
    setZoom(newZoom);
    mapRef.current?.setZoom(newZoom, 1000, 'SMOOTH');
  };

  const handleDecreaseZoom = async () => {
    const newZoom = zoom - 1;
    setZoom(newZoom);
    mapRef.current?.setZoom(newZoom, 1000, 'LINEAR');
  };

  const handleGetCameraPosition = async () => {
    const cameraPosition = await mapRef.current?.getCameraPosition();
    console.log('Camera position', cameraPosition);
  };

  const handleCenterMap = async () => {
    await mapRef.current?.setCenter(
      { lat: 55.8, lon: 37.5 },
      10,
      0,
      0,
      1000,
      'SMOOTH'
    );
  };

  const handleFitAllMarkers = async () => {
    await mapRef.current?.fitAllMarkers();
  };

  const onMapLoaded = (event: MapLoaded) => {
    console.log('Map loaded', event.nativeEvent);
  };

  const onCameraPositionChange = (event: CameraPosition) => {
    console.log('Camera position changed', event.nativeEvent);
  };

  const onCameraPositionChangeEnd = (event: CameraPosition) => {
    console.log('Camera position changed end', event.nativeEvent);
  };

  const onMapPress = (event: Point) => {
    console.log('Map pressed', event);
  };

  const onMapLongPress = (event: Point) => {
    console.log('Map long pressed', event);
  };

  return {
    mapRef,
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
