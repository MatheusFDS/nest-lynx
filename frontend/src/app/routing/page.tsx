// pages/routing.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import Modal from 'react-modal';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Order, Direction } from '../../types';
import withAuth from '../hoc/withAuth';
import OrderSection from '../components/select-routings/OrderSection';
import DirectionsSection from '../components/select-routings/DirectionsSection';
import MapSection from '../components/select-routings/MapSection';
import { useTheme } from '../context/ThemeContext';
import { useUserSettings } from '../context/UserSettingsContext';
import useRoutingData from '../hooks/useRoutingData';
import OrderDetailsDialog from '../components/select-routings/OrderDetailsDialog';
import CreateRouteTable from '../components/select-routings/sub-routing/CreateRouteSection'; // Importar o novo componente

interface SelectedOrders {
  [key: number]: Order[];
  noRegion: Order[];
}

const RoutingPage: React.FC = () => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedOrdersDialogOpen, setExpandedOrdersDialogOpen] = useState(false);
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [ordersForMap, setOrdersForMap] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState<number>(1);
  const [useTableLayout, setUseTableLayout] = useState(() => {
    const savedLayout = localStorage.getItem('useTableLayout');
    return savedLayout ? JSON.parse(savedLayout) : false;
  }); // Estado para alternar entre layouts

  const { isDarkMode } = useTheme();
  const { settings } = useUserSettings();
  const token = localStorage.getItem('token') || '';
  const { orders, directions, drivers, vehicles, categories, tenantData, error, updateOrdersState } = useRoutingData(token);
  const [selectedOrders, setSelectedOrders] = useState<SelectedOrders>({ noRegion: [] });

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  useEffect(() => {
    const ordersByDirection: SelectedOrders = directions.reduce((acc, direction) => {
      acc[direction.id] = orders.filter(order => 
        order.cep >= direction.rangeInicio && order.cep <= direction.rangeFim
      );
      return acc;
    }, { noRegion: [] } as SelectedOrders);

    const ordersWithoutDirection = orders.filter(order => 
      !directions.some(direction => 
        order.cep >= direction.rangeInicio && order.cep <= direction.rangeFim
      )
    );

    ordersByDirection.noRegion = ordersWithoutDirection;

    setSelectedOrders(ordersByDirection);
  }, [orders, directions]);

  const handleOrderTransfer = (orderId: number, fromDirectionId: number | 'noRegion', toDirectionId: number | 'noRegion') => {
    setSelectedOrders(prevState => {
      const fromOrders = prevState[fromDirectionId].filter(order => order.id !== orderId);
      const toOrders = [...prevState[toDirectionId], orders.find(order => order.id === orderId)!];
      return { ...prevState, [fromDirectionId]: fromOrders, [toDirectionId]: toOrders };
    });
  };

  const handleDetailsDialogOpen = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleExpandedOrdersDialogOpen = (directionId: number | null) => {
    setCurrentDirectionId(directionId);
    setExpandedOrdersDialogOpen(true);
  };

  const handleExpandedOrdersDialogClose = () => {
    setExpandedOrdersDialogOpen(false);
    setCurrentDirectionId(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      handleOrderTransfer(
        parseInt(result.draggableId),
        source.droppableId === 'no-region' ? 'noRegion' : parseInt(source.droppableId),
        destination.droppableId === 'no-region' ? 'noRegion' : parseInt(destination.droppableId)
      );
    }
  };

  const handleShowMapFromTable = (selectedOrders: Order[]) => {
    const validOrders = selectedOrders.filter(order => order.lat !== undefined && order.lng !== undefined);
    setOrdersForMap(validOrders);
    setShowMap(true);
  };

  const handleShowMapFromSection = (directionId: number | null) => {
    if (directionId !== null) {
      const validOrders = selectedOrders[directionId].filter(order => order.lat !== undefined && order.lng !== undefined);
      setOrdersForMap(validOrders);
      setCurrentDirectionId(directionId);
      setShowMap(true);
    }
  };

  const handleGenerateRouteFromMap = (orderedOrders: Order[]) => {
    setSelectedOrders({ ...selectedOrders, [currentDirectionId!]: orderedOrders });
    setShowMap(false);
    updateOrdersState(); // Atualizar o estado dos pedidos quando uma rota é gerada
    handleClearCart(); // Limpar o carrinho
  };

  const handleCloseMap = () => {
    setShowMap(false);
    updateOrdersState(); // Atualizar o estado dos pedidos quando o mapa é fechado
    handleClearCart(); // Limpar o carrinho
  };

  const handleClearCart = () => {
    setSelectedOrders({ noRegion: [] });
  };

  const toggleLayout = () => {
    setUseTableLayout((prev: any) => {
      const newLayout = !prev;
      localStorage.setItem('useTableLayout', JSON.stringify(newLayout));
      return newLayout;
    });
  };

  return (
    <Container style={{ marginTop: '24px' }}>
      <Typography style={{ marginTop: '10px', marginBottom: '10px' }}>
        {error && <Typography color="error">{error}</Typography>}
      </Typography>

      <Button
        variant="outlined"
        onClick={toggleLayout}
        style={{ marginBottom: '16px' }}
      >
        {useTableLayout ? 'Usar Layout de Arrastar e Soltar' : 'Usar Layout de Tabela'}
      </Button>

      {useTableLayout ? (
        <CreateRouteTable orders={orders} directions={directions} handleShowMap={handleShowMapFromTable} />
      ) : (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <OrderSection
              directions={directions}
              selectedOrders={selectedOrders}
              handleShowMap={handleShowMapFromSection}
              handleExpandedOrdersDialogOpen={handleExpandedOrdersDialogOpen}
              handleDetailsDialogOpen={handleDetailsDialogOpen}
            />
          </DragDropContext>

          <DirectionsSection
            open={expandedOrdersDialogOpen}
            onClose={handleExpandedOrdersDialogClose}
            orders={selectedOrders[currentDirectionId!] || []}
            handleDetailsDialogOpen={handleDetailsDialogOpen}
          />
        </>
      )}

      {showMap && (
        <MapSection
          showMap={showMap}
          ordersForMap={ordersForMap}
          tenantId={tenantId}
          isDarkMode={isDarkMode}
          handleGenerateRouteFromMap={handleGenerateRouteFromMap}
          handleCloseMap={handleCloseMap}
        />
      )}

      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        order={selectedOrder}
      />
    </Container>
  );
};

export default withAuth(RoutingPage);
