'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  FormGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add,
  CloudUpload,
  SaveAlt,
  ContentCopy,
  FileDownload,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { utils, read, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import withAuth from '../hoc/withAuth';
import { fetchOrders, uploadOrders, fetchUserSettings, updateUserSettings } from '../../services/orderService';
import { Order } from '../../types';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from '../components/SkeletonLoader'; // Importar o SkeletonLoader
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext

enum Field {
  Id = 'id',
  Numero = 'numero',
  Data = 'data',
  IdCliente = 'idCliente',
  Cliente = 'cliente',
  Endereco = 'endereco',
  Cidade = 'cidade',
  Uf = 'uf',
  Peso = 'peso',
  Volume = 'volume',
  Prazo = 'prazo',
  Prioridade = 'prioridade',
  Telefone = 'telefone',
  Email = 'email',
  Bairro = 'bairro',
  Valor = 'valor',
  InstrucoesEntrega = 'instrucoesEntrega',
  NomeContato = 'nomeContato',
  CpfCnpj = 'cpfCnpj',
  Cep = 'cep',
  Status = 'status',
  DeliveryId = 'deliveryId',
  TenantId = 'tenantId',
  DataFinalizacao = 'dataFinalizacao',
  Motorista = 'motorista'
}

const defaultFields: Record<Field, boolean> = {
  [Field.Id]: true,
  [Field.Numero]: true,
  [Field.Data]: true,
  [Field.IdCliente]: true,
  [Field.Cliente]: true,
  [Field.Endereco]: true,
  [Field.Bairro]: true,
  [Field.Cidade]: true,
  [Field.Uf]: true,
  [Field.Cep]: true,
  [Field.Peso]: true,
  [Field.Volume]: true,
  [Field.Prazo]: true,
  [Field.Prioridade]: true,
  [Field.Telefone]: true,
  [Field.Email]: true,
  [Field.Valor]: true,
  [Field.InstrucoesEntrega]: true,
  [Field.NomeContato]: true,
  [Field.CpfCnpj]: true,
  [Field.Status]: true,
  [Field.DeliveryId]: true,
  [Field.TenantId]: true,
  [Field.DataFinalizacao]: true,
  [Field.Motorista]: true,
};

const formatDateTimeBR = (date: string) => {
  const [datePart, timePart] = date.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year} ${timePart.split('.')[0]}`;
};

const StyledButton = styled(Button)({
  margin: '8px 0',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const OrdersPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const [file, setFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFields, setShowFields] = useState<Record<Field, boolean>>(defaultFields);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [gridApi, setGridApi] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    EmRota: false,
    ALiberar: false,
    Pendente: false,
    Reentrega: false,
    Finalizado: false,
  });

  const { isDarkMode } = useTheme();
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadOrders();
    loadUserSettings();
  }, []);

  useEffect(() => {
    if (token && showFields) {
      updateUserSettings(token, showFields);
    }
  }, [showFields, token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders(token);
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Failed to fetch orders.');
    }
  };

  const loadUserSettings = async () => {
    try {
      const settings = await fetchUserSettings(token);
      if (settings && settings.settings) {
        setShowFields(settings.settings);
      }
    } catch (error) {
      setError('Failed to fetch user settings.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const binaryStr = reader.result;
      const workbook = read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const ordersData = utils.sheet_to_json<Order>(worksheet);

      try {
        await uploadOrders(token, ordersData);
        setOrders([...orders, ...ordersData]);
        setSuccess('Orders uploaded successfully');
        setError('');
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to upload orders.');
        }
        setSuccess('');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const applyFilters = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        Object.values(order).some(val =>
          String(val).toLowerCase().includes(searchTerm)
        )
      );
    }

    if (startDate) {
      filtered = filtered.filter(order => new Date(order.data) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(order => new Date(order.data) <= new Date(endDate));
    }

    const activeStatusFilters = Object.keys(statusFilters).filter(key => statusFilters[key]);

    if (activeStatusFilters.length > 0) {
      filtered = filtered.filter(order => activeStatusFilters.includes(order.status.replace(/\s+/g, '')));
    }

    setFilteredOrders(filtered);
    setError('');
  };

  const handleFieldToggle = (field: Field) => {
    const updatedFields = {
      ...showFields,
      [field]: !showFields[field],
    };
    setShowFields(updatedFields);
  };

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilters(prev => ({ ...prev, [status.replace(' ', '')]: !prev[status.replace(' ', '')] }));
  };

  const columns = Object.keys(Field).map(key => ({
    headerName: Field[key as keyof typeof Field],
    field: Field[key as keyof typeof Field],
    hide: !showFields[Field[key as keyof typeof Field]],
    valueGetter: (params: any) => {
      const value = params.data[Field[key as keyof typeof Field]];
      if (key === 'Data') {
        return value ? formatDateTimeBR(value) : '';
      }
      if (key === 'Motorista') {
        return params.data.Delivery?.Driver?.name || '';
      }
      if (key === 'DataFinalizacao') {
        return params.data.Delivery?.dataFim ? formatDateTimeBR(params.data.Delivery.dataFim) : '';
      }
      return value;
    },
  }));

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const copySelectedRowsToClipboard = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    const selectedDataString = selectedRows.map((row: any) => {
      const rowData = Object.values(row).join('\t');
      return rowData;
    }).join('\n');
    navigator.clipboard.writeText(selectedDataString).then(() => {
      console.log('Rows copied to clipboard');
    });
  };

  const exportToCsv = () => {
    if (!gridApi) return;
    const rowData: any[] = [];
    gridApi.forEachNodeAfterFilterAndSort((node: any) => rowData.push(node.data));
    const csvContent = [
      Object.keys(Field).join(';'),
      ...rowData.map((row: any) => Object.values(row).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!gridApi) return;
    const rowData: any[] = [];
    gridApi.forEachNodeAfterFilterAndSort((node: any) => rowData.push(node.data));

    const worksheet = utils.json_to_sheet(rowData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Orders');

    writeFile(workbook, 'orders.xlsx');
  };

  const exportToPdf = (selectedOnly: boolean) => {
    if (!gridApi) return;
    const rowData: any[] = [];
    if (selectedOnly) {
      gridApi.getSelectedRows().forEach((row: any) => rowData.push(row));
    } else {
      gridApi.forEachNodeAfterFilterAndSort((node: any) => rowData.push(node.data));
    }

    const doc = new jsPDF();
    rowData.forEach((row, index) => {
      const margin = 10;
      const lineSpacing = 10;
      let yPosition = margin;

      doc.text(`Order ${index + 1}`, margin, yPosition);
      yPosition += lineSpacing;

      Object.entries(row).forEach(([key, value]) => {
        if (key in Field) {
          const displayValue = (key === 'Data' || key === 'DataFinalizacao') ? formatDateTimeBR(value as string) : value;
          doc.text(`${key}: ${displayValue}`, margin, yPosition);
          yPosition += lineSpacing;
        }
      });

      if (index < rowData.length - 1) {
        doc.addPage();
      }
    });

    doc.save('orders.pdf');
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
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
            onChange={(e) => setStartDate(e.target.value)}
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
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={statusFilters.EmRota} onChange={() => handleStatusFilterChange('EmRota')} />}
            label="Em Rota"
          />
          <FormControlLabel
            control={<Checkbox checked={statusFilters.ALiberar} onChange={() => handleStatusFilterChange('ALiberar')} />}
            label="A Liberar"
          />
          <FormControlLabel
            control={<Checkbox checked={statusFilters.Pendente} onChange={() => handleStatusFilterChange('Pendente')} />}
            label="Pendente"
          />
          <FormControlLabel
            control={<Checkbox checked={statusFilters.Reentrega} onChange={() => handleStatusFilterChange('Reentrega')} />}
            label="Reentrega"
          />
          <FormControlLabel
            control={<Checkbox checked={statusFilters.Finalizado} onChange={() => handleStatusFilterChange('Finalizado')} />}
            label="Finalizado"
          />
          <Badge badgeContent={filteredOrders.length} color="primary" showZero>
          </Badge>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mt={2} mb={2}>
        <Box display="flex" gap={2} alignItems="center">
        </Box>
        <Box display="flex" gap={2}>
          <IconButton color="primary" onClick={applyFilters}>
            <Refresh />
          </IconButton>
          <IconButton
            color="primary"
            component="label"
          >
            <input
              type="file"
              hidden
              accept=".csv, .xls, .xlsx"
              onChange={handleFileChange}
            />
            <Add />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleUpload}
            disabled={!file}
          >
            <CloudUpload />
          </IconButton>
          <IconButton
            color="primary"
            onClick={copySelectedRowsToClipboard}
          >
            <ContentCopy />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleMenuClick}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={exportToCsv}>
              <FileDownload style={{ marginRight: '8px' }} />
              Exportar para CSV
            </MenuItem>
            <MenuItem onClick={exportToExcel}>
              <FileDownload style={{ marginRight: '8px' }} />
              Exportar para Excel
            </MenuItem>
            <MenuItem onClick={() => exportToPdf(false)}>
              <FileDownload style={{ marginRight: '8px' }} />
              Exportar todos para PDF
            </MenuItem>
            <MenuItem onClick={() => exportToPdf(true)}>
              <FileDownload style={{ marginRight: '8px' }} />
              Exportar selecionados para PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      {isLoading ? (
        <SkeletonLoader />
      ) : filteredOrders.length > 0 ? (
        <Paper elevation={3}>
          <div className={isDarkMode ? "ag-theme-balham-dark" : "ag-theme-balham"} style={{ height: 800, width: '100%', marginTop: '16px', overflowY: 'auto' }}>
            <AgGridReact
              rowData={filteredOrders}
              columnDefs={columns}
              pagination={true}
              paginationPageSize={100}
              domLayout="autoHeight"
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              rowSelection="multiple"
              onGridReady={onGridReady}
            />
          </div>
        </Paper>
      ) : (
        <Typography align="center" style={{ padding: '16px' }}>
          Nenhuma ordem encontrada. Use os filtros para buscar ordens.
        </Typography>
      )}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Escolher Colunas para Exibir</DialogTitle>
        <DialogContent>
          <FormGroup>
            {(Object.keys(Field) as Array<keyof typeof Field>).map((field) => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={showFields[Field[field]]}
                    onChange={() => handleFieldToggle(Field[field])}
                  />
                }
                label={Field[field]}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleDialogClose}>
            <SaveAlt />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(OrdersPage);
