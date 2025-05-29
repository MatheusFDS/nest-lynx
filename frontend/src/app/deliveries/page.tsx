// src/app/deliveries/page.tsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container, Typography, Paper, Grid, TextField, Button, Chip, IconButton, Tooltip, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
  CircularProgress,
  TableContainer, // Para a tabela dentro do Modal
  Table,          // Para a tabela dentro do Modal
  TableCell,      // Para a tabela dentro do Modal
  TableHead,      // Para a tabela dentro do Modal
  TableRow,       // Para a tabela dentro do Modal
  TableBody,      // Para a tabela dentro do Modal
  Card,
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

// Seus imports de serviço, tipos, etc.
import { fetchDeliveries } from '../../services/deliveryService'; // Ajuste o caminho
import { Delivery, Approval, Order as AppOrder, Driver, Vehicle, Category } from '../../types';
import { useLoading } from '../context/LoadingContext'; // Ajuste o caminho
import { useMessage } from '../context/MessageContext'; // Ajuste o caminho
import { getStoredToken } from '../../services/authService'; // Ajuste o caminho
import withAuth from '../hoc/withAuth'; // Ajuste o caminho
import Link from 'next/link';

// Componentes Estilizados
const StyledButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  marginRight: theme.spacing(1),
}));

const DeliveriesPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  const loadDeliveries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchDeliveries(token);
      const validData = Array.isArray(data) ? data.filter(item => item != null) : [];
      setDeliveries(validData);
    } catch (error) {
      handleApiError(error, 'Falha ao buscar roteiros.');
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, handleApiError]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) {
        setToken(t);
    } else {
        showMessage('Token não encontrado. Faça login novamente.', 'error');
    }
  }, [showMessage]);

  useEffect(() => {
    if (token) {
      loadDeliveries();
    }
  }, [token, loadDeliveries]);

  const handleViewDetails = (delivery: Delivery | undefined) => {
    if (delivery) {
      setSelectedDelivery(delivery);
      setDetailModalOpen(true);
    } else {
      console.warn("Tentativa de ver detalhes de um roteiro indefinido.");
    }
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDelivery(null);
  };

  const columns: GridColDef<Delivery>[] = [
    {
      field: 'id',
      headerName: 'ID Rota',
      width: 130,
      // CORRIGIDO: Assinatura do valueGetter alterada
      valueGetter: (_value: any, row: Delivery | undefined) => row?.id ? row.id.substring(0, 8) + '...' : '',
    },
    {
      field: 'driverName',
      headerName: 'Motorista',
      width: 200,
      // CORRIGIDO
      valueGetter: (_value: any, row: Delivery | undefined) => row?.Driver?.name || 'N/A',
    },
    {
      field: 'vehicleInfo',
      headerName: 'Veículo',
      width: 180,
      // CORRIGIDO
      valueGetter: (_value: any, row: Delivery | undefined) => row?.Vehicle ? `${row.Vehicle.model} - ${row.Vehicle.plate}` : 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<Delivery>) => (
        <Chip
          label={params.row?.status || 'Desconhecido'}
          size="small"
          color={
            params.row?.status === 'A liberar' ? 'warning' :
            params.row?.status === 'Pendente' ? 'default' :
            params.row?.status === 'Em Andamento' || params.row?.status === 'Em rota' ? 'info' :
            params.row?.status === 'Finalizado' ? 'success' :
            params.row?.status === 'Cancelado' ? 'error' : 'default'
          }
        />
      ),
    },
    {
      field: 'orderCount',
      headerName: 'Nº Pedidos',
      type: 'number',
      width: 110,
      // CORRIGIDO
      valueGetter: (_value: any, row: Delivery | undefined) => row?.orders?.length || 0,
    },
    {
      field: 'dataInicio', // Linha que estava dando erro
      headerName: 'Data Criação',
      width: 170,
      type: 'dateTime',
      // CORRIGIDO
      valueGetter: (_value: any, row: Delivery | undefined) => row?.dataInicio ? new Date(row.dataInicio) : null,
      renderCell: (params: GridRenderCellParams<Delivery, Date | null>) =>
        params.value ? new Date(params.value).toLocaleString('pt-BR') : 'N/A'
    },
    {
        field: 'totalValor',
        headerName: 'Valor Pedidos (R$)',
        type: 'number',
        width: 150,
        // CORRIGIDO
        valueGetter: (_value: any, row: Delivery | undefined) => row?.totalValor || 0,
        renderCell: (params: GridRenderCellParams<Delivery, number>) =>
         `R$ ${Number(params.value || 0).toFixed(2)}`
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Delivery>) => (
        <Tooltip title="Ver Detalhes">
          <IconButton onClick={() => handleViewDetails(params.row)} disabled={!params.row}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{mt: 2, mb: 2}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
        <Typography variant="h4" component="h1">Gestão de Roteiros</Typography>
        <Box>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDeliveries} sx={{mr:1}} disabled={isLoading}>
                {isLoading ? <CircularProgress size={20}/> : "Atualizar"}
            </Button>
            <Link href="/routing" passHref>
                <StyledButton variant="contained" startIcon={<AddCircleOutlineIcon />}>Novo Roteiro</StyledButton>
            </Link>
        </Box>
      </Box>

      <Paper sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={deliveries}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
                sortModel: [{ field: 'dataInicio', sort: 'desc' }],
            },
          }}
          density="compact"
          slots={{
            loadingOverlay: () => <Box sx={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><CircularProgress /></Box>,
            noRowsOverlay: () => <Box sx={{p:2, textAlign:'center'}}>Nenhum roteiro encontrado.</Box>
          }}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      {selectedDelivery && (
        <Dialog open={detailModalOpen} onClose={handleCloseDetailModal} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Detalhes do Roteiro: {selectedDelivery?.id ? selectedDelivery.id.substring(0, 8) : 'N/A'}
                <IconButton aria-label="close" onClick={handleCloseDetailModal}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Motorista</Typography>
                        <Typography>Nome: {selectedDelivery.Driver?.name || 'N/A'}</Typography>
                        <Typography variant="caption" display="block">CNH: {selectedDelivery.Driver?.license || 'N/A'}</Typography>
                        <Typography variant="caption" display="block">CPF: {selectedDelivery.Driver?.cpf || 'N/A'}</Typography>

                        <Typography variant="h6" sx={{mt:2}} gutterBottom>Veículo</Typography>
                        <Typography>Modelo: {selectedDelivery.Vehicle?.model || 'N/A'}</Typography>
                        <Typography>Placa: {selectedDelivery.Vehicle?.plate || 'N/A'}</Typography>
                        <Typography variant="caption" display="block">
                            Categoria: {selectedDelivery.Vehicle?.Category?.name || 'N/A'}
                            {selectedDelivery.Vehicle?.Category?.valor ? ` (Valor: R$ ${Number(selectedDelivery.Vehicle.Category.valor).toFixed(2)})` : ''}
                        </Typography>

                        <Typography variant="h6" sx={{mt:2}} gutterBottom>Informações Gerais do Roteiro</Typography>
                        <List dense disablePadding>
                            <ListItem><ListItemText primary="Status:" secondary={selectedDelivery.status} /></ListItem>
                            <ListItem><ListItemText primary="Data de Início:" secondary={selectedDelivery.dataInicio ? new Date(selectedDelivery.dataInicio).toLocaleString('pt-BR') : 'N/A'} /></ListItem>
                            <ListItem><ListItemText primary="Data de Fim:" secondary={selectedDelivery.dataFim ? new Date(selectedDelivery.dataFim).toLocaleString('pt-BR') : 'N/A'} /></ListItem>
                            <ListItem><ListItemText primary="Data de Liberação:" secondary={selectedDelivery.dataLiberacao ? new Date(selectedDelivery.dataLiberacao).toLocaleString('pt-BR') : 'N/A'} /></ListItem>
                            <ListItem><ListItemText primary="Valor do Frete (Motorista):" secondaryTypographyProps={{fontWeight:'bold', color:'primary.main'}} secondary={`R$ ${Number(selectedDelivery.valorFrete || 0).toFixed(2)}`} /></ListItem>
                            <ListItem><ListItemText primary="Peso Total Carga:" secondary={`${Number(selectedDelivery.totalPeso || 0).toFixed(2)} Kg`} /></ListItem>
                            <ListItem><ListItemText primary="Valor Total Mercadoria:" secondary={`R$ ${Number(selectedDelivery.totalValor || 0).toFixed(2)}`} /></ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Pedidos no Roteiro ({selectedDelivery.orders?.length || 0})</Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300, mb:2, border: '1px solid #eee' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight:'bold'}}>Seq.</TableCell>
                                        <TableCell sx={{fontWeight:'bold'}}>Número</TableCell>
                                        <TableCell sx={{fontWeight:'bold'}}>Cliente</TableCell>
                                        <TableCell sx={{fontWeight:'bold'}}>Endereço</TableCell>
                                        <TableCell sx={{fontWeight:'bold'}}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {selectedDelivery.orders?.sort((a,b) => (a.sorting || 0) - (b.sorting || 0)).map((order, index) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>{order.sorting || index + 1}</TableCell>
                                        <TableCell>{order.numero}</TableCell>
                                        <TableCell>{order.cliente}</TableCell>
                                        <TableCell>{order.endereco}, {order.cidade}</TableCell>
                                        <TableCell><Chip label={order.status} size="small" /></TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" sx={{mt:1}} gutterBottom>Histórico de Liberações</Typography>
                        {selectedDelivery.liberacoes && selectedDelivery.liberacoes.length > 0 ? (
                            <List dense sx={{maxHeight: 150, overflow: 'auto',  border: '1px solid #eee', borderRadius:1, p:1}}>
                                {selectedDelivery.liberacoes.map(lib => (
                                    <ListItem key={lib.id} divider sx={{ '&:last-child': { borderBottom: 0 }}}>
                                        <ListItemText
                                            primaryTypographyProps={{variant:'body2', color: lib.action === 'approved' ? 'success.main' : 'error.main'}}
                                            secondaryTypographyProps={{variant:'caption'}}
                                            primary={`${lib.action === 'approved' ? 'APROVADO' : 'REJEITADO'} por ${lib.User?.name || 'Usuário desconhecido'}`}
                                            secondary={`Em: ${new Date(lib.createdAt).toLocaleString('pt-BR')} ${lib.motivo ? ` - Motivo: ${lib.motivo}` : ''}`} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : <Typography variant="body2" color="textSecondary">Nenhuma liberação/rejeição registrada.</Typography>}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDetailModal}>Fechar</Button>
            </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default withAuth(DeliveriesPage);