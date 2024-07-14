'use client';

import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import Modal from 'react-modal';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Order } from '../../types';
import withAuth from '../hoc/withAuth';
import OrderSection from '../components/select-routings/OrderSection';
import DirectionsSection from '../components/select-routings/DirectionsSection';
import MapSection from '../components/select-routings/MapSection';
import { useTheme } from '../context/ThemeContext';
import useRoutingData from '../hooks/useRoutingData';
import OrderDetailsDialog from '../components/select-routings/OrderDetailsDialog';

const RoutingPage: React.FC = () => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedOrdersDialogOpen, setExpandedOrdersDialogOpen] = useState(false);
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [ordersForMap, setOrdersForMap] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState<number>(1);

  const { isDarkMode } = useTheme();
  const token = localStorage.getItem('token') || '';
  const { orders, directions, drivers, vehicles, categories, tenantData, selectedOrders, setSelectedOrders, error } = useRoutingData(token);

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  const handleOrderTransfer = (orderId: number, fromDirectionId: number, toDirectionId: number) => {
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

  const handleExpandedOrdersDialogOpen = (directionId: number) => {
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
      handleOrderTransfer(parseInt(result.draggableId), parseInt(source.droppableId), parseInt(destination.droppableId));
    }
  };

  const handleShowMap = (directionId: number) => {
    setCurrentDirectionId(directionId);
    const validOrders = selectedOrders[directionId].filter(order => order.lat !== undefined && order.lng !== undefined);
    setOrdersForMap(validOrders);
    setShowMap(true);
  };

  const handleGenerateRouteFromMap = (orderedOrders: Order[]) => {
    setSelectedOrders({ ...selectedOrders, [currentDirectionId!]: orderedOrders });
    setShowMap(false);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  return (
    <Container style={{ marginTop: '24px' }}>
      <Typography style={{ marginTop: '10px', marginBottom: '10px' }}>
        {error && <Typography color="error">{error}</Typography>}
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <OrderSection
          directions={directions}
          selectedOrders={selectedOrders}
          handleShowMap={handleShowMap}
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

      <MapSection
        showMap={showMap}
        ordersForMap={ordersForMap}
        tenantId={tenantId}
        isDarkMode={isDarkMode}
        handleGenerateRouteFromMap={handleGenerateRouteFromMap}
        handleCloseMap={handleCloseMap}
      />

      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        order={selectedOrder}
      />
    </Container>
  );
};

export default withAuth(RoutingPage);
