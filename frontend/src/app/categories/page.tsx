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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Category } from '../../types';
import withAuth from '../hoc/withAuth';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';
import { Delete, Edit } from '@mui/icons-material';
import SkeletonLoader from '../components/SkeletonLoader';
import { useLoading } from '../context/LoadingContext'; // Importar o LoadingContext
import { useMessage } from '../context/MessageContext'; // Importar o contexto de mensagens

const StyledButton = styled(Button)({
  margin: '8px',
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#115293',
  },
});

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { isLoading, setLoading } = useLoading(); // Usar o contexto de carregamento
  const { showMessage } = useMessage(); // Hook para mensagens

  const token = localStorage.getItem('token') || '';

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories(token);
      setCategories(data);
      setFilteredCategories(data);
      showMessage('Categorias carregadas com sucesso!', 'success'); // Mensagem de sucesso
    } catch (error: unknown) {
      console.error('Erro ao buscar categorias:', error);
      setError('Falha ao buscar categorias.');
      showMessage('Erro ao buscar categorias.', 'error'); // Mensagem de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleAddCategory = async () => {
    try {
      if (selectedCategory) {
        await updateCategory(token, selectedCategory.id, {
          name: newCategory.name!,
          valor: newCategory.valor!,
        });
        showMessage('Categoria atualizada com sucesso!', 'success'); // Mensagem de sucesso
      } else {
        await addCategory(token, {
          name: newCategory.name!,
          valor: newCategory.valor!,
        });
        showMessage('Categoria adicionada com sucesso!', 'success'); // Mensagem de sucesso
      }
      setNewCategory({});
      setSelectedCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error: unknown) {
      console.error('Erro ao adicionar/atualizar categoria:', error);
      setError('Falha ao submeter categoria.');
      showMessage('Erro ao submeter categoria.', 'error'); // Mensagem de erro
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(token, id);
      showMessage('Categoria deletada com sucesso!', 'success'); // Mensagem de sucesso
      loadCategories();
    } catch (error: unknown) {
      console.error('Erro ao deletar categoria:', error);
      setError('Falha ao deletar categoria.');
      showMessage('Erro ao deletar categoria.', 'error'); // Mensagem de erro
    }
  };

  const handleFormClose = () => {
    setSelectedCategory(null);
    setNewCategory({});
    setShowForm(false);
  };

  return (
    <Container>
      {/* Exibição de Mensagem de Erro (opcional, já que usamos showMessage) */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Campo de Busca */}
      <TextField
        label="Buscar"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />

      {/* Botão para Adicionar Categoria */}
      <StyledButton variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Adicionar Categoria
      </StyledButton>

      {/* Formulário de Adição/Atualização de Categoria */}
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Nome da Categoria"
            value={newCategory.name || ''}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valor"
            value={newCategory.valor !== undefined ? newCategory.valor : ''}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                valor: parseFloat(e.target.value),
              })
            }
            type="number"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddCategory} style={{ marginRight: '8px' }}>
            {selectedCategory ? 'Atualizar Categoria' : 'Adicionar Categoria'}
          </Button>
          <Button variant="outlined" onClick={handleFormClose}>
            Cancelar
          </Button>
        </Paper>
      )}

      {/* Tabela de Categorias */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <TableContainer component={Paper} style={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.valor}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(category)} aria-label="editar">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)} aria-label="deletar">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default withAuth(CategoriesPage);
