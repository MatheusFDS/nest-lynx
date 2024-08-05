'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography, Container, Button, Paper, TextField, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Direction } from '../../types';
import withAuth from '../hoc/withAuth';
import { fetchDirections, addDirection, updateDirection, deleteDirection } from '../../services/directionsService';
import { Delete, Edit } from '@mui/icons-material';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext

const DirectionsPage: React.FC = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [filteredDirections, setFilteredDirections] = useState<Direction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentDirection, setCurrentDirection] = useState<Partial<Direction>>({
    rangeInicio: '',
    rangeFim: '',
    valorDirecao: 0,
    regiao: '',
  });
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const { isLoading, setLoading } = useLoading(); // Usar o contexto de carregamento

  const token = localStorage.getItem('token') || '';

  const loadDirections = async () => {
    setLoading(true);
    try {
      const data = await fetchDirections(token);
      data.sort((a, b) => a.rangeInicio.localeCompare(b.rangeInicio));
      setDirections(data);
      setFilteredDirections(data);
    } catch (error) {
      handleError('Falha ao buscar direções.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirections();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = directions.filter(direction =>
      direction.rangeInicio.toLowerCase().includes(e.target.value.toLowerCase()) ||
      direction.rangeFim.toLowerCase().includes(e.target.value.toLowerCase()) ||
      direction.regiao.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredDirections(filtered);
  };

  const validateCepRange = (startCep: string, endCep: string): boolean => {
    const invalidDirection = directions.find(direction =>
      (startCep >= direction.rangeInicio && startCep <= direction.rangeFim) ||
      (endCep >= direction.rangeInicio && endCep <= direction.rangeFim)
    );

    if (invalidDirection) {
      const range = `${invalidDirection.rangeInicio} - ${invalidDirection.rangeFim}`;
      handleError(`O CEP de início ou de fim está em uma faixa existente: ${range} na região ${invalidDirection.regiao}.`);
      return false;
    }

    return true;
  };

  const handleAddOrEditDirection = async () => {
    try {
      const directionToSave: Partial<Direction> = {
        rangeInicio: currentDirection.rangeInicio!,
        rangeFim: currentDirection.rangeFim!,
        valorDirecao: currentDirection.valorDirecao!,
        regiao: currentDirection.regiao!,
      };

      if (!selectedDirection && !validateCepRange(currentDirection.rangeInicio!, currentDirection.rangeFim!)) {
        return;
      }

      if (selectedDirection) {
        await updateDirection(token, selectedDirection.id, directionToSave);
      } else {
        await addDirection(token, directionToSave);
      }

      setCurrentDirection({
        rangeInicio: '',
        rangeFim: '',
        valorDirecao: 0,
        regiao: '',
      });
      setSelectedDirection(null);
      setShowForm(false);
      loadDirections();
    } catch (error) {
      handleError('Falha ao enviar direção.');
    }
  };

  const handleEdit = (direction: Direction) => {
    setSelectedDirection(direction);
    setCurrentDirection({
      ...direction,
      valorDirecao: direction.valorDirecao,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDirection(token, id);
      loadDirections();
    } catch (error) {
      handleError('Falha ao deletar direção.');
    }
  };

  const handleFormClose = () => {
    setSelectedDirection(null);
    setCurrentDirection({
      rangeInicio: '',
      rangeFim: '',
      valorDirecao: 0,
      regiao: '',
    });
    setShowForm(false);
  };

  const handleError = (message: string) => {
    setDialogContent(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Buscar Direções"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Direção
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Range Início"
            value={currentDirection.rangeInicio || ''}
            onChange={(e) => setCurrentDirection({ ...currentDirection, rangeInicio: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Range Fim"
            value={currentDirection.rangeFim || ''}
            onChange={(e) => setCurrentDirection({ ...currentDirection, rangeFim: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valor Direção"
            value={currentDirection.valorDirecao}
            onChange={(e) => setCurrentDirection({ ...currentDirection, valorDirecao: parseFloat(e.target.value) })}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Região"
            value={currentDirection.regiao || ''}
            onChange={(e) => setCurrentDirection({ ...currentDirection, regiao: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddOrEditDirection}>
            {selectedDirection ? 'Atualizar Direção' : 'Adicionar Direção'}
          </Button>
          <Button onClick={handleFormClose}>Cancelar</Button>
        </Paper>
      )}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <TableContainer component={Paper} style={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Range Início</TableCell>
                <TableCell>Range Fim</TableCell>
                <TableCell>Valor Direção</TableCell>
                <TableCell>Região</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDirections.map((direction) => (
                <TableRow key={direction.id}>
                  <TableCell>{direction.rangeInicio}</TableCell>
                  <TableCell>{direction.rangeFim}</TableCell>
                  <TableCell>{direction.valorDirecao}</TableCell>
                  <TableCell>{direction.regiao}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(direction)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(direction.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Erro</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(DirectionsPage);
