import { useState, useEffect } from 'react';
import { fetchOrders, fetchDirections, fetchDrivers, fetchVehicles, fetchCategories, fetchTenantData } from '../../services/auxiliaryService';
import { geocodeAddress } from '../../services/geocodeService';
import { Order, Direction, Driver, Vehicle, Category } from '../../types';

const useRoutingData = (token: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenantData, setTenantData] = useState<any>(null);
  const [selectedOrders, setSelectedOrders] = useState<{ [key: number]: Order[] }>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          ordersData,
          directionsData,
          driversData,
          vehiclesData,
          categoriesData,
          tenantData
        ] = await Promise.all([
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

    loadInitialData();
  }, [token]);

  return {
    orders,
    directions,
    drivers,
    vehicles,
    categories,
    tenantData,
    selectedOrders,
    setSelectedOrders,
    error
  };
};

export default useRoutingData;
