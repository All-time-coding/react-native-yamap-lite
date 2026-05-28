export const YAMAP_API_KEY = process.env.YAMAP_API_KEY ?? '';

export const MOSCOW = {
  lat: 55.751244,
  lon: 37.618423,
};

export const INITIAL_REGION = {
  lat: 55.751244,
  lon: 37.618423,
  zoom: 10,
  azimuth: 0,
  tilt: 0,
};

export const MAP_LOAD_TIMEOUT = 30_000;
export const CAMERA_ANIMATION_TIMEOUT = 5_000;
