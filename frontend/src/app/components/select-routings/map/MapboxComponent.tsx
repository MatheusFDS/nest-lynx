import React from 'react';
import { IconButton, Typography, Box, SelectChangeEvent } from '@mui/material';
import { Check as CheckIcon, AutoFixHigh as AutoFixHighIcon, EditRoad as EditRoadIcon, Close as CloseIcon, SwapVert as SwapVertIcon } from '@mui/icons-material';
import OrderDetailsDialog from '../OrderDetailsDialog';
import { Order } from '../../../../types';
import OrderList from './OrderList';
import DriverSelection from './DriverSelection';
import VehicleSelection from './VehicleSelection';
import RouteSummary from './RouteSummary';
import { useMapboxComponent } from '../../../hooks/useMapboxComponent';

interface MapboxComponentProps {
  tenantId: string;
  orders: Order[];
  onClose: () => void;
  onGenerateRoute: (orderedOrders: Order[]) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const panelStyle = {
  width: '100%',
  padding: '5px',
  fontSize: '0.95em',
};

const MapboxComponent: React.FC<MapboxComponentProps> = ({ tenantId, orders, onClose, onGenerateRoute }) => {
  const {
    mapContainer,
    map,
    distance,
    duration,
    orderedOrders,
    drivers,
    selectedDriver,
    vehicles,
    selectedVehicle,
    freightValue,
    selectedOrder,
    orderDetailsOpen,
    isDarkMode,
    moveOrder,
    removeOrder,
    invertOrder,
    handleGenerateRoute,
    handleDriverChange,
    handleVehicleChange,
    handleOpenOrderDetails,
    handleCloseOrderDetails,
    tenantAddress,
    calculateRoute,
    optimizeOrders,
    setDistance,
    setDuration,
    setOrderedOrders
  } = useMapboxComponent(tenantId, orders, onClose, onGenerateRoute);

  // Função de adaptação para o handleDriverChange
  const handleDriverChangeWrapper = (event: SelectChangeEvent<string | number>) => {
    const adaptedEvent = {
      ...event,
      target: {
        ...event.target,
        value: event.target.value.toString(),
      },
    } as SelectChangeEvent<string>;
    handleDriverChange(adaptedEvent);
  };

  // Função de adaptação para o handleVehicleChange
  const handleVehicleChangeWrapper = (event: SelectChangeEvent<string | number>) => {
    const adaptedEvent = {
      ...event,
      target: {
        ...event.target,
        value: event.target.value.toString(),
      },
    } as SelectChangeEvent<string>;
    handleVehicleChange(adaptedEvent);
  };

  return (
    <Box display="flex" height="100%">
      <Box flex="3" display="flex" height="100%">
        <div ref={mapContainer} style={containerStyle}></div>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" style={panelStyle} height="100%">
        <OrderList
          orders={orderedOrders}
          moveOrder={moveOrder}
          removeOrder={removeOrder}
          openOrderDetails={handleOpenOrderDetails}
        />
        <Box mt="auto">
          <Box display="flex" flexDirection="column" gap={1} mb={1}>
            <Typography variant="h6" gutterBottom style={{ fontSize: '0.85em' }}>Seleção de Motorista</Typography>
            <DriverSelection
              drivers={drivers}
              selectedDriver={selectedDriver}
              handleDriverChange={handleDriverChangeWrapper}
            />
            <VehicleSelection
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              handleVehicleChange={handleVehicleChangeWrapper}
            />
          </Box>
          <RouteSummary
            totalWeight={orderedOrders.reduce((acc, order) => acc + order.peso, 0)}
            totalValue={orderedOrders.reduce((acc, order) => acc + order.valor, 0)}
            freightValue={freightValue}
            distance={distance}
          />
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            <IconButton aria-label="optimize" color="primary" onClick={optimizeOrders} size="small">
              <AutoFixHighIcon />
            </IconButton>
            <IconButton aria-label="invert" color="primary" onClick={invertOrder} size="small">
              <SwapVertIcon />
            </IconButton>
            <IconButton aria-label="manual" color="primary" onClick={() => calculateRoute(tenantAddress!, orderedOrders, false, map, setDistance, setDuration, setOrderedOrders)} size="small">
              <EditRoadIcon />
            </IconButton>
            <IconButton aria-label="confirm" color="primary" onClick={handleGenerateRoute} size="small">
              <CheckIcon />
            </IconButton>
            <IconButton aria-label="close" color="secondary" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <OrderDetailsDialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
    </Box>
  );
};

export default MapboxComponent;
