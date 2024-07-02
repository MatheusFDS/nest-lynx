'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Category } from '../../types';
import withAuth from '../components/withAuth';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import { Delete, Edit } from '@mui/icons-material';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(token);
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      setError('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleAddCategory = async () => {
    try {
      if (selectedCategory) {
        await updateCategory(token, selectedCategory.id, newCategory as { name: string; valor: number });
      } else {
        await addCategory(token, newCategory as { name: string; valor: number });
      }
      setNewCategory({});
      setSelectedCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error) {
      setError('Failed to submit category.');
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(token, id);
      loadCategories();
    } catch (error) {
      setError('Failed to delete category.');
    }
  };

  const handleFormClose = () => {
    setSelectedCategory(null);
    setNewCategory({});
    setShowForm(false);
  };

  return (
    <Container>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Search Categories"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
        Add Category
      </Button>
      {showForm && (
        <Paper elevation={3} style={{ padding: '16px', marginTop: '16px' }}>
          <TextField
            label="Category Name"
            value={newCategory.name || ''}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Value"
            value={newCategory.valor !== undefined ? newCategory.valor : ''}
            onChange={(e) => setNewCategory({ ...newCategory, valor: parseFloat(e.target.value) })}
            type="number"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleAddCategory}>
            {selectedCategory ? 'Update Category' : 'Add Category'}
          </Button>
          <Button onClick={handleFormClose}>Cancel</Button>
        </Paper>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.valor}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default withAuth(CategoriesPage);
