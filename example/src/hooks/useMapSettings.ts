import { useState } from 'react';

export type MapMode = 'clustered' | 'plain';
export type MapType = 'map' | 'satellite' | 'hybrid';

export const useMapSettings = () => {
  const [mapMode, setMapMode] = useState<MapMode>('clustered');
  const [mapType, setMapType] = useState<MapType>('map');
  const [nightMode, setNightMode] = useState(false);
  const [showCircle, setShowCircle] = useState(true);
  const [showPolygon, setShowPolygon] = useState(true);
  const [showPolyline, setShowPolyline] = useState(true);
  const [scrollGesturesEnabled, setScrollGesturesEnabled] = useState(true);
  const [zoomGesturesEnabled, setZoomGesturesEnabled] = useState(true);

  const cycleMapType = () => {
    setMapType((prev) => {
      if (prev === 'map') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'map';
    });
  };

  const toggleMapMode = () =>
    setMapMode((prev) => (prev === 'clustered' ? 'plain' : 'clustered'));
  const toggleNightMode = () => setNightMode((prev) => !prev);
  const toggleCircle = () => setShowCircle((prev) => !prev);
  const togglePolygon = () => setShowPolygon((prev) => !prev);
  const togglePolyline = () => setShowPolyline((prev) => !prev);
  const toggleScrollGestures = () => setScrollGesturesEnabled((prev) => !prev);
  const toggleZoomGestures = () => setZoomGesturesEnabled((prev) => !prev);

  return {
    mapMode,
    mapType,
    nightMode,
    showCircle,
    showPolygon,
    showPolyline,
    scrollGesturesEnabled,
    zoomGesturesEnabled,
    cycleMapType,
    toggleMapMode,
    toggleNightMode,
    toggleCircle,
    togglePolygon,
    togglePolyline,
    toggleScrollGestures,
    toggleZoomGestures,
  };
};
