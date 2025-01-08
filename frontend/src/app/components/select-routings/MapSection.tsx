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
