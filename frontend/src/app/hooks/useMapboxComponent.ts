import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import update from 'immutability-helper';
import { fetchTenantData, fetchDrivers, fetchVehicles, fetchCategories, fetchDirections } from '../../services/auxiliaryService';
import { addDelivery } from '../../services/deliveryService';
import { Tenant, Order, Driver, Vehicle, Category, Direction } from '../../types';
import { useTheme } from '../context/ThemeContext';
import { geocodeAddress, calculateRoute as calculateRouteService } from '../../services/mapService';
import { SelectChangeEvent } from '@mui/material';

export const useMapboxComponent = (tenantId: string, orders: Order[], onClose: () => void, onGenerateRoute: (orderedOrders: Order[]) => void) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [tenantAddress, setTenantAddress] = useState<string | null>(null);
  const [orderedOrders, setOrderedOrders] = useState<Order[]>(orders);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [freightValue, setFreightValue] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState<boolean>(false);

  const { isDarkMode } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const markers = useRef<mapboxgl.Marker[]>([]); // Referência para os marcadores no mapa

  const fetchTenantAddress = async (token: string) => {
    try {
      const tenantData: Tenant[] = await fetchTenantData(token);
      if (tenantData && tenantData.length > 0 && tenantData[0].address) {
        return tenantData[0].address;
      }
      return null;
    } catch (error) {
     // console.error('Error fetching tenant address:', error);
      return null;
    }
  };

  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const address = await fetchTenantAddress(token);
      if (address) {
        setTenantAddress(address);
      } else {
      //  console.error('Tenant address is null or undefined');
      }

      const driversData = await fetchDrivers(token);
      setDrivers(driversData);
      const vehiclesData = await fetchVehicles(token);
      setVehicles(vehiclesData);
      const categoriesData = await fetchCategories(token);
      setCategories(categoriesData);
      const directionsData = await fetchDirections(token);
      setDirections(directionsData);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (mapContainer.current && tenantAddress && !map) {
      const initializeMap = async () => {
        const tenantLocation = await geocodeAddress(tenantAddress!);
        if (!tenantLocation) return;

        const initializedMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: isDarkMode ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/streets-v11',
          center: [tenantLocation.lng, tenantLocation.lat],
          zoom: 12,
        });

        initializedMap.on('load', () => {
          initializedMap.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
            },
          });

          setMap(initializedMap);
        });
      };

      initializeMap();
    }
  }, [tenantAddress, isDarkMode, map]);

  useEffect(() => {
    const addMarker = (position: { lat: number; lng: number }, index: number, color: string, label: string) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = color;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.color = 'WHITE';
      el.style.fontSize = '10px';
      el.innerText = label;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([position.lng, position.lat])
        .addTo(map!);

      markers.current.push(marker); // Adiciona o marcador à lista de marcadores
    };

    const addMarkersToMap = async () => {
      markers.current.forEach(marker => marker.remove()); // Remove todos os marcadores do mapa
      markers.current = []; // Limpa a lista de marcadores

      const tenantLocation = await geocodeAddress(tenantAddress!);
      if (tenantLocation) {
        addMarker(tenantLocation, 0, '#FFC107', ''); // Marcador para a localização do inquilino (vermelho) sem numeral
      }

      orderedOrders.forEach((order, index) => {
        const color = index === orderedOrders.length - 1 ? '#FF8042 ' : '#28A745' ; // Último pedido em azul
        addMarker({ lat: order.lat, lng: order.lng }, index, color, String(index + 1));
      });
    };

    if (map && tenantAddress) {
      addMarkersToMap();
    }

    return () => {
      markers.current.forEach(marker => marker.remove()); // Remove todos os marcadores do mapa
      markers.current = []; // Limpa a lista de marcadores
    };
  }, [map, orderedOrders, tenantAddress]);

  const moveOrder = (dragIndex: number, hoverIndex: number) => {
    const draggedOrder = orderedOrders[dragIndex];
    const updatedOrders = update(orderedOrders, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, draggedOrder],
      ],
    });
    setOrderedOrders(updatedOrders);
    calculateRouteService(tenantAddress!, updatedOrders, false, map, setDistance, setDuration, setOrderedOrders);
  };

  const removeOrder = (index: number) => {
    const updatedOrders = orderedOrders.filter((_, i) => i !== index);
    setOrderedOrders(updatedOrders);
    calculateRouteService(tenantAddress!, updatedOrders, false, map, setDistance, setDuration, setOrderedOrders);

    // Remove o marcador correspondente do mapa
    markers.current[index + 1]?.remove(); // index + 1 porque o primeiro marcador é o da localização do inquilino
    markers.current.splice(index + 1, 1); // Remove o marcador da lista de marcadores
  };

  const invertOrder = () => {
    const reversedOrders = [...orderedOrders].reverse();
    setOrderedOrders(reversedOrders);
    calculateRouteService(tenantAddress!, reversedOrders, false, map, setDistance, setDuration, setOrderedOrders);
  };

  const optimizeOrders = async () => {
    if (!tenantAddress || orderedOrders.length === 0) return;
  
    const tenantLocation = await geocodeAddress(tenantAddress);
    if (!tenantLocation) return;
  
    // Função para calcular a distância euclidiana entre dois pontos
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      return Math.sqrt(dx * dx + dy * dy);
    };
  
    // Função para encontrar a ordem mais próxima
    const findNearestOrder = (currentLocation: { lat: number; lng: number }, remainingOrders: Order[]) => {
      let nearestOrderIndex = -1;
      let nearestDistance = Infinity;
  
      remainingOrders.forEach((order, index) => {
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, order.lat, order.lng);
        if (distance < nearestDistance) {
          nearestOrderIndex = index;
          nearestDistance = distance;
        }
      });
  
      return nearestOrderIndex;
    };
  
    // Otimizar a rota globalmente
    const optimizeGlobalRoute = (orders: Order[], startLocation: { lat: number; lng: number }) => {
      const optimizedOrders: Order[] = [];
      let remainingOrders = [...orders];
      let currentLocation = startLocation;
  
      while (remainingOrders.length > 0) {
        const nearestOrderIndex = findNearestOrder(currentLocation, remainingOrders);
        if (nearestOrderIndex !== -1) {
          const nearestOrder = remainingOrders[nearestOrderIndex];
          optimizedOrders.push(nearestOrder);
          currentLocation = { lat: nearestOrder.lat, lng: nearestOrder.lng };
          remainingOrders.splice(nearestOrderIndex, 1);
        }
      }
  
      return optimizedOrders;
    };
  
    // Dividir os pedidos em chunks de no máximo 11 pedidos (considerando o ponto inicial)
    const chunkArray = (arr: Order[], chunkSize: number) => {
      let index = 0;
      const arrayLength = arr.length;
      const tempArray: Order[][] = [];
  
      for (index = 0; index < arrayLength; index += chunkSize) {
        const chunk = arr.slice(index, index + chunkSize);
        tempArray.push(chunk);
      }
  
      return tempArray;
    };
  
    // Otimizar a rota globalmente
    const optimizedGlobalOrders = optimizeGlobalRoute(orderedOrders, tenantLocation);
  
    // Atualizar a lista de pedidos ordenados
    setOrderedOrders(optimizedGlobalOrders);
  
    // Dividir a rota otimizada em chunks de 11 pedidos + 1 ponto inicial
    const orderChunks = chunkArray(optimizedGlobalOrders, 11);
    let combinedOptimizedOrders: Order[] = [];
  
    // Recalcular a rota para cada chunk
    for (let i = 0; i < orderChunks.length; i++) {
      const chunk = orderChunks[i];
      const optimizedOrdersChunk: Order[] = [];
      let remainingOrders = [...chunk];
      let currentLocation = i === 0 ? tenantLocation : {
        lat: combinedOptimizedOrders[combinedOptimizedOrders.length - 1].lat,
        lng: combinedOptimizedOrders[combinedOptimizedOrders.length - 1].lng
      };
  
      while (remainingOrders.length > 0) {
        const nearestOrderIndex = findNearestOrder(currentLocation, remainingOrders);
        if (nearestOrderIndex !== -1) {
          const nearestOrder = remainingOrders[nearestOrderIndex];
          optimizedOrdersChunk.push(nearestOrder);
          currentLocation = { lat: nearestOrder.lat, lng: nearestOrder.lng };
          remainingOrders.splice(nearestOrderIndex, 1);
        }
      }
  
      combinedOptimizedOrders = [...combinedOptimizedOrders, ...optimizedOrdersChunk];
    }
  
    // Atualizar a lista de pedidos ordenados
    setOrderedOrders(combinedOptimizedOrders);
  
    // Recalcular a rota com base nos pedidos otimizados
    calculateRouteService(tenantAddress, combinedOptimizedOrders, true, map, setDistance, setDuration, setOrderedOrders);
  };
  
  
  
  

  const handleGenerateRoute = async () => {
    const token = localStorage.getItem('token')!;
    const ordersInDirection = orderedOrders.map((order, index) => ({
      id: order.id,
      cliente: order.cliente,
      numero: order.numero,
      sorting: index + 1, // Adiciona a ordem dos pedidos
    }));
    const { totalWeight, totalValue } = calculateTotalWeightAndValue(orderedOrders);

    const deliveryData = {
      motoristaId: selectedDriver,
      veiculoId: selectedVehicle,
      valorFrete: freightValue,
      totalPeso: totalWeight,
      totalValor: totalValue,
      tenantId: tenantId,
      orders: ordersInDirection,
    };

    try {
      const createdDelivery = await addDelivery(token, deliveryData);
      if (createdDelivery.status === 'A liberar') {
        alert('O roteiro foi enviado para liberação do gestor. Caso deseje adicionar mais pedidos posteriormente, exclua o roteiro.');
      } else {
        alert('Roteiro gerado com sucesso!');
      }
      onGenerateRoute(orderedOrders);
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
      //  console.error('Failed to create delivery:', error.message);
        alert(`Erro: ${error.message}`);
      } else {
      //  console.error('Failed to create delivery:', error);
        alert('Erro: Falha ao criar roteiro.');
      }
    }
  };

  const handleDriverChange = (event: SelectChangeEvent<string>) => {
    const driverId = event.target.value;
    setSelectedDriver(driverId);
  
    const driverVehicles = vehicles.filter(vehicle => vehicle.driverId === driverId);
    if (driverVehicles.length > 0) {
      const vehicle = driverVehicles[0];
      setSelectedVehicle(vehicle.id);
      setFreightValue(calculateFreightValue(orderedOrders, categories, directions, vehicle.categoryId));
    }
  };
  
  const handleVehicleChange = (event: SelectChangeEvent<string>) => {
    const vehicleId = event.target.value;
    setSelectedVehicle(vehicleId);
  
    const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicle) {
      setFreightValue(calculateFreightValue(orderedOrders, categories, directions, vehicle.categoryId));
    }
  };
  
  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
  };

  return {
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
    calculateRoute: calculateRouteService,
    optimizeOrders,
    setDistance,
    setDuration,
    setOrderedOrders,
  };
};

function calculateTotalWeightAndValue(ordersInDirection: Order[]): { totalWeight: number; totalValue: number; } {
  return ordersInDirection.reduce((acc, order) => {
    acc.totalWeight += order.peso;
    acc.totalValue += order.valor;
    return acc;
  }, { totalWeight: 0, totalValue: 0 });
}

function calculateFreightValue(orders: Order[], categories: Category[], directions: Direction[], selectedCategoryId: string): number {
  let maxDirectionValue = 0;

  // Encontrar o maior valor de direção aplicável aos pedidos
  orders.forEach(order => {
    directions.forEach(direction => {
      if (order.cep >= direction.rangeInicio && order.cep <= direction.rangeFim) {
        if (direction.valorDirecao > maxDirectionValue) {
          maxDirectionValue = direction.valorDirecao;
        }
      }
    });
  });

  // Encontrar o valor da categoria do veículo selecionado
  const category = categories.find(category => category.id === selectedCategoryId);
  const categoryValue = category ? category.valor : 0;

  // Somar o maior valor de direção e o valor da categoria
  return maxDirectionValue + categoryValue;
}
