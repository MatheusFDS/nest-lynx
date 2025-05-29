// src/app/view-orders/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Container, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  CircularProgress, IconButton, Tooltip, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Chip,
  Menu, Checkbox as MuiCheckbox, ListItemIcon as MuiListItemIconRenamed, /* Renomeado para evitar conflito */
  ListItemText as MuiListItemTextRenamed /* Renomeado para evitar conflito */
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import HistoryIcon from '@mui/icons-material/History';

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

import withAuth from '../hoc/withAuth';
import { fetchOrders as fetchOrdersFromApi, fetchOrderHistory } from '../../services/orderService'; // Adicionado fetchOrderHistory
import { useLoading } from '../context/LoadingContext';
import { useMessage } from '../context/MessageContext';
import { Order } from '../../types';
import { getStoredToken } from '../../services/authService';

// Interface para o histórico do pedido
interface OrderHistoryEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  user?: string;
  details?: {
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    proofUrl?: string;
  };
}

// Configuração das colunas
interface ColumnConfig {
  id: keyof Order | 'deliveryDriverName' | 'actions';
  label: string;
  visibleDefault?: boolean;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  minWidth?: number | string;
  render?: (order: Order, pageInstance: ViewOrdersPageInstance) => React.ReactNode;
}

interface ViewOrdersPageInstance {
  handleViewDetails: (order: Order) => void;
}

const ORDER_STATUSES = ['Pendente', 'Em rota', 'Entrega Iniciada', 'Entrega Finalizada', 'Entrega Retornada', 'Cancelado'];

const ViewOrdersPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const [filterNumero, setFilterNumero] = useState<string>('');
  const [filterCliente, setFilterCliente] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { isLoading, setLoading } = useLoading();
  const { showMessage } = useMessage();

  const ALL_COLUMNS: ColumnConfig[] = useMemo(() => [
    { id: 'numero', label: 'Número', visibleDefault: true, minWidth: 110 },
    { id: 'cliente', label: 'Cliente', visibleDefault: true, minWidth: 200 },
    { id: 'data', label: 'Data Emissão', visibleDefault: true, minWidth: 120 },
    { id: 'status', label: 'Status', visibleDefault: true, minWidth: 150, render: (order) => (
      <Chip label={order.status} size="small" color={
          order.status === 'Pendente' ? 'warning' :
          order.status === 'Em rota' || order.status === 'Entrega Iniciada' ? 'info' :
          order.status === 'Entrega Finalizada' ? 'success' :
          order.status === 'Entrega Retornada' || order.status === 'Cancelado' ? 'error' : 'default'
      }/>
    )},
    { id: 'valor', label: 'Valor (R$)', visibleDefault: true, align: 'right', minWidth: 100, render: (order) => Number(order.valor || 0).toFixed(2) },
    { id: 'cidade', label: 'Cidade Dest.', visibleDefault: true, minWidth: 150 },
    { id: 'uf', label: 'UF', visibleDefault: false, minWidth: 60 },
    { id: 'cep', label: 'CEP Dest.', visibleDefault: false, minWidth: 100 },
    { id: 'endereco', label: 'Endereço Dest.', visibleDefault: false, minWidth: 250 },
    { id: 'bairro', label: 'Bairro Dest.', visibleDefault: false, minWidth: 150 },
    { id: 'peso', label: 'Peso (Kg)', visibleDefault: false, align: 'right', minWidth: 90, render: (order) => Number(order.peso || 0).toFixed(2) },
    { id: 'deliveryDriverName', label: 'Motorista Rota', visibleDefault: true, minWidth: 150, render: (order) => order.Delivery?.Driver?.name || (order.deliveryId ? 'Em rota' :'-') },
    { id: 'actions', label: 'Ações', visibleDefault: true, align: 'center', minWidth: 100, render: (order, instance) => (
      <Tooltip title="Ver Detalhes">
        <IconButton size="small" onClick={() => instance.handleViewDetails(order)}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )},
  ], []); // As dependências devem ser adicionadas se 'handleViewDetails' mudar de referência.

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.filter(col => col.visibleDefault).map(col => col.id as string)
  );
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleViewDetails = useCallback((order: Order) => {
    setViewingOrderDetails(order);
    setOrderHistory([]); 
  }, []);

  const pageInstance: ViewOrdersPageInstance = useMemo(() => ({
      handleViewDetails,
  }), [handleViewDetails]);


  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  useEffect(() => {
    const t = getStoredToken();
    if (t) setToken(t); else showMessage('Token não encontrado.', 'error');
  }, [showMessage]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const ordersData = await fetchOrdersFromApi(token);
      setAllOrders(ordersData || []);
      // showMessage(`Pedidos carregados: ${ordersData?.length || 0}`, 'success') // Pode ser verboso demais
    } catch (error) { handleApiError(error, "Falha ao carregar pedidos."); }
    finally { setLoading(false); }
  }, [token, setLoading, handleApiError]);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, loadOrders]);

  const filteredOrders = useMemo(() => {
    // ... (lógica de filtro como antes)
    return allOrders.filter(order => {
        const matchesNumero = filterNumero ? order.numero.toLowerCase().includes(filterNumero.toLowerCase()) : true;
        const matchesCliente = filterCliente ? order.cliente.toLowerCase().includes(filterCliente.toLowerCase()) : true;
        const matchesStatus = filterStatus ? order.status === filterStatus : true;
        let matchesDateRange = true;
        if (order.data) {
            try {
              const parts = order.data.split('/');
              const orderDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
              if (filterDataInicio && orderDateISO < filterDataInicio) matchesDateRange = false;
              if (filterDataFim && orderDateISO > filterDataFim) matchesDateRange = false;
            } catch (e) { console.warn("Data inválida no pedido:", order.data); }
        }
        return matchesNumero && matchesCliente && matchesStatus && matchesDateRange;
      });
  }, [allOrders, filterNumero, filterCliente, filterStatus, filterDataInicio, filterDataFim]);

  const ordersToDisplay = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseDetailsModal = () => {
    setViewingOrderDetails(null);
    setOrderHistory([]);
  };
  
  const handleClearFilters = () => {
    setFilterNumero(''); setFilterCliente(''); setFilterStatus('');
    setFilterDataInicio(''); setFilterDataFim(''); setPage(0);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    // ... (lógica de exportação como antes)
    if (filteredOrders.length === 0) {
        showMessage('Nenhum pedido para exportar com os filtros atuais.', 'info');
        return;
      }
      setLoading(true);
      try {
        const dataToExport = filteredOrders.map(order => ({
          'Número': order.numero, 'Cliente': order.cliente, 'Data': order.data,
          'Status': order.status, 'Valor_R$': Number(order.valor || 0).toFixed(2),
          'Peso_Kg': Number(order.peso || 0).toFixed(2), 'Cidade': order.cidade,
          'UF': order.uf, 'CEP': order.cep, 'Endereço': order.endereco,
          'Bairro': order.bairro, 'Telefone': order.telefone, 'Email': order.email,
          'Contato_Local': order.nomeContato, 'Instruções': order.instrucoesEntrega,
          'Motorista_Rota': order.Delivery?.Driver?.name || '', 'ID_Roteiro': order.deliveryId || '',
        }));
  
        if (format === 'csv') {
          const csv = Papa.unparse(dataToExport);
          const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob); link.download = 'pedidos.csv';
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
          showMessage('Exportado para CSV!', 'success');
        } else if (format === 'excel') {
          const worksheet = XLSX.utils.json_to_sheet(dataToExport);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
          XLSX.writeFile(workbook, 'pedidos.xlsx');
          showMessage('Exportado para Excel!', 'success');
        }
      } catch (error) { handleApiError(error, 'Falha ao exportar pedidos.');}
      finally { setLoading(false); }
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };
  const openColumnMenu = (event: React.MouseEvent<HTMLElement>) => setColumnMenuAnchorEl(event.currentTarget);
  const closeColumnMenu = () => setColumnMenuAnchorEl(null);

  const handleFetchOrderHistory = async (orderId: string | undefined) => {
    if (!token || !orderId) {
        showMessage("ID do pedido não encontrado para buscar histórico.", "warning");
        return;
    }
    setIsLoadingHistory(true);
    setOrderHistory([]);
    try {
      // ---- CHAMADA REAL À API (quando o backend estiver pronto) ----
      const historyData = await fetchOrderHistory(token, orderId); 
      setOrderHistory(historyData);
      if (historyData.length === 0) {
        showMessage("Nenhum histórico encontrado para este pedido.", "info");
      } else {
        showMessage(`Histórico carregado: ${historyData.length} eventos.`, "success");
      }
      // ---- FIM DA CHAMADA REAL ----

      // ---- DADOS MOCKADOS (REMOVER OU COMENTAR QUANDO A API ESTIVER PRONTA) ----
      // showMessage("Histórico: Usando dados de exemplo.", "info");
      // setTimeout(() => { 
      //   setOrderHistory([
      //     {id: '1', timestamp: new Date(Date.now() - 3*60*60*1000).toISOString(), eventType: "CRIAÇÃO", description: "Pedido importado via Excel.", user: "Admin User"},
      //     {id: '2', timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(), eventType: "ROTEIRIZAÇÃO", description: "Pedido selecionado para roteirização.", user: "Admin User"},
      //     {id: '3', timestamp: new Date(Date.now() - 1*60*60*1000).toISOString(), eventType: "ATRIBUIÇÃO_ROTEIRO", description: `Atribuído ao roteiro XYZ, motorista ${viewingOrderDetails?.Delivery?.Driver?.name || 'Desconhecido'}.`, user: "Sistema"},
      //     {id: '4', timestamp: new Date().toISOString(), eventType: "STATUS_ALTERADO", description: `Status alterado para: ${viewingOrderDetails?.status || 'N/A'}.`, user: viewingOrderDetails?.Delivery?.Driver?.name || "Sistema"},
      //   ]);
      //   setIsLoadingHistory(false);
      // }, 1000);
      // ---- FIM DOS DADOS MOCKADOS ----
    } catch (error) {
      handleApiError(error, "Falha ao buscar histórico do pedido.");
      setOrderHistory([]); // Garante que limpa em caso de erro
    } finally {
      setIsLoadingHistory(false); // Garante que o loading é desativado mesmo com erro
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Visualizar Pedidos
      </Typography>

      {/* Filtros */}
      <Paper elevation={3} sx={{ p: {xs: 1, sm: 2, md: 3}, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtros <FilterListIcon fontSize="small" sx={{verticalAlign: 'middle'}}/></Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}><TextField fullWidth label="Número Pedido" value={filterNumero} onChange={(e) => setFilterNumero(e.target.value)} variant="outlined" size="small"/></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Nome Cliente" value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)} variant="outlined" size="small"/></Grid>
          <Grid item xs={12} sm={6} md={2}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Status</InputLabel><Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}><MenuItem value=""><em>Todos</em></MenuItem>{ORDER_STATUSES.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} sm={6} md={2}><TextField fullWidth label="Data Início" type="date" value={filterDataInicio} onChange={(e) => setFilterDataInicio(e.target.value)} InputLabelProps={{ shrink: true }} variant="outlined" size="small"/></Grid>
          <Grid item xs={12} sm={6} md={2}><TextField fullWidth label="Data Fim" type="date" value={filterDataFim} onChange={(e) => setFilterDataFim(e.target.value)} InputLabelProps={{ shrink: true }} variant="outlined" size="small"/></Grid>
          <Grid item xs={12} sm={6} md={1}><Button variant="outlined" onClick={handleClearFilters} size="medium" fullWidth>Limpar</Button></Grid>
        </Grid>
      </Paper>

      {/* Tabela e Ações */}
      <Paper elevation={3}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', p:2, flexWrap: 'wrap', gap: 1}}>
            <Typography variant="h6">Lista de Pedidos ({filteredOrders.length})</Typography>
            <Box>
                <Tooltip title="Configurar Colunas Visíveis">
                    <Button aria-controls="column-visibility-menu" aria-haspopup="true" onClick={openColumnMenu} startIcon={<ViewColumnIcon />} variant="outlined" size="small" sx={{mr:1}}> Colunas </Button>
                </Tooltip>
                <Menu id="column-visibility-menu" anchorEl={columnMenuAnchorEl} open={Boolean(columnMenuAnchorEl)} onClose={closeColumnMenu} PaperProps={{ style: { maxHeight: 300, width: '250px' } }}>
                  {ALL_COLUMNS.filter(col => col.id !== 'actions').map((col) => (
                    <MenuItem key={col.id} onClick={() => handleColumnVisibilityChange(col.id as string)} dense>
                      <MuiCheckbox checked={visibleColumns.includes(col.id as string)} size="small" />
                      <MuiListItemTextRenamed primary={col.label} />
                    </MenuItem>
                  ))}
                </Menu>
                <Button variant="contained" onClick={() => handleExport('excel')} startIcon={<FileDownloadIcon />} size="small" sx={{mr:1}} disabled={isLoading || filteredOrders.length === 0}>Excel</Button>
                <Button variant="contained" onClick={() => handleExport('csv')} startIcon={<FileDownloadIcon />}  size="small" sx={{mr:1}} disabled={isLoading || filteredOrders.length === 0}>CSV</Button>
                <Tooltip title="Atualizar Lista"><IconButton onClick={loadOrders} disabled={isLoading}>{isLoading ? <CircularProgress size={24}/> : <RefreshIcon />}</IconButton></Tooltip>
            </Box>
        </Box>
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {ALL_COLUMNS.filter(col => visibleColumns.includes(col.id as string)).map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'} sx={{minWidth: col.minWidth, fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && ordersToDisplay.length === 0 && (<TableRow><TableCell colSpan={visibleColumns.length} align="center"><CircularProgress sx={{my:3}}/></TableCell></TableRow>)}
              {!isLoading && ordersToDisplay.length === 0 && (<TableRow><TableCell colSpan={visibleColumns.length} align="center">Nenhum pedido encontrado.</TableCell></TableRow>)}
              {ordersToDisplay.map((order) => (
                <TableRow hover key={order.id}>
                  {ALL_COLUMNS.filter(col => visibleColumns.includes(col.id as string)).map((colDef) => (
                    <TableCell key={`${order.id}-${colDef.id}`} align={colDef.align || 'left'}>
                      {colDef.render ? colDef.render(order, pageInstance) : (order[colDef.id as keyof Order] as React.ReactNode) || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]} component="div" count={filteredOrders.length}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Pedidos por página:"
        />
      </Paper>

      {/* Modal de Detalhes do Pedido */}
      <Dialog open={!!viewingOrderDetails} onClose={handleCloseDetailsModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            Detalhes do Pedido: {viewingOrderDetails?.numero}
            <IconButton aria-label="close" onClick={handleCloseDetailsModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingOrderDetails && (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    {/* ... (Seções de Informações do Cliente e Endereço como antes) ... */}
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>Informações do Cliente</Typography><List dense disablePadding><ListItem><ListItemText primary="Cliente:" secondary={viewingOrderDetails.cliente} /></ListItem><ListItem><ListItemText primary="CPF/CNPJ:" secondary={viewingOrderDetails.cpfCnpj} /></ListItem><ListItem><ListItemText primary="Telefone:" secondary={viewingOrderDetails.telefone} /></ListItem><ListItem><ListItemText primary="Email:" secondary={viewingOrderDetails.email} /></ListItem><ListItem><ListItemText primary="Contato no Local:" secondary={viewingOrderDetails.nomeContato} /></ListItem></List><Divider sx={{my:1}}/>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>Endereço de Entrega</Typography><List dense disablePadding><ListItem><ListItemText primary="Endereço:" secondary={viewingOrderDetails.endereco} /></ListItem><ListItem><ListItemText primary="Bairro:" secondary={viewingOrderDetails.bairro} /></ListItem><ListItem><ListItemText primary="Cidade - UF:" secondary={`${viewingOrderDetails.cidade} - ${viewingOrderDetails.uf}`} /></ListItem><ListItem><ListItemText primary="CEP:" secondary={viewingOrderDetails.cep} /></ListItem></List>
                </Grid>
                <Grid item xs={12} md={6}>
                    {/* ... (Seções de Detalhes da Nota/Pedido e Status e Roteiro como antes) ... */}
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>Detalhes da Nota/Pedido</Typography><List dense disablePadding><ListItem><ListItemText primary="Data Emissão:" secondary={viewingOrderDetails.data} /></ListItem><ListItem><ListItemText primary="Peso:" secondary={`${Number(viewingOrderDetails.peso || 0).toFixed(2)} Kg`} /></ListItem><ListItem><ListItemText primary="Volume (Qtd):" secondary={viewingOrderDetails.volume || 'N/A'} /></ListItem><ListItem><ListItemText primary="Valor da Nota:" secondary={`R$ ${Number(viewingOrderDetails.valor || 0).toFixed(2)}`} /></ListItem><ListItem><ListItemText primary="Prazo Entrega:" secondary={viewingOrderDetails.prazo || 'N/A'} /></ListItem><ListItem><ListItemText primary="Prioridade:" secondary={viewingOrderDetails.prioridade || 'N/A'} /></ListItem></List><Divider sx={{my:1}}/>
                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>Status e Roteiro</Typography><List dense disablePadding><ListItem><ListItemText primary="Status Atual:" secondary={<Chip label={viewingOrderDetails.status} size="small" color={viewingOrderDetails.status === 'Pendente' ? 'warning' : viewingOrderDetails.status === 'Em rota' || viewingOrderDetails.status === 'Entrega Iniciada' ? 'info' : viewingOrderDetails.status === 'Entrega Finalizada' ? 'success' : viewingOrderDetails.status === 'Entrega Retornada' || viewingOrderDetails.status === 'Cancelado' ? 'error' : 'default'}/>} /></ListItem>{viewingOrderDetails.Delivery && (<><ListItem><ListItemText primary="Em Roteiro (ID):" secondary={viewingOrderDetails.deliveryId} /></ListItem>{viewingOrderDetails.Delivery.Driver && <ListItem><ListItemText primary="Motorista Designado:" secondary={viewingOrderDetails.Delivery.Driver.name} /></ListItem> }</>)}{viewingOrderDetails.instrucoesEntrega && <ListItem><ListItemText primary="Instruções:" secondary={viewingOrderDetails.instrucoesEntrega} /></ListItem>}</List>
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:1}}>
                        <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>Histórico de Ocorrências</Typography>
                        <Button size="small" variant="outlined" onClick={() => handleFetchOrderHistory(viewingOrderDetails.id)} disabled={isLoadingHistory} startIcon={isLoadingHistory ? <CircularProgress size={16}/> : <HistoryIcon/>}>
                            {isLoadingHistory ? "Carregando..." : "Carregar Histórico"}
                        </Button>
                    </Box>
                    {isLoadingHistory && <CircularProgress size={24} sx={{display:'block', margin: '10px auto'}}/>}
                    {!isLoadingHistory && orderHistory.length > 0 && (
                    <List dense sx={{maxHeight: 200, overflow: 'auto', border:'1px solid #eee', borderRadius:1, p:1, bgcolor: 'grey.50'}}>
                        {orderHistory.map(event => (
                        <ListItem key={event.id} dense sx={{borderBottom:'1px dotted #ddd', '&:last-child': {borderBottom:0}}}>
                            <MuiListItemIconRenamed sx={{minWidth: '30px'}}><HistoryIcon fontSize="small" color="action"/></MuiListItemIconRenamed>
                            <ListItemText
                                primary={<Typography variant="body2"><strong>{event.eventType}:</strong> {event.description}</Typography>}
                                secondary={`${new Date(event.timestamp).toLocaleString()} ${event.user ? `- Por: ${event.user}` : ''}`}
                            />
                        </ListItem>
                        ))}
                    </List>
                    )}
                    {!isLoadingHistory && orderHistory.length === 0 && viewingOrderDetails && (
                        <Typography variant="caption" sx={{mt:1, display:'block'}}>
                            {/* Mensagem se o histórico foi tentado carregar e veio vazio */}
                            { viewingOrderDetails && !isLoadingHistory && orderHistory.length === 0 && !isLoadingHistory ? "Nenhum histórico encontrado para este pedido." :
                            'Clique em "Carregar Histórico" para ver as ocorrências.'}
                        </Typography>
                    )}
                </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions><Button onClick={handleCloseDetailsModal}>Fechar</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(ViewOrdersPage);