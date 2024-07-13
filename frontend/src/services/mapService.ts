import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { Order } from '../types';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0aGV1c2ZkcyIsImEiOiJjbHlpdHB3dDYwamZuMmtvZnVjdTNzbjI3In0.hVf9wJoZ_7mRM_iy09cdWg';

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
    console.error('Geocoding error:', error);
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

  const waypoints = orderedOrders.map(order => `${order.lng},${order.lat}`).join(';');

  const url = useOptimizedRoute
    ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson&roundtrip=true`
    : `https://api.mapbox.com/directions/v5/mapbox/driving/${tenantLocation.lng},${tenantLocation.lat};${waypoints};${tenantLocation.lng},${tenantLocation.lat}?access_token=${mapboxgl.accessToken}&geometries=geojson`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    const route = useOptimizedRoute ? data.trips[0] : data.routes[0];
    if (route) {
      setDistance((route.distance / 1000).toFixed(2) + ' km');
      setDuration((route.duration / 60).toFixed(2) + ' mins');

      if (useOptimizedRoute && route.waypoints) {
        const optimizedOrderIds = route.waypoints.slice(1, -1).map((wp: any) => wp.waypoint_index);
        const newOrderedOrders = optimizedOrderIds.map((index: number) => orderedOrders[index]);
        setOrderedOrders(newOrderedOrders);
      }

      if (map) {
        const source = map.getSource('route') as mapboxgl.GeoJSONSource;
        source.setData(route.geometry);

        const coordinates = route.geometry.coordinates;
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
      }
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
  }
};
