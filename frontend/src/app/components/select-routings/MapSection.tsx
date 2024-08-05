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
  handleCloseMap
}) => {
  return (
    <Modal
      isOpen={showMap}
      onRequestClose={handleCloseMap}
      contentLabel="Mapa"
      ariaHideApp={false} // Importante para acessibilidade quando o modal é o foco principal
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '90%',
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          overflow: 'hidden', // Evitar overflow no modal
          padding: 0, // Remover padding para que o mapa ocupe toda a área
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)' // Melhorar o contraste do fundo do modal
        }
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
