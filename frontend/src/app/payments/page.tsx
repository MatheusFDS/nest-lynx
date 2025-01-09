'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Container,
  Grid,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Payment, Delivery, Direction } from '../../types';
import withAuth from '../hoc/withAuth';
import {
  fetchPayments,
  updatePaymentStatus,
  groupPayments,
  ungroupPayments,
  fetchDeliveryDetails,
} from '../../services/paymentService';
import { fetchDirections } from '../../services/auxiliaryService';
import PaymentsTable from '../components/payments/PaymentsTable';
import PaymentDetailsDialog from '../components/payments/PaymentDetailsDialog';
import generateSummaryReport from '../components/payments/generateSummaryReport';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens
import { Height } from '@mui/icons-material';

const StyledButton = styled(Button)({
  margin: '8px 0',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const PaymentsPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens

  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [grouped, setGrouped] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(true);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState<Delivery[]>([]);

  const token = localStorage.getItem('token') || '';

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, directionsData] = await Promise.all([
        fetchPayments(token),
        fetchDirections(token),
      ]);
      setPayments(paymentsData);
      filterPayments(searchTerm, startDate, endDate, grouped, paid, pending, paymentsData);
      setDirections(directionsData);
     // showMessage('Pagamentos carregados com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao buscar pagamentos:', error);
      showMessage('Falha ao buscar pagamentos.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, startDate, endDate, grouped, paid, pending, showMessage, setLoading]);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterPayments(term, startDate, endDate, grouped, paid, pending, payments);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
      filterPayments(searchTerm, value, endDate, grouped, paid, pending, payments);
    } else {
      setEndDate(value);
      filterPayments(searchTerm, startDate, value, grouped, paid, pending, payments);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'grouped') {
      setGrouped(checked);
      filterPayments(searchTerm, startDate, endDate, checked, paid, pending, payments);
    } else if (name === 'paid') {
      setPaid(checked);
      filterPayments(searchTerm, startDate, endDate, grouped, checked, pending, payments);
    } else if (name === 'pending') {
      setPending(checked);
      filterPayments(searchTerm, startDate, endDate, grouped, paid, checked, payments);
    }
  };

  const filterPayments = (
    searchTerm: string,
    startDate: string,
    endDate: string,
    grouped: boolean,
    paid: boolean,
    pending: boolean,
    paymentsData: Payment[]
  ) => {
    let filtered = paymentsData;

    if (searchTerm) {
      filtered = filtered.filter((payment) =>
        Object.values(payment).some((value) =>
          value
            ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            : false
        )
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
      });
    }

    if (grouped || paid || pending) {
      filtered = filtered.filter((payment) => {
        return (
          (grouped && payment.isGroup === true) ||
          (paid && payment.status === 'Baixado') ||
          (pending && payment.status === 'Pendente')
        );
      });
    } else {
      filtered = [];
    }

    setFilteredPayments(filtered);
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayments((prevSelected) =>
      prevSelected.includes(paymentId)
        ? prevSelected.filter((id) => id !== paymentId)
        : [...prevSelected, paymentId]
    );
  };

  const handleGroupPayments = async () => {
    if (selectedPayments.length === 0) {
      showMessage('Nenhum pagamento selecionado para agrupar.', 'warning'); // Mensagem de aviso
      return;
    }

    try {
      await groupPayments(token, selectedPayments);
      showMessage('Pagamentos agrupados com sucesso!', 'success'); // Mensagem de sucesso
      loadPayments();
      setSelectedPayments([]);
    } catch (error: unknown) {
      console.error('Erro ao agrupar pagamentos:', error);
      showMessage('Falha ao agrupar pagamentos.', 'error'); // Mensagem de erro
    }
  };

  const handleUngroupPayments = async (paymentId: string) => {
    try {
      await ungroupPayments(token, paymentId);
      showMessage('Pagamento desagrupado com sucesso!', 'success'); // Mensagem de sucesso
      loadPayments();
    } catch (error: unknown) {
      console.error('Erro ao desagrupar pagamento:', error);
      showMessage('Falha ao desagrupar pagamento.', 'error'); // Mensagem de erro
    }
  };

  const handlePaymentStatusChange = async (paymentId: string, status: string) => {
    try {
      await updatePaymentStatus(token, paymentId, status);
      showMessage('Status do pagamento atualizado com sucesso!', 'success'); // Mensagem de sucesso
      loadPayments();
    } catch (error: unknown) {
      console.error(`Erro ao atualizar status do pagamento:`, error);
      showMessage('Falha ao atualizar status do pagamento.', 'error'); // Mensagem de erro
    }
  };

  const handleViewDetails = async (deliveryIds: string[]) => {
    try {
      const detailsPromises = deliveryIds.map((id) => fetchDeliveryDetails(token, id));
      const details = await Promise.all(detailsPromises);
      setSelectedDeliveries(details);
      setDetailsOpen(true);
      showMessage('Detalhes dos pagamentos carregados com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao buscar detalhes das entregas:', error);
      showMessage('Falha ao buscar detalhes das entregas.', 'error'); // Mensagem de erro
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedDeliveries([]);
  };

  return (
    <Container>
      {/* Campo de Busca */}
      <Grid container spacing={2} style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Grid item xs={12}>
          <TextField
            label="Buscar"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            placeholder="Pesquisar por qualquer campo"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Início"
            type="datetime-local"
            fullWidth
            value={startDate}
            onChange={handleDateChange}
            name="startDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Fim"
            type="datetime-local"
            fullWidth
            value={endDate}
            onChange={handleDateChange}
            name="endDate"
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={grouped}
                onChange={handleStatusFilterChange}
                name="grouped"
              />
            }
            label="Agrupamentos"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={paid}
                onChange={handleStatusFilterChange}
                name="paid"
              />
            }
            label="Baixados"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={pending}
                onChange={handleStatusFilterChange}
                name="pending"
              />
            }
            label="Pendentes"
          />
          <Badge badgeContent={filteredPayments.length} color="primary" showZero style={{ marginLeft: '16px' }} />
        </Grid>
      </Grid>

      {isLoading ? (
        <SkeletonLoader />
      ) : filteredPayments.length > 0 ? (
        <Grid style={{ width: '100%' }}>
          {/* Botões de Agrupamento e Relatório */}
          <Grid container spacing={2} style={{ marginBottom: '16px' }}>
            <Grid item xs={12} sm={6}>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleGroupPayments}
                disabled={
                  selectedPayments.length === 0 ||
                  selectedPayments.some(
                    (id) => payments.find((payment) => payment.id === id)?.isGroup === true
                  )
                }
              >
                Agrupar Selecionados
              </StyledButton>
            </Grid>
            <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => generateSummaryReport(filteredPayments, startDate, endDate)}
              >
                Gerar Relatório Totalizador
              </StyledButton>
            </Grid>
          </Grid>

          {/* Tabela de Pagamentos */}
          <Paper elevation={3}>
            <PaymentsTable
              payments={filteredPayments}
              selectedPayments={selectedPayments}
              handlePaymentSelect={handlePaymentSelect}
              handleViewDetails={handleViewDetails}
              handlePaymentStatusChange={handlePaymentStatusChange}
              handleUngroupPayments={handleUngroupPayments}
            />
          </Paper>
        </Grid>
      ) : (
        <Paper elevation={3}>
        <Typography align="center" style={{ padding: '16px' }}>
          Nenhum pagamento encontrado. Use os filtros para buscar pagamentos.
        </Typography>
        </Paper>

      )}
  
      {/* Diálogo de Detalhes dos Pagamentos */}
      <PaymentDetailsDialog
        open={detailsOpen}
        deliveries={selectedDeliveries}
        onClose={handleDetailsClose}
      />

      {/* Diálogo de Erro */}
      <Dialog open={false} onClose={() => {}}>
        {/* Este diálogo foi removido, pois usamos showMessage para feedback */}
      </Dialog>
    </Container>
  );
};

export default withAuth(PaymentsPage);
