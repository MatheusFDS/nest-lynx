import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';
import { Order, Direction } from '../../../../types';
import { Delete } from '@mui/icons-material';

interface CreateRouteTableProps {
  orders: Order[];
  directions: Direction[];
  handleShowMap: (selectedOrders: Order[]) => void;
}

const CreateRouteTable: React.FC<CreateRouteTableProps> = ({ orders, directions, handleShowMap }) => {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cepRange, setCepRange] = useState({ start: '', end: '' });
  const [regionName, setRegionName] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [isMapActive, setIsMapActive] = useState(false); // Adicione este estado

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, cepRange, regionName, localOrders, directions]);

  const getRegionByCep = (cep: string) => {
    const cepInt = parseInt(cep);
    const region = directions.find(direction => 
      cepInt >= parseInt(direction.rangeInicio) && cepInt <= parseInt(direction.rangeFim)
    );
    return region ? region.regiao : 'Sem Região';
  };

  const filterOrders = () => {
    let result = localOrders;

    if (searchTerm) {
      result = result.filter(order =>
        order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.endereco.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cepRange.start && cepRange.end) {
      const startCep = parseInt(cepRange.start);
      const endCep = parseInt(cepRange.end);
      result = result.filter(order => {
        const orderCep = parseInt(order.cep);
        return orderCep >= startCep && orderCep <= endCep;
      });
    }

    if (regionName) {
      result = result.filter(order => getRegionByCep(order.cep).toLowerCase().includes(regionName.toLowerCase()));
    }

    setFilteredOrders(result);
  };

  const handleToggle = (order: Order) => {
    const currentIndex = selectedOrders.indexOf(order);
    const newSelectedOrders = [...selectedOrders];

    if (currentIndex === -1) {
      newSelectedOrders.push(order);
    } else {
      newSelectedOrders.splice(currentIndex, 1);
    }

    setSelectedOrders(newSelectedOrders);
  };

  const handleRemoveOrder = (orderId: string) => {
    setSelectedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const handleClearCart = () => {
    setSelectedOrders([]);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCepRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCepRange(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegionName(e.target.value);
  };

  const handleShowMapClick = () => {
    setIsMapActive(true); // Ativar o mapa
    handleShowMap(selectedOrders);
    handleClearCart(); // Limpar o carrinho após mostrar o mapa
  };

  const handleHideMap = () => {
    setIsMapActive(false); // Desativar o mapa
  };

  const calculateTotalValue = () => {
    return selectedOrders.reduce((total, order) => total + order.valor, 0);
  };

  const calculateTotalWeight = () => {
    return selectedOrders.reduce((total, order) => total + order.peso, 0);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {!isMapActive && (
          <Grid container spacing={2} style={{ marginBottom: '16px' }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Pesquisar"
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="CEP Início"
                name="start"
                value={cepRange.start}
                onChange={handleCepRangeChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="CEP Fim"
                name="end"
                value={cepRange.end}
                onChange={handleCepRangeChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Nome da Região"
                value={regionName}
                onChange={handleRegionNameChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        )}
        {selectedOrders.length > 0 && (
          <Paper elevation={3} style={{ padding: '8px', marginBottom: '16px' }}>
            <Typography variant="h6">Lista de Entregas</Typography>
            <div style={{ marginBottom: '8px' }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleShowMapClick}
                style={{ marginRight: '8px' }}
              >
                Gerar Rota
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleClearCart}
              >
                Limpar Roteiro
              </Button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '8px' }}>
              {selectedOrders.map(order => (
                <Grid container key={order.id} alignItems="center" justifyContent="space-between">
                  <Grid item xs>
                    <Typography variant="body2">
                      {order.numero} - {order.cliente} - {order.cep}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton size="small" onClick={() => handleRemoveOrder(order.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </div>
            <Typography variant="body2">
              <strong>Valor Total:</strong> {calculateTotalValue().toFixed(2)}
            </Typography>
            <Typography variant="body2">
              <strong>Peso Total:</strong> {calculateTotalWeight().toFixed(2)} kg
            </Typography>
          </Paper>
        )}
        <TableContainer component={Paper} style={{ height: '70vh', overflowY: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Região</TableCell>
                <TableCell>CEP</TableCell>
                <TableCell>Peso</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Bairro</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id} style={{ whiteSpace: 'nowrap' }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order)}
                      onChange={() => handleToggle(order)}
                    />
                  </TableCell>
                  <TableCell>{getRegionByCep(order.cep)}</TableCell>
                  <TableCell>{order.cep}</TableCell>
                  <TableCell>{order.peso}</TableCell>
                  <TableCell>{order.valor}</TableCell>
                  <TableCell>{order.numero}</TableCell>
                  <TableCell>{new Date(order.data).toLocaleDateString()}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>{order.endereco}</TableCell>
                  <TableCell>{order.bairro}</TableCell>
                  <TableCell>{order.cidade}</TableCell>
                  <TableCell>{order.uf}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default CreateRouteTable;
