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
  Box, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton 
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import withAuth from '../hoc/withAuth';
import { Tenant } from '../../types';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext';
import { fetchTenants, updateTenant } from '../../services/tenantService';

const TenantPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string>('');
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const loadTenants = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const tenants = await fetchTenants(token);
      setTenants(tenants);
    } catch (error) {
      setError('Failed to fetch tenants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleEdit = (tenant: Tenant) => {
    setEditTenant(tenant);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editTenant) {
      const { name, value } = e.target;
      setEditTenant({
        ...editTenant,
        [name]: name === 'Pocentagem Mínima' || name === 'Valor Mínimo' || name === 'Documentos Qtd Mínima' || name === 'minPeso' ? parseFloat(value) : value,
      });
    }
  };

  const handleSave = async () => {
    if (!editTenant) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      await updateTenant(token, editTenant.id, editTenant);
      loadTenants();
      setEditTenant(null);
    } catch (error) {
      setError('Failed to update tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          <TableContainer component={Paper} style={{ marginTop: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Porcentagem</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.minDeliveryPercentage}</TableCell>
                    <TableCell>{tenant.address}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(tenant)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {editTenant && (
            <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
              <Typography variant="h6">Editar</Typography>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Geral" />
                <Tab label="Parâmetros" />
              </Tabs>
              <Box role="tabpanel" hidden={activeTab !== 0} style={{ padding: '16px' }}>
                <TextField
                  label="Nome"
                  name="name"
                  value={editTenant.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Endereço"
                  name="address"
                  value={editTenant.address}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box role="tabpanel" hidden={activeTab !== 1} style={{ padding: '16px' }}>
                <TextField
                  label="Porcentagem Min"
                  name="minDeliveryPercentage"
                  type="number"
                  value={editTenant.minDeliveryPercentage}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Valor Min"
                  name="minValue"
                  type="number"
                  value={editTenant.minValue || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Qtd Documentos Min"
                  name="minOrders"
                  type="number"
                  value={editTenant.minOrders || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Peso Min"
                  name="minPeso"
                  type="number"
                  value={editTenant.minPeso || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '16px' }}>
                Save
              </Button>
              <Button variant="contained" color="secondary" onClick={() => setEditTenant(null)} style={{ marginTop: '16px', marginLeft: '8px' }}>
                Cancel
              </Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default withAuth(TenantPage, { requiredRole: 'admin' });
