'use client';

import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Box 
} from '@mui/material';
import withAuth from '../hoc/withAuth';
import { Tenant } from '../../types';

const TenantPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string>('');
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const fetchTenants = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/tenant', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data);
    } catch (error) {
      setError('Failed to fetch tenants.');
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleEdit = (tenant: Tenant) => {
    setEditTenant(tenant);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editTenant) {
      const { name, value } = e.target;
      setEditTenant({
        ...editTenant,
        [name]: name === 'minDeliveryPercentage' || name === 'port' ? parseFloat(value) : value,
      });
    }
  };

  const handleSave = async () => {
    if (!editTenant) return;

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }


    try {
      const response = await fetch(`http://localhost:4000/tenant/${editTenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editTenant),
      });

      if (!response.ok) {
        throw new Error('Failed to update tenant');
      }

      fetchTenants();
      setEditTenant(null);
    } catch (error) {
      setError('Failed to update tenant.');
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        {tenants.map((tenant) => (
          <Grid item xs={12} sm={6} md={4} key={tenant.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{tenant.name}</Typography>
              <Typography variant="body1">Min Delivery Percentage: {tenant.minDeliveryPercentage}</Typography>
              <Typography variant="body1">Address: {tenant.address}</Typography>
              <Button variant="contained" color="primary" onClick={() => handleEdit(tenant)} style={{ marginTop: '8px' }}>
                Edit
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {editTenant && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <Typography variant="h6">Edit Tenant</Typography>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Parameters" />
          </Tabs>
          <Box role="tabpanel" hidden={activeTab !== 0} style={{ padding: '16px' }}>
            <TextField
              label="Name"
              name="name"
              value={editTenant.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          
            <TextField
              label="Address"
              name="address"
              value={editTenant.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
          <Box role="tabpanel" hidden={activeTab !== 1} style={{ padding: '16px' }}>

          <TextField
              label="Min Delivery Percentage"
              name="minDeliveryPercentage"
              type="number"
              value={editTenant.minDeliveryPercentage}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            
          <TextField
              label="Minímo de Valor"
              name="valor"
              value={editTenant.minValue || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mínimo de Documentos"
              name="doccumentos"
              value={editTenant.minOrders || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mínimo de Peso"
              name="peso"
              value={editTenant.minPeso || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
          <Box role="tabpanel" hidden={activeTab !== 2} style={{ padding: '16px' }}>
            {/* Adicione aqui os campos de parâmetros gerais, conforme necessário */}
            {/* Exemplo:
            <TextField
              label="Example Parameter"
              name="exampleParameter"
              value={editTenant.exampleParameter || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            /> */}
          </Box>
          <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '16px' }}>
            Save
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setEditTenant(null)} style={{ marginTop: '16px', marginLeft: '8px' }}>
            Cancel
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default withAuth(TenantPage, { requiredRole: 'admin' });
