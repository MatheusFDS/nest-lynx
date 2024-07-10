import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

interface GoogleMapsComponentProps {
  orders: { cep: string, lat: number, lng: number }[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -15.7942,
  lng: -47.8822,
};

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({ orders }) => {
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);

  const calculateRoute = useCallback(() => {
    if (orders.length < 2) return;

    const waypoints = orders.slice(1, -1).map(order => ({
      location: { lat: order.lat, lng: order.lng },
      stopover: true,
    }));

    const origin = { lat: orders[0].lat, lng: orders[0].lng };
    const destination = { lat: orders[orders.length - 1].lat, lng: orders[orders.length - 1].lng };

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [orders]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCI6j3093lkPtwImKxNXLT101hp96uTbn0">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {orders.map((order, index) => (
          <Marker key={index} position={{ lat: order.lat, lng: order.lng }} />
        ))}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
      <button onClick={calculateRoute}>Calcular Rota</button>
    </LoadScript>
  );
};

export default GoogleMapsComponent;
