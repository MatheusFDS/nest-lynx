import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { Order } from '../types';

// Verifique se o token está definido corretamente
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
if (!mapboxAccessToken) {
  throw new Error("Mapbox API key is not defined in environment variables.");
}

mapboxgl.accessToken = mapboxAccessToken;

export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: mapboxgl.accessToken,
      },
    });
    const { data } = response;
    if (data.features && data.features.length > 0) {
      const { center } = data.features[0];
      return { lat: center[1], lng: center[0] };
    } else {
      console.error('Geocoding error:', data.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Unauthorized: Check your Mapbox access token.');
    } else {
      console.error('Geocoding error:', error);
    }
    return null;
  }
};

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
      ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson&roundtrip=true`
      : `https://api.mapbox.com/directions/v5/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      const route = useOptimizedRoute ? data.trips[0] : data.routes[0];
      if (route) {
        combinedRoute.distance += route.distance;
        combinedRoute.duration += route.duration;
        if (route.geometry && route.geometry.coordinates) {
          combinedRoute.geometry.coordinates.push(...route.geometry.coordinates.slice(1, -1));
          // Adiciona a linha de volta para o ponto inicial
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
  setDuration((combinedRoute.duration / 60).toFixed(2) + ' mins');

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

      // Adiciona a fonte de dados e a camada para a linha de volta
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
            'line-color': '#FF0000', // cor vermelha para o traçado de volta
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