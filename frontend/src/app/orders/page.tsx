'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography, Container, TextField, Button, Dialog,
  DialogActions, DialogContent, DialogTitle, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { parse } from 'papaparse';
import withAuth from '../components/withAuth';
import { fetchOrders, uploadOrders, fetchUserSettings, updateUserSettings } from '../../services/orderService';
import { Order } from '../../types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css'; // Importar o tema claro
import 'ag-grid-enterprise';

import './custom-dark-theme.css'; // Customização do tema escuro

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

const OrdersPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFields, setShowFields] = useState<Record<Field, boolean>>(defaultFields);
  const [open, setOpen] = useState(false);

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
      const text = reader.result as string;
      const result = parse(text, { header: true });
      const ordersData = result.data as Order[];

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
    reader.readAsText(file);
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

  const columns = Object.keys(Field).map(key => ({
    headerName: Field[key as keyof typeof Field],
    field: Field[key as keyof typeof Field],
    hide: !showFields[Field[key as keyof typeof Field]],
    valueGetter: (params: any) => {
      if (key === 'DataFinalizacao') {
        return params.data.Delivery?.dataFim ? new Date(params.data.Delivery.dataFim).toLocaleDateString() : '';
      }
      if (key === 'Motorista') {
        return params.data.Delivery?.Driver?.name || '';
      }
      return params.data[Field[key as keyof typeof Field]];
    },
  }));

  let gridApi: any;
  let gridColumnApi: any;

  const onGridReady = (params: any) => {
    gridApi = params.api;
    gridColumnApi = params.columnApi;
  };

  const exportToCsv = () => {
    gridApi.exportDataAsCsv();
  };

  const exportToExcel = () => {
    gridApi.exportDataAsExcel();
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
      <Button
        variant="contained"
        component="label"
        startIcon={<Add />}
        style={{ marginRight: '8px' }}
      >
        Upload Orders
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={handleFileChange}
        />
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file}
      >
        Submit
      </Button>
      <Button
        variant="contained"
        onClick={exportToCsv}
        style={{ marginRight: '8px' }}
      >
        Export to CSV
      </Button>
      <Button
        variant="contained"
        onClick={exportToExcel}
      >
        Export to Excel
      </Button>
      <div className="ag-theme-balham-dark" style={{ height: 600, width: '100%', marginTop: '16px' }}>
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
          enableRangeSelection={true}
          rowSelection="multiple"
          animateRows={true}
          enableCharts={true}
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
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(OrdersPage);
