'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Paper, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Checkbox, FormControlLabel, FormGroup, Dialog, DialogActions, DialogContent, DialogTitle, Button
} from '@mui/material';
import { Add, ViewList } from '@mui/icons-material';
import { parse } from 'papaparse';
import withAuth from '../components/withAuth';
import { fetchOrders, uploadOrders, fetchUserSettings, updateUserSettings } from '../../services/orderService';
import { Order } from '../../types';

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
    if (token) {
      updateUserSettings(token, showFields);
    }
  }, [showFields]);

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
      <IconButton onClick={handleDialogOpen} style={{ marginBottom: '16px' }}>
        <ViewList />
      </IconButton>
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
      <TableContainer component={Paper} style={{ marginTop: '16px', fontSize: '0.875rem' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {showFields[Field.Id] && <TableCell>ID</TableCell>}
              {showFields[Field.Numero] && <TableCell>Numero</TableCell>}
              {showFields[Field.Data] && <TableCell>Data</TableCell>}
              {showFields[Field.IdCliente] && <TableCell>ID Cliente</TableCell>}
              {showFields[Field.Cliente] && <TableCell>Cliente</TableCell>}
              {showFields[Field.Endereco] && <TableCell>Endereço</TableCell>}
              {showFields[Field.Bairro] && <TableCell>Bairro</TableCell>}
              {showFields[Field.Cidade] && <TableCell>Cidade</TableCell>}
              {showFields[Field.Uf] && <TableCell>UF</TableCell>}
              {showFields[Field.Cep] && <TableCell>CEP</TableCell>}
              {showFields[Field.Peso] && <TableCell>Peso</TableCell>}
              {showFields[Field.Volume] && <TableCell>Volume</TableCell>}
              {showFields[Field.Prazo] && <TableCell>Prazo</TableCell>}
              {showFields[Field.Prioridade] && <TableCell>Prioridade</TableCell>}
              {showFields[Field.Telefone] && <TableCell>Telefone</TableCell>}
              {showFields[Field.Email] && <TableCell>Email</TableCell>}
              {showFields[Field.Valor] && <TableCell>Valor</TableCell>}
              {showFields[Field.InstrucoesEntrega] && <TableCell>Instruções de Entrega</TableCell>}
              {showFields[Field.NomeContato] && <TableCell>Nome Contato</TableCell>}
              {showFields[Field.CpfCnpj] && <TableCell>CPF/CNPJ</TableCell>}
              {showFields[Field.Status] && <TableCell>Status</TableCell>}
              {showFields[Field.DeliveryId] && <TableCell>Delivery ID</TableCell>}
              {showFields[Field.TenantId] && <TableCell>Tenant ID</TableCell>}
              {showFields[Field.DataFinalizacao] && <TableCell>Data Finalização</TableCell>}
              {showFields[Field.Motorista] && <TableCell>Motorista</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                {showFields[Field.Id] && <TableCell>{order.id}</TableCell>}
                {showFields[Field.Numero] && <TableCell>{order.numero}</TableCell>}
                {showFields[Field.Data] && <TableCell>{new Date(order.data).toLocaleDateString()}</TableCell>}
                {showFields[Field.IdCliente] && <TableCell>{order.idCliente}</TableCell>}
                {showFields[Field.Cliente] && <TableCell>{order.cliente}</TableCell>}
                {showFields[Field.Endereco] && <TableCell>{order.endereco}</TableCell>}
                {showFields[Field.Bairro] && <TableCell>{order.bairro}</TableCell>}
                {showFields[Field.Cidade] && <TableCell>{order.cidade}</TableCell>}
                {showFields[Field.Uf] && <TableCell>{order.uf}</TableCell>}
                {showFields[Field.Cep] && <TableCell>{order.cep}</TableCell>}
                {showFields[Field.Peso] && <TableCell>{order.peso}</TableCell>}
                {showFields[Field.Volume] && <TableCell>{order.volume}</TableCell>}
                {showFields[Field.Prazo] && <TableCell>{order.prazo}</TableCell>}
                {showFields[Field.Prioridade] && <TableCell>{order.prioridade}</TableCell>}
                {showFields[Field.Telefone] && <TableCell>{order.telefone}</TableCell>}
                {showFields[Field.Email] && <TableCell>{order.email}</TableCell>}
                {showFields[Field.Valor] && <TableCell>{order.valor}</TableCell>}
                {showFields[Field.InstrucoesEntrega] && <TableCell>{order.instrucoesEntrega}</TableCell>}
                {showFields[Field.NomeContato] && <TableCell>{order.nomeContato}</TableCell>}
                {showFields[Field.CpfCnpj] && <TableCell>{order.cpfCnpj}</TableCell>}
                {showFields[Field.Status] && <TableCell>{order.status}</TableCell>}
                {showFields[Field.DeliveryId] && <TableCell>{order.deliveryId}</TableCell>}
                {showFields[Field.TenantId] && <TableCell>{order.tenantId}</TableCell>}
                {showFields[Field.DataFinalizacao] && <TableCell>{order.Delivery?.dataFim ? new Date(order.Delivery.dataFim).toLocaleDateString() : ''}</TableCell>}
                {showFields[Field.Motorista] && <TableCell>{order.Delivery?.Driver?.name || ''}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
