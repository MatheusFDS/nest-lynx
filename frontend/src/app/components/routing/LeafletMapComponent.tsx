import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar ícones do Leaflet
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapComponentProps {
  orders: { cep: string, lat: number, lng: number }[];
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({ orders }) => {
  const center = { lat: -15.7942, lng: -47.8822 };

  return (
    <MapContainer center={center} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {orders.map((order, index) => (
        <Marker key={index} position={[order.lat, order.lng]} icon={icon}>
          <Popup>
            {`Pedido ${order.cep}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMapComponent;
