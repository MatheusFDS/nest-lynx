import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Button, TextField, Grid, Paper, Typography, IconButton } from '@mui/material';
import { Order, Direction } from '../../../../types';
import { Delete } from '@mui/icons-material';
import Draggable from 'react-draggable';

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const getRegionByCep = (cep: string) => {
    const cepInt = parseInt(cep);
    const region = directions.find(direction => 
      cepInt >= parseInt(direction.rangeInicio) && cepInt <= parseInt(direction.rangeFim)
    );
    return region ? region.regiao : 'Sem Região';
  };

  const filterOrders = () => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(order =>
        order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.endereco.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cepRange.start || cepRange.end) {
      result = result.filter(order =>
        (!cepRange.start || parseInt(order.cep) >= parseInt(cepRange.start)) &&
        (!cepRange.end || parseInt(order.cep) <= parseInt(cepRange.end))
      );
    }

    if (regionName) {
      const regionIds = directions
        .filter(direction => direction.regiao.toLowerCase().includes(regionName.toLowerCase()))
        .map(direction => direction.id);

      result = result.filter(order => {
        const orderCep = parseInt(order.cep);
        return directions.some(direction => 
          regionIds.includes(direction.id) &&
          orderCep >= parseInt(direction.rangeInicio) &&
          orderCep <= parseInt(direction.rangeFim)
        );
      });
    } else {
      result = result.filter(order => {
        const orderCep = parseInt(order.cep);
        return directions.some(direction => 
          orderCep >= parseInt(direction.rangeInicio) &&
          orderCep <= parseInt(direction.rangeFim)
        );
      });
    }

    result.sort((a, b) => parseInt(a.cep) - parseInt(b.cep));

    setFilteredOrders(result);
  };

  useEffect(() => {
    filterOrders();
  }, [searchTerm, cepRange, regionName, orders, directions]);

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

  const handleRemoveOrder = (orderId: number) => {
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
    handleShowMap(selectedOrders);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Bairro</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>CEP</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Peso</TableCell>
              <TableCell>Região</TableCell>
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
                <TableCell>{order.numero}</TableCell>
                <TableCell>{new Date(order.data).toLocaleDateString()}</TableCell>
                <TableCell>{order.cliente}</TableCell>
                <TableCell>{order.endereco}</TableCell>
                <TableCell>{order.bairro}</TableCell>
                <TableCell>{order.cidade}</TableCell>
                <TableCell>{order.uf}</TableCell>
                <TableCell>{order.cep}</TableCell>
                <TableCell>{order.valor}</TableCell>
                <TableCell>{order.peso}</TableCell>
                <TableCell>{getRegionByCep(order.cep)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12} md={4}>
        <Draggable>
          <Paper elevation={3} style={{ padding: '16px', cursor: 'move' }}>
            <Typography variant="h6">Carrinho de Pedidos</Typography>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedOrders.map(order => (
                <Grid container key={order.id} alignItems="center">
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleShowMapClick}
              style={{ marginTop: '16px' }}
            >
              Gerar Rota
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleClearCart}
              style={{ marginTop: '8px' }}
            >
              Limpar Carrinho
            </Button>
          </Paper>
        </Draggable>
      </Grid>
    </Grid>
  );
};

export default CreateRouteTable;
