'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delivery } from '../../types';
import withAuth from '../hoc/withAuth';
import RealeseTable from '../components/realese/RealeseTable';
import ReleaseDialog from '../components/realese/ReleaseDialog';
import RejectDialog from '../components/realese/RejectDialog';
import DetailsDialog from '../components/realese/DetailsDialog';
import FilterBar from '../components/realese/FilterBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens
import { fetchDeliveries, rejectRelease, releaseDelivery } from '@/services/deliveryService';

// Estilização personalizada para o botão
const StyledButton = styled(Button)({
  margin: '8px 0',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const ReleasePage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });
  const [rejectReason, setRejectReason] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('A liberar');

  const token = localStorage.getItem('token') || '';

  // Função para carregar as entregas filtradas por status
  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const deliveriesData = await fetchDeliveries(token);
      const filteredByStatus = deliveriesData.filter(
        (delivery: Delivery) => delivery.status === statusFilter
      );
      setDeliveries(filteredByStatus);
      //showMessage('Entregas carregadas com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao carregar entregas:', error);
      showMessage('Falha ao carregar entregas.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, showMessage, setLoading]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Funções para abrir os diálogos de liberação, rejeição e detalhes
  const handleReleaseDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReleaseDialogOpen(true);
  };

  const handleRejectDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setRejectDialogOpen(true);
  };

  const handleDetailsDialogOpen = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  // Função para fechar todos os diálogos
  const handleDialogClose = () => {
    setReleaseDialogOpen(false);
    setRejectDialogOpen(false);
    setDetailsDialogOpen(false);
    setSelectedDelivery(null);
    setRejectReason('');
  };

  // Função para liberar uma entrega
  const handleRelease = async () => {
    if (!selectedDelivery) return;

    try {
      setLoading(true);
      await releaseDelivery(token, selectedDelivery.id);
      showMessage('Entrega liberada com sucesso!', 'success'); // Mensagem de sucesso
      handleDialogClose();
      loadDeliveries();
    } catch (error: unknown) {
      console.error('Erro ao liberar entrega:', error);
      showMessage('Falha ao liberar entrega.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para rejeitar uma entrega
  const handleReject = async () => {
    if (!selectedDelivery || !rejectReason) {
      showMessage('Por favor, forneça uma razão para rejeitar a entrega.', 'warning'); // Mensagem de aviso
      return;
    }

    try {
      setLoading(true);
      await rejectRelease(token, selectedDelivery.id, rejectReason);
      showMessage('Entrega rejeitada com sucesso!', 'success'); // Mensagem de sucesso
      handleDialogClose();
      loadDeliveries();
    } catch (error: unknown) {
      console.error('Erro ao rejeitar entrega:', error);
      showMessage('Falha ao rejeitar entrega.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a busca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterDeliveries(term, dateRange.startDate, dateRange.endDate, statusFilter, deliveries);
  };

  // Função para lidar com a filtragem por data
  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prevState) => ({ ...prevState, [name]: value }));
    filterDeliveries(
      searchTerm,
      name === 'startDate' ? value : dateRange.startDate,
      name === 'endDate' ? value : dateRange.endDate,
      statusFilter,
      deliveries
    );
  };

  // Função para lidar com a filtragem por status
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    loadDeliveries();
  };

  // Função para filtrar as entregas com base nos critérios
  const filterDeliveries = (
    searchTerm: string,
    startDate: string,
    endDate: string,
    status: string,
    deliveriesData: Delivery[]
  ) => {
    let filtered = deliveriesData;

    if (searchTerm) {
      filtered = filtered.filter((delivery) =>
        Object.values(delivery).some((value) =>
          value ? value.toString().toLowerCase().includes(searchTerm) : false
        ) ||
        delivery.orders.some((order) =>
          Object.values(order).some((value) =>
            value ? value.toString().toLowerCase().includes(searchTerm) : false
          )
        )
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((delivery) => {
        const deliveryDate = new Date(delivery.dataInicio);
        return deliveryDate >= new Date(startDate) && deliveryDate <= new Date(endDate);
      });
    }

    setDeliveries(filtered);
  };

  return (
    <Container style={{ marginTop: '24px' }}>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Exibição de Mensagens de Sucesso e Erro (usando showMessage) */}
          {/* Não é necessário exibir mensagens diretamente no JSX, pois showMessage já trata isso */}

          {/* Barra de Filtros */}
          <FilterBar
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            dateRange={dateRange}
            handleDateFilter={handleDateFilter}
            setStatusFilter={handleStatusFilterChange} // Passando função que aceita string
          />

          {/* Tabela de Entregas */}
          <RealeseTable
            deliveries={deliveries}
            handleDetailsDialogOpen={handleDetailsDialogOpen}
            handleReleaseDialogOpen={handleReleaseDialogOpen}
            handleRejectDialogOpen={handleRejectDialogOpen}
          />

          {/* Diálogos de Liberação, Rejeição e Detalhes */}
          {selectedDelivery && (
            <>
              <ReleaseDialog
                open={releaseDialogOpen}
                onClose={handleDialogClose}
                delivery={selectedDelivery}
                onRelease={handleRelease}
              />
              <RejectDialog
                open={rejectDialogOpen}
                onClose={handleDialogClose}
                delivery={selectedDelivery}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                onReject={handleReject}
              />
              <DetailsDialog
                open={detailsDialogOpen}
                onClose={handleDialogClose}
                delivery={selectedDelivery}
              />
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default withAuth(ReleasePage, { requiredRole: 'admin' });
