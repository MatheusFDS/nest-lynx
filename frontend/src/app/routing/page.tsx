'use client'

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import Modal from 'react-modal';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { fetchOrders, fetchDirections, fetchDrivers, fetchVehicles, fetchCategories, fetchTenantData } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Direction, Category } from '../../types';
import withAuth from '../components/withAuth';
import DirectionCard from '../components/routing/DirectionCard';
import OrderDetailsDialog from '../components/routing/OrderDetailsDialog';
import ExpandedOrdersDialog from '../components/routing/ExpandedOrdersDialog';
import MapboxComponent from '../components/routing/MapboxComponent';
import { geocodeAddress } from '../../services/geocodeService';
import { useTheme } from '../context/ThemeContext';

const RoutingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenantData, setTenantData] = useState<any>(null);
  const [selectedOrders, setSelectedOrders] = useState<{ [key: number]: Order[] }>({});
  const [selectedDriver, setSelectedDriver] = useState<number | string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | string>('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedOrdersDialogOpen, setExpandedOrdersDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [ordersForMap, setOrdersForMap] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState<number>(1);

  const { isDarkMode } = useTheme();

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    Modal.setAppElement('#__next');
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [ordersData, directionsData, driversData, vehiclesData, categoriesData, tenantData] = await Promise.all([
        fetchOrders(token),
        fetchDirections(token),
        fetchDrivers(token),
        fetchVehicles(token),
        fetchCategories(token),
        fetchTenantData(token),
      ]);

      const filteredOrders = ordersData.filter((order: { status: string }) => ['Pendente', 'Reentrega'].includes(order.status));

      const geocodedOrders = await Promise.all(
        filteredOrders.map(async (order: Order) => {
          const address = `${order.endereco}, ${order.cidade}, ${order.uf}, ${order.cep}`;
          const location = await geocodeAddress(address);
          if (location) {
            return { ...order, lat: location.lat, lng: location.lng };
          } else {
            console.error(`Failed to geocode address: ${address}`);
            return order;
          }
        })
      );

      setOrders(geocodedOrders);
      setDirections(directionsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setCategories(categoriesData);
      setTenantData(tenantData);

      const initialOrders: { [key: number]: Order[] } = {};
      directionsData.forEach((direction: Direction) => {
        initialOrders[direction.id] = geocodedOrders.filter((order: Order) => {
          return (
            parseInt(order.cep) >= parseInt(direction.rangeInicio) &&
            parseInt(order.cep) <= parseInt(direction.rangeFim)
          );
        });
      });
      setSelectedOrders(initialOrders);
    } catch (error: unknown) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load initial data.');
    }
  };

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

  const calculateTotalWeightAndValue = (orders: Order[]) => {
    let totalWeight = 0;
    let totalValue = 0;
    orders.forEach(order => {
      totalWeight += order.peso;
      totalValue += order.valor;
    });
    return { totalWeight, totalValue };
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
        <Grid container spacing={3}>
          {directions.map(direction => {
            const ordersInDirection = selectedOrders[direction.id] || [];
            if (ordersInDirection.length === 0) return null;

            return (
              <DirectionCard
                key={direction.id}
                direction={direction}
                orders={ordersInDirection}
                handleGenerateDelivery={() => handleShowMap(direction.id)}
                handleExpandedOrdersDialogOpen={handleExpandedOrdersDialogOpen}
                handleDetailsDialogOpen={handleDetailsDialogOpen}
                calculateTotalWeightAndValue={calculateTotalWeightAndValue}
                handleShowMap={() => handleShowMap(direction.id)}
              />
            );
          })}
        </Grid>
      </DragDropContext>

      <ExpandedOrdersDialog
        open={expandedOrdersDialogOpen}
        onClose={handleExpandedOrdersDialogClose}
        orders={selectedOrders[currentDirectionId!] || []}
        handleDetailsDialogOpen={handleDetailsDialogOpen}
      />

      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        order={selectedOrder}
      />

      <Modal
        isOpen={showMap}
        onRequestClose={handleCloseMap}
        contentLabel="Mapa"
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
            backgroundColor: isDarkMode ? '#121212' : '#fff', // Usando o contexto de tema
            color: isDarkMode ? '#fff' : '#000', // Usando o contexto de tema
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
    </Container>
  );
};

export default withAuth(RoutingPage);
