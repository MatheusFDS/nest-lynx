// components/MapComponent.tsx

import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const MapComponent = ({ orders }) => {
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (orders.length > 1) {
      const waypoints = orders.slice(1, -1).map(order => ({
        location: { lat: order.latitude, lng: order.longitude },
        stopover: true
      }));

      const origin = { lat: orders[0].latitude, lng: orders[0].longitude };
      const destination = { lat: orders[orders.length - 1].latitude, lng: orders[orders.length - 1].longitude };

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [orders]);

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={orders.length > 0 ? { lat: orders[0].latitude, lng: orders[0].longitude } : { lat: 0, lng: 0 }}
        zoom={10}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
