import React from 'react';
import Modal from 'react-modal';
import MapboxComponent from './map/MapboxComponent';
import { Order } from '../../../types';

interface MapSectionProps {
  showMap: boolean;
  ordersForMap: Order[];
  tenantId: string;
  isDarkMode: boolean;
  handleGenerateRouteFromMap: (orderedOrders: Order[]) => void;
  handleCloseMap: () => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  showMap,
  ordersForMap,
  tenantId,
  isDarkMode,
  handleGenerateRouteFromMap,
  handleCloseMap,
}) => {
  return (
    <Modal
      isOpen={showMap}
      onRequestClose={handleCloseMap}
      contentLabel="Mapa"
      ariaHideApp={false}
      style={{
        content: {
          // Ocupa 100% da largura e altura da tela
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          overflow: 'hidden',
          padding: 0,
          margin: 0,
          border: 'none',
        },
        overlay: {
          // Ocupa também 100% da tela
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        },
      }}
    >
      <MapboxComponent
        orders={ordersForMap}
        onClose={handleCloseMap}
        tenantId={tenantId}
        onGenerateRoute={handleGenerateRouteFromMap}
      />
    </Modal>
  );
};

export default MapSection;
