import type { Point } from '../../../src/@types';

export const MOSCOW_CENTER: Point = { lat: 55.7558, lon: 37.6173 };

export const CIRCLE = {
  center: MOSCOW_CENTER,
  radius: 3000,
  fillColor: '#4488ff44',
  strokeColor: '#2266cc',
  strokeWidth: 3,
};

export const POLYGON_POINTS: Point[] = [
  { lat: 55.78, lon: 37.55 },
  { lat: 55.79, lon: 37.68 },
  { lat: 55.72, lon: 37.71 },
  { lat: 55.71, lon: 37.56 },
];

export const POLYGON_INNER_RING: Point[] = [
  { lat: 55.765, lon: 37.6 },
  { lat: 55.768, lon: 37.63 },
  { lat: 55.748, lon: 37.64 },
  { lat: 55.745, lon: 37.6 },
];

export const POLYLINE_POINTS: Point[] = [
  { lat: 55.74, lon: 37.58 },
  { lat: 55.75, lon: 37.62 },
  { lat: 55.77, lon: 37.6 },
  { lat: 55.76, lon: 37.65 },
  { lat: 55.78, lon: 37.67 },
];
