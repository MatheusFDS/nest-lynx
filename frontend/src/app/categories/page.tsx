'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Grid, Paper, TextField } from '@mui/material';
import { Category } from '../../types';
import withAuth from '../components/withAuth';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [newValue, setNewValue] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/category', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory, valor: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      setNewCategory('');
      setNewValue(0);
      fetchCategories();
    } catch (error) {
      setError('Failed to add category.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} style={{ marginTop: '16px' }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <TextField
              label="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Value"
              value={newValue}
              onChange={(e) => setNewValue(parseFloat(e.target.value))}
              type="number"
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddCategory}>
              Add Category
            </Button>
          </Paper>
        </Grid>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{category.name}</Typography>
              <Typography variant="body1">Value: {category.valor}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default withAuth(CategoriesPage);
