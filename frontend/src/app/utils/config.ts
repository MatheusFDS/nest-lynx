// src/config.ts
export const MAPBOX_BASE_URL = 'https://api.mapbox.com';
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;

if (!MAPBOX_ACCESS_TOKEN) {
  throw new Error('Mapbox API key is not defined in environment variables.');
}
