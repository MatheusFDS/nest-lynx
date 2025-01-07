// src/pages/TenantPage.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Typography, 
  Container, 
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
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

const TenantPage: React.FC = () => {
  const { setLoading, isLoading } = useLoading();
  const { showMessage } = useMessage(); // Hook para mensagens
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Função para carregar os tenants
  const loadTenants = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const fetchedTenants = await fetchTenants(token);
      setTenants(fetchedTenants);
      //showMessage('Tenants carregados com sucesso.', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Failed to fetch tenants:', error);
      showMessage('Falha ao carregar tenants.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [setLoading, showMessage]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Função para abrir o modal de edição
  const handleEdit = (tenant: Tenant) => {
    setEditTenant(tenant);
    showMessage(`Editando o tenant: ${tenant.name}`, 'info'); // Mensagem informativa
  };

  // Função para lidar com mudanças nos campos de edição
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editTenant) {
      const { name, value } = e.target;
      setEditTenant({
        ...editTenant,
        [name]: value,
      });
    }
  };

  // Função para salvar as alterações no tenant
  const handleSave = async () => {
    if (!editTenant) return;

    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('Token de autenticação não encontrado.', 'error'); // Mensagem de erro
      return;
    }

    setLoading(true);
    try {
      const tenantToSave = {
        ...editTenant,
        minDeliveryPercentage: Number(editTenant.minDeliveryPercentage),
        minValue: Number(editTenant.minValue),
        minOrders: Number(editTenant.minOrders),
        minPeso: Number(editTenant.minPeso)
      };

      await updateTenant(token, editTenant.id, tenantToSave);
      await loadTenants(); // Recarrega os tenants após a atualização
      showMessage('Tenant atualizado com sucesso.', 'success'); // Mensagem de sucesso
      setEditTenant(null);
    } catch (error: unknown) {
      console.error('Failed to update tenant:', error);
      showMessage('Falha ao atualizar o tenant.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança de aba
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Removido: Exibição de mensagens de erro diretamente no JSX */}
          {/* {error && <Typography color="error">{error}</Typography>} */}

          <TableContainer component={Paper} style={{ marginTop: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Porcentagem %</TableCell>
                  <TableCell>Qtd Docs Min</TableCell>
                  <TableCell>Vlr Min</TableCell>
                  <TableCell>Peso Min</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.address}</TableCell>
                    <TableCell>{tenant.minDeliveryPercentage} %</TableCell>
                    <TableCell>{tenant.minOrders}</TableCell>
                    <TableCell>{tenant.minValue}</TableCell>
                    <TableCell>{tenant.minPeso}</TableCell>
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
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs">
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
                  value={editTenant.minValue}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Qtd Documentos Min"
                  name="minOrders"
                  type="number"
                  value={editTenant.minOrders}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Peso Min"
                  name="minPeso"
                  type="number"
                  value={editTenant.minPeso}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box style={{ marginTop: '16px' }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Salvar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setEditTenant(null)}
                  style={{ marginLeft: '8px' }}
                >
                  Cancelar
                </Button>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default withAuth(TenantPage, { requiredRole: 'admin' });
