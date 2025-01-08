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
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          overflow: 'hidden',
          padding: 5,
          margin: 0,
                    // Estilos para centralizar o modal
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)'
        },
        overlay: {
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
