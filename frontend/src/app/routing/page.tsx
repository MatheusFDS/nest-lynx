'use client'

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Button } from '@mui/material';
import Modal from 'react-modal';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { fetchOrders, fetchDirections, fetchDrivers, fetchVehicles, fetchCategories, fetchTenantData } from '../../services/auxiliaryService';
import { Order, Driver, Vehicle, Direction, Category } from '../../types';
import withAuth from '../components/withAuth';
import { SelectChangeEvent } from '@mui/material/Select';
import { addDelivery } from '../../services/deliveryService';
import DirectionCard from '../components/routing/DirectionCard';
import OrderDetailsDialog from '../components/routing/OrderDetailsDialog';
import GenerateRouteDialog from '../components/routing/GenerateRouteDialog';
import ExpandedOrdersDialog from '../components/routing/ExpandedOrdersDialog';
import GoogleMapsComponent from '../components/routing/GoogleMapsComponent';
import { geocodeAddress } from '../../services/geocodeService';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedOrdersDialogOpen, setExpandedOrdersDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDirectionId, setCurrentDirectionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [ordersForMap, setOrdersForMap] = useState<Order[]>([]);
  const [additionalValue, setAdditionalValue] = useState<number>(0);
  const [tollValue, setTollValue] = useState<number>(0);
  const [vehicleValue, setVehicleValue] = useState<number>(0);
  const [tenantId, setTenantId] = useState<number>(1); // Defina o tenantId adequadamente

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    Modal.setAppElement('#__next'); // Garantir que o contêiner principal é acessível
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

      // Geocodificar os endereços dos pedidos
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

  const handleSaveState = () => {
    // Save the current state of orders in directions
  };

  const handleGenerateDelivery = (directionId: number) => {
    setCurrentDirectionId(directionId);
    const directionOrders = selectedOrders[directionId];
    if (directionOrders && directionOrders.length > 0) {
      const order = directionOrders[0];
      const driver = drivers.find(driver => driver.id === order.id);
      if (driver) {
        const vehicle = vehicles.find(vehicle => vehicle.driverId === driver.id);
        if (vehicle) {
          setSelectedDriver(driver.id);
          setSelectedVehicle(vehicle.id);
          setVehicleValue(vehicle.categoryId);
        }
      }
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentDirectionId(null);
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

  const openGoogleMaps = (cep: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cep}`;
    window.open(url, '_blank');
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

  const handleDriverChange = (e: SelectChangeEvent<number | string>) => {
    const driverId = e.target.value as number;
    setSelectedDriver(driverId);
    const driver = drivers.find(driver => driver.id === driverId);
    if (driver) {
      const vehicle = vehicles.find(vehicle => vehicle.driverId === driver.id);
      if (vehicle) {
        setSelectedVehicle(vehicle.id);
        setVehicleValue(vehicle.categoryId); // Utilize o categoryId para obter o valor da categoria
      } else {
        setSelectedVehicle('');
        setVehicleValue(0);
      }
    }
  };

  const handleVehicleChange = (e: SelectChangeEvent<number | string>) => {
    const vehicleId = e.target.value as number;
    setSelectedVehicle(vehicleId);
    setVehicleValue(getVehicleValue(vehicleId));
  };

  const getVehicleValue = (vehicleId: number | string) => {
    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      const category = categories.find(c => c.id === vehicle.categoryId);
      return category ? category.valor : 0;
    }
    return 0;
  };

  const getMaxDirectionValue = (ordersInDirection: Order[]) => {
    let maxDirectionValue = 0;
    if (Array.isArray(ordersInDirection)) {
      ordersInDirection.forEach(order => {
        const direction = directions.find(
          direction =>
            parseInt(order.cep) >= parseInt(direction.rangeInicio) &&
            parseInt(order.cep) <= parseInt(direction.rangeFim)
        );
        if (direction && Number(direction.valorDirecao) > maxDirectionValue) {
          maxDirectionValue = Number(direction.valorDirecao);
        }
      });
    }
    return maxDirectionValue;
  };

  const calculateFreightValue = () => {
    const ordersInDirection = selectedOrders[currentDirectionId!] || [];
    const maxDirectionValue = getMaxDirectionValue(ordersInDirection);
    const vehicleCategoryValue = getVehicleValue(selectedVehicle);
    return maxDirectionValue + vehicleCategoryValue + tollValue;
  };

  const handleConfirmDelivery = async () => {
    if (!currentDirectionId || !tenantData) return;

    const ordersInDirection = selectedOrders[currentDirectionId];
    if (!ordersInDirection || ordersInDirection.length === 0) return;

    const { totalWeight, totalValue } = calculateTotalWeightAndValue(ordersInDirection);
    const freightValue = calculateFreightValue();

    const deliveryData = {
      motoristaId: selectedDriver as number,
      veiculoId: Number(selectedVehicle), // Garantir que veiculoId é um número
      valorFrete: freightValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      tenantId: tenantId,
      orders: ordersInDirection.map(order => ({
        id: order.id,
        cliente: order.cliente,
        numero: order.numero,
        // Adicione outros campos necessários
      })), // Incluindo os campos necessários
    };

    console.log('Delivery data being sent:', JSON.stringify(deliveryData, null, 2));

    try {
      const createdDelivery = await addDelivery(token, deliveryData);
      setDialogOpen(false);
      setCurrentDirectionId(null);

      if (createdDelivery.status === 'A liberar') {
        alert('O roteiro foi enviado para liberação do gestor. Caso deseje adicionar mais pedidos posteriormente, exclua o roteiro.');
      } else {
        alert('Roteiro gerado com sucesso!');
      }

      // Atualize os pedidos para remover os confirmados
      setSelectedOrders(prevState => {
        const updatedOrders = { ...prevState };
        updatedOrders[currentDirectionId!] = updatedOrders[currentDirectionId!].filter(order => !deliveryData.orders.map(o => o.id).includes(order.id));
        return updatedOrders;
      });

      // Atualize a lista principal de pedidos
      setOrders(prevOrders => prevOrders.filter(order => !deliveryData.orders.map(o => o.id).includes(order.id)));

      // Recarregar dados iniciais
      loadInitialData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to create delivery:', error.message);
        setError(error.message);
        alert(`Erro: ${error.message}`);
      } else {
        console.error('Failed to create delivery:', error);
        setError('Failed to create delivery.');
        alert('Erro: Falha ao criar roteiro.');
      }
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
    setDialogOpen(true);
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
            const directionId = direction.id.toString();
            const ordersInDirection = selectedOrders[direction.id] || [];
            if (ordersInDirection.length === 0) return null;

            return (
              <DirectionCard
                key={direction.id}
                direction={direction}
                orders={ordersInDirection}
                handleGenerateDelivery={handleGenerateDelivery}
                handleExpandedOrdersDialogOpen={handleExpandedOrdersDialogOpen}
                handleDetailsDialogOpen={handleDetailsDialogOpen}
                calculateTotalWeightAndValue={calculateTotalWeightAndValue}
                handleShowMap={handleShowMap}
              />
            );
          })}
        </Grid>
      </DragDropContext>

      <GenerateRouteDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelivery}
        selectedDriver={selectedDriver}
        selectedVehicle={selectedVehicle}
        handleDriverChange={handleDriverChange}
        handleVehicleChange={handleVehicleChange}
        drivers={drivers}
        vehicles={vehicles}
        orders={selectedOrders[currentDirectionId!] || []}
        calculateFreightValue={calculateFreightValue}
        calculateTotalWeightAndValue={calculateTotalWeightAndValue}
        openGoogleMaps={openGoogleMaps}
        setSelectedOrders={setSelectedOrders}
        currentDirectionId={currentDirectionId}
      />

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
            width: '80%',
            height: '80%'
          },
        }}
      >
        <GoogleMapsComponent orders={ordersForMap} onClose={handleCloseMap} tenantId={tenantId} onGenerateRoute={handleGenerateRouteFromMap} />
      </Modal>
    </Container>
  );
};

export default withAuth(RoutingPage);
