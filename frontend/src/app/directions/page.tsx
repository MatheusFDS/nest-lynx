'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Button,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Direction } from '../../types';
import withAuth from '../hoc/withAuth';
import {
  fetchDirections,
  addDirection,
  updateDirection,
  deleteDirection,
} from '../../services/directionsService';
import { Delete, Edit } from '@mui/icons-material';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

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
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const { isLoading, setLoading } = useLoading(); // Usar o contexto de carregamento
  const { showMessage } = useMessage(); // Hook para mensagens

  const token = localStorage.getItem('token') || '';

  const loadDirections = async () => {
    setLoading(true);
    try {
      const data = await fetchDirections(token);
      data.sort((a, b) => a.rangeInicio.localeCompare(b.rangeInicio));
      setDirections(data);
      setFilteredDirections(data);
      showMessage('Direções carregadas com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao buscar direções:', error);
      showMessage('Falha ao buscar direções.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = directions.filter(
      (direction) =>
        direction.rangeInicio.toLowerCase().includes(term.toLowerCase()) ||
        direction.rangeFim.toLowerCase().includes(term.toLowerCase()) ||
        direction.regiao.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDirections(filtered);
  };

  const validateCepRange = (startCep: string, endCep: string): boolean => {
    const invalidDirection = directions.find(
      (direction) =>
        (startCep >= direction.rangeInicio && startCep <= direction.rangeFim) ||
        (endCep >= direction.rangeInicio && endCep <= direction.rangeFim)
    );

    if (invalidDirection) {
      const range = `${invalidDirection.rangeInicio} - ${invalidDirection.rangeFim}`;
      showMessage(
        `O CEP de início ou de fim está em uma faixa existente: ${range} na região ${invalidDirection.regiao}.`,
        'error'
      );
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
        showMessage('Direção atualizada com sucesso!', 'success'); // Mensagem de sucesso
      } else {
        await addDirection(token, directionToSave);
        showMessage('Direção adicionada com sucesso!', 'success'); // Mensagem de sucesso
      }

      setCurrentDirection({
        rangeInicio: '',
        rangeFim: '',
        valorDirecao: 0,
        regiao: '',
      });
      setSelectedDirection(null);
      setShowForm(false);
      //loadDirections();
    } catch (error: unknown) {
      console.error('Erro ao enviar direção:', error);
      showMessage('Falha ao enviar direção.', 'error'); // Mensagem de erro
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
      showMessage('Direção deletada com sucesso!', 'success'); // Mensagem de sucesso
      //loadDirections();
    } catch (error: unknown) {
      console.error('Erro ao deletar direção:', error);
      showMessage('Falha ao deletar direção.', 'error'); // Mensagem de erro
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

  // Removendo o estado de erro e funções relacionadas, já que usamos showMessage
  // const [error, setError] = useState<string>('');
  // const handleError = (message: string) => {
  //   setDialogContent(message);
  //   setDialogOpen(true);
  // };
  // const handleCloseDialog = () => {
  //   setDialogOpen(false);
  // };

  return (
    <Container>
      {/* Campo de Busca */}
      <TextField
        label="Buscar Direções"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />

      {/* Botão para Adicionar Direção */}
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Direção
      </Button>

      {/* Formulário de Adição/Atualização de Direção */}
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
            onChange={(e) =>
              setCurrentDirection({
                ...currentDirection,
                valorDirecao: parseFloat(e.target.value),
              })
            }
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOrEditDirection}
            style={{ marginRight: '8px' }}
          >
            {selectedDirection ? 'Atualizar Direção' : 'Adicionar Direção'}
          </Button>
          <Button variant="outlined" onClick={handleFormClose}>
            Cancelar
          </Button>
        </Paper>
      )}

      {/* Tabela de Direções */}
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
                    <IconButton onClick={() => handleEdit(direction)} aria-label="editar">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(direction.id)} aria-label="deletar">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDirections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhuma direção encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo para Erros (Removido, já que usamos showMessage) */}
      {/* 
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Erro</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog> 
      */}
    </Container>
  );
};

export default withAuth(DirectionsPage);
