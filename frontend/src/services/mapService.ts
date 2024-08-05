//mapService.ts
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { Order } from '../types';
import { MAPBOX_BASE_URL, MAPBOX_ACCESS_TOKEN } from './utils/config';
import { geocodeAddress } from './geocodeService';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const calculateRoute = async (
  tenantAddress: string,
  orderedOrders: Order[],
  useOptimizedRoute: boolean,
  map: mapboxgl.Map | null,
  setDistance: React.Dispatch<React.SetStateAction<string | null>>,
  setDuration: React.Dispatch<React.SetStateAction<string | null>>,
  setOrderedOrders: React.Dispatch<React.SetStateAction<Order[]>>
) => {
  const tenantLocation = await geocodeAddress(tenantAddress);
  if (!tenantLocation) return;

  const chunkArray = (arr: Order[], chunkSize: number) => {
    let index = 0;
    const arrayLength = arr.length;
    const tempArray: Order[][] = [];

    for (index = 0; index < arrayLength; index += chunkSize) {
      const chunk = arr.slice(index, index + chunkSize);
      tempArray.push(chunk);
    }

    return tempArray;
  };

  const orderChunks = chunkArray(orderedOrders, 10);
  let combinedRoute: any = {
    distance: 0,
    duration: 0,
    geometry: {
      type: 'LineString',
      coordinates: [] as [number, number][],
    },
    waypoints: [] as any[],
    returnLine: {
      type: 'LineString',
      coordinates: [] as [number, number][],
    },
  };

  for (const chunk of orderChunks) {
    const waypoints = chunk.map(order => `${order.lng},${order.lat}`).join(';');

    const url = useOptimizedRoute
      ? `${MAPBOX_BASE_URL}/optimized-trips/v1/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&roundtrip=true`
      : `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      const route = useOptimizedRoute ? data.trips[0] : data.routes[0];
      if (route) {
        combinedRoute.distance += route.distance;
        combinedRoute.duration += route.duration;
        if (route.geometry && route.geometry.coordinates) {
          combinedRoute.geometry.coordinates.push(...route.geometry.coordinates.slice(1, -1));
          if (chunk === orderChunks[orderChunks.length - 1]) {
            combinedRoute.returnLine.coordinates.push(route.geometry.coordinates[route.geometry.coordinates.length - 2]);
            combinedRoute.returnLine.coordinates.push(route.geometry.coordinates[route.geometry.coordinates.length - 1]);
          }
        }
        if (route.waypoints) {
          combinedRoute.waypoints.push(...route.waypoints.slice(1, -1));
        }
      } else {
        console.error('Route is undefined or invalid:', data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('Unauthorized: Check your Mapbox access token.');
      } else {
        console.error('Error fetching directions:', error);
      }
      return;
    }
  }

  setDistance((combinedRoute.distance / 1000).toFixed(2) + ' km');
  setDuration(formatDuration(combinedRoute.duration / 60)); // Converte minutos para horas e minutos

  if (useOptimizedRoute && combinedRoute.waypoints.length > 0) {
    const optimizedOrderIds = combinedRoute.waypoints.map((wp: any) => wp.waypoint_index);
    const newOrderedOrders = optimizedOrderIds.map((index: number) => orderedOrders[index]);
    setOrderedOrders(newOrderedOrders);
  }

  if (map) {
    const source = map.getSource('route') as mapboxgl.GeoJSONSource;
    source.setData(combinedRoute.geometry);

    const coordinates = combinedRoute.geometry.coordinates;
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      if (map.getLayer('route-forward')) {
        map.removeLayer('route-forward');
      }
      if (map.getLayer('route-backward')) {
        map.removeLayer('route-backward');
      }

      map.addLayer({
        id: 'route-forward',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1D29D9',
          'line-width': 6,
        },
        filter: ['==', '$type', 'LineString'],
      });

      if (map.getSource('return-line')) {
        (map.getSource('return-line') as mapboxgl.GeoJSONSource).setData(combinedRoute.returnLine);
      } else {
        map.addSource('return-line', {
          type: 'geojson',
          data: combinedRoute.returnLine,
        });

        map.addLayer({
          id: 'route-backward',
          type: 'line',
          source: 'return-line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FF0000',
            'line-width': 6,
          },
          filter: ['==', '$type', 'LineString'],
        });
      }
    } else {
      console.error('No coordinates found in the route geometry.');
    }
  }
};

// Função utilitária para converter minutos em horas e minutos
const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const hoursString = hrs > 0 ? `${hrs}h ` : '';
  const minutesString = mins > 0 ? `${mins}m` : '';
  return `${hoursString}${minutesString}`.trim();
};

export { geocodeAddress };
