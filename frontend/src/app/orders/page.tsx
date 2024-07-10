'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography, Container, TextField, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle, FormGroup, FormControlLabel, Checkbox,
  Menu, MenuItem,
} from '@mui/material';
import {
  Add,
  CloudUpload,
  SaveAlt,
  ContentCopy,
  FileDownload,
  MoreVert,
} from '@mui/icons-material';
import { parse } from 'papaparse';
import withAuth from '../components/withAuth';
import { fetchOrders, uploadOrders, fetchUserSettings, updateUserSettings } from '../../services/orderService';
import { Order } from '../../types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css'; // Importar o tema claro

import { utils, read, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../context/ThemeContext'; // Importar o contexto de tema

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

const formatDateBR = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const OrdersPage: React.FC = () => {
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

  const { isDarkMode } = useTheme(); // Obter o tema atual do contexto
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
      const data = await fetchOrders(token);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
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
        setFilteredOrders([...orders, ...ordersData]);
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
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value) {
      const filtered = orders.filter(order =>
        Object.values(order).some(val =>
          String(val).toLowerCase().includes(value)
        )
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
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

  const columns = Object.keys(Field).map(key => ({
    headerName: Field[key as keyof typeof Field],
    field: Field[key as keyof typeof Field],
    hide: !showFields[Field[key as keyof typeof Field]],
    valueGetter: (params: any) => {
      const value = params.data[Field[key as keyof typeof Field]];
      if (key === 'Data' || key === 'DataFinalizacao') {
        return value ? formatDateBR(value) : '';
      }
      if (key === 'Motorista') {
        return params.data.Delivery?.Driver?.name || '';
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
    gridApi.forEachNode((node: any) => rowData.push(node.data));
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
    gridApi.forEachNode((node: any) => rowData.push(node.data));
    
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
          const displayValue = (key === 'Data' || key === 'DataFinalizacao') ? formatDateBR(value as string) : value;
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
      <TextField
        label="Search Orders"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <IconButton
        color="primary"
        component="label"
        style={{ marginRight: '8px' }}
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
        style={{ marginRight: '8px' }}
      >
        <CloudUpload />
      </IconButton>
      <IconButton
        color="primary"
        onClick={copySelectedRowsToClipboard}
        style={{ marginRight: '8px' }}
      >
        <ContentCopy />
      </IconButton>
      <IconButton
        color="primary"
        onClick={handleMenuClick}
        style={{ marginRight: '8px' }}
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
          Export to CSV
        </MenuItem>
        <MenuItem onClick={exportToExcel}>
          <FileDownload style={{ marginRight: '8px' }} />
          Export to Excel
        </MenuItem>
        <MenuItem onClick={() => exportToPdf(false)}>
          <FileDownload style={{ marginRight: '8px' }} />
          Export All to PDF
        </MenuItem>
        <MenuItem onClick={() => exportToPdf(true)}>
          <FileDownload style={{ marginRight: '8px' }} />
          Export Selected to PDF
        </MenuItem>
      </Menu>
      <div className={isDarkMode ? "ag-theme-balham-dark" : "ag-theme-balham"} style={{ height: 600, width: '100%', marginTop: '16px' }}>
        <AgGridReact
          rowData={filteredOrders}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={10}
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
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Choose Columns to Display</DialogTitle>
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
