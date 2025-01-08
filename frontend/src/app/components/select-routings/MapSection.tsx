import React, { useEffect } from 'react';
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
  useEffect(() => {
    // Define o elemento raiz para acessibilidade
    Modal.setAppElement('#root');
  }, []);

  // Definindo estilos diretamente no componente
  const customStyles: Modal.Styles = {
    content: {
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
      zIndex: 1001, // zIndex do conteúdo do modal
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000, // zIndex do overlay
    },
  };

  return (
    <Modal
      isOpen={showMap}
      onRequestClose={handleCloseMap}
      contentLabel="Mapa"
      style={customStyles}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      ariaHideApp={false} // Já definimos com Modal.setAppElement
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
