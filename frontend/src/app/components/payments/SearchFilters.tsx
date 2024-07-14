// components/SearchFilters.tsx
import React from 'react';
import { Grid, TextField, FormControlLabel, Checkbox } from '@mui/material';

interface SearchFiltersProps {
  searchTerm: string;
  startDate: string;
  endDate: string;
  grouped: boolean;
  paid: boolean;
  pending: boolean;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  startDate,
  endDate,
  grouped,
  paid,
  pending,
  handleSearch,
  handleDateChange,
  handleStatusFilterChange
}) => (
  <Grid container spacing={3} style={{ marginTop: '16px', marginBottom: '16px' }}>
    <Grid item xs={12} sm={4}>
      <TextField
        label="Buscar"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        variant="outlined"
        size="small"
        placeholder="Pesquisar por qualquer campo"
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <TextField
        label="Data Início"
        type="datetime-local"
        fullWidth
        value={startDate}
        onChange={handleDateChange}
        name="startDate"
        InputLabelProps={{ shrink: true }}
        size="small"
        variant="outlined"
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <TextField
        label="Data Fim"
        type="datetime-local"
        fullWidth
        value={endDate}
        onChange={handleDateChange}
        name="endDate"
        InputLabelProps={{ shrink: true }}
        size="small"
        variant="outlined"
      />
    </Grid>
    <Grid item xs={12} sm={2}>
      <FormControlLabel
        control={<Checkbox checked={grouped} onChange={handleStatusFilterChange} name="grouped" />}
        label="Agrupados"
      />
      <FormControlLabel
        control={<Checkbox checked={paid} onChange={handleStatusFilterChange} name="paid" />}
        label="Baixados"
      />
      <FormControlLabel
        control={<Checkbox checked={pending} onChange={handleStatusFilterChange} name="pending" />}
        label="Pendentes"
      />
    </Grid>
  </Grid>
);

export default SearchFilters;
