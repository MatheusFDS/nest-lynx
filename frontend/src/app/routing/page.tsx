'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
import CreateRouteTable from '../components/select-routings/sub-routing/CreateRouteSection';
import { fetchTenantData } from '../../services/auxiliaryService'; // Importar a função de serviço
import SkeletonLoader from '../components/SkeletonLoader'; // Importar o SkeletonLoader
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

interface SelectedOrders {
  [key: string]: Order[];
  noRegion: Order[];
}

const RoutingPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [expandedOrdersDialogOpen, setExpandedOrdersDialogOpen] = useState<boolean>(false);
  const [currentDirectionId, setCurrentDirectionId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [ordersForMap, setOrdersForMap] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState<string>('');
  const [useTableLayout, setUseTableLayout] = useState<boolean>(() => {
    const savedLayout = localStorage.getItem('useTableLayout');
    return savedLayout ? JSON.parse(savedLayout) : false;
  });

  const { isDarkMode } = useTheme();
  const { settings } = useUserSettings();
  const token = localStorage.getItem('token') || '';
  const { orders, directions, drivers, vehicles, categories, tenantData, error, updateOrdersState } = useRoutingData(token);
  const [selectedOrders, setSelectedOrders] = useState<SelectedOrders>({ noRegion: [] });

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  // Função para carregar os dados do Tenant
  const fetchTenant = useCallback(async () => {
    if (token) {
      setLoading(true);
      try {
        const tenants = await fetchTenantData(token);
        if (tenants && tenants.length > 0) {
          setTenantId(tenants[0].id);
          showMessage('Dados do Tenant carregados com sucesso.', 'success'); // Mensagem de sucesso
        } else {
          showMessage('Nenhum Tenant encontrado.', 'warning'); // Mensagem de aviso
        }
      } catch (error: unknown) {
        console.error('Failed to fetch tenant data:', error);
        showMessage('Falha ao carregar dados do Tenant.', 'error'); // Mensagem de erro
      } finally {
        setLoading(false);
      }
    }
  }, [token, setLoading, showMessage]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  // Função para organizar pedidos por direção
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

  // Função para transferir pedidos entre direções
  const handleOrderTransfer = (orderId: string, fromDirectionId: string | 'noRegion', toDirectionId: string | 'noRegion') => {
    setSelectedOrders(prevState => {
      const fromOrders = prevState[fromDirectionId].filter(order => order.id !== orderId);
      const orderToMove = orders.find(order => order.id === orderId);
      if (!orderToMove) {
        showMessage('Pedido não encontrado.', 'error'); // Mensagem de erro
        return prevState;
      }
      const toOrders = [...prevState[toDirectionId], orderToMove];
      showMessage('Pedido transferido com sucesso.', 'success'); // Mensagem de sucesso
      return { ...prevState, [fromDirectionId]: fromOrders, [toDirectionId]: toOrders };
    });
  };

  // Funções para abrir e fechar diálogos de detalhes
  const handleDetailsDialogOpen = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  // Funções para abrir e fechar diálogos de pedidos expandidos
  const handleExpandedOrdersDialogOpen = (directionId: string | null) => {
    setCurrentDirectionId(directionId);
    setExpandedOrdersDialogOpen(true);
  };

  const handleExpandedOrdersDialogClose = () => {
    setExpandedOrdersDialogOpen(false);
    setCurrentDirectionId(null);
  };

  // Função para lidar com o fim do arrastar e soltar
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const fromDirectionId = source.droppableId === 'no-region' ? 'noRegion' : source.droppableId;
    const toDirectionId = destination.droppableId === 'no-region' ? 'noRegion' : destination.droppableId;

    if (fromDirectionId !== toDirectionId) {
      handleOrderTransfer(result.draggableId, fromDirectionId, toDirectionId);
    }
  };

  // Função para exibir o mapa a partir da tabela
  const handleShowMapFromTable = (selectedOrders: Order[]) => {
    const validOrders = selectedOrders.filter(order => order.lat !== undefined && order.lng !== undefined);
    setOrdersForMap(validOrders);
    setShowMap(true);
    showMessage('Mapa exibido com sucesso.', 'info'); // Mensagem informativa
  };

  // Função para exibir o mapa a partir de uma seção específica
  const handleShowMapFromSection = (directionId: string | null) => {
    if (directionId !== null) {
      const validOrders = selectedOrders[directionId].filter(order => order.lat !== undefined && order.lng !== undefined);
      setOrdersForMap(validOrders);
      setCurrentDirectionId(directionId);
      setShowMap(true);
      showMessage('Mapa exibido com sucesso.', 'info'); // Mensagem informativa
    }
  };

  // Função para gerar a rota a partir do mapa
  const handleGenerateRouteFromMap = (orderedOrders: Order[]) => {
    if (currentDirectionId) {
      setSelectedOrders(prevState => ({ ...prevState, [currentDirectionId]: orderedOrders }));
      setShowMap(false);
      updateOrdersState();
      handleClearCart();
      showMessage('Rota gerada com sucesso!', 'success'); // Mensagem de sucesso
    } else {
      showMessage('Direção atual não encontrada.', 'error'); // Mensagem de erro
    }
  };

  // Função para fechar o mapa
  const handleCloseMap = () => {
    setShowMap(false);
    updateOrdersState();
    handleClearCart();
    showMessage('Mapa fechado.', 'info'); // Mensagem informativa
  };

  // Função para limpar o carrinho de pedidos
  const handleClearCart = () => {
    setSelectedOrders({ noRegion: [] });
    showMessage('Carrinho de pedidos limpo.', 'info'); // Mensagem informativa
  };

  // Função para alternar o layout entre tabela e arrastar e soltar
  const toggleLayout = () => {
    setUseTableLayout(prev => {
      const newLayout = !prev;
      localStorage.setItem('useTableLayout', JSON.stringify(newLayout));
      showMessage(`Layout alterado para ${newLayout ? 'Tabela' : 'Arrastar e Soltar'}.`, 'info'); // Mensagem informativa
      return newLayout;
    });
  };

  // Função para lidar com a mudança de status no FilterBar
  const handleStatusFilterChange = (status: string) => {
    // Supondo que você tenha uma função para carregar as entregas filtradas
    // loadDeliveries(); // Descomente e implemente conforme necessário
    showMessage(`Filtro de status alterado para "${status}".`, 'info'); // Mensagem informativa
  };

  return (
    <Container style={{ marginTop: '24px' }}>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Exibição de mensagens de erro, se houver */}
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
        </>
      )}
    </Container>
  );
};

export default withAuth(RoutingPage);
