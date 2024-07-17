import React from 'react';
import { Grid, TextField, Button } from '@mui/material';

interface FilterBarProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dateRange: { startDate: string; endDate: string };
  handleDateFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setStatusFilter: (status: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  handleSearch,
  dateRange,
  handleDateFilter,
  setStatusFilter,
}) => {
  return (
    <Grid container spacing={2} style={{ marginTop: '16px', marginBottom: '16px' }}>
      <Grid item xs={12}>
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
      <Grid item xs={12} sm={6}>
        <TextField
          label="Data Início"
          type="datetime-local"
          fullWidth
          value={dateRange.startDate}
          onChange={handleDateFilter}
          name="startDate"
          InputLabelProps={{ shrink: true }}
          size="small"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Data Fim"
          type="datetime-local"
          fullWidth
          value={dateRange.endDate}
          onChange={handleDateFilter}
          name="endDate"
          InputLabelProps={{ shrink: true }}
          size="small"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" onClick={() => setStatusFilter('A liberar')}>A liberar</Button>
        <Button variant="outlined" onClick={() => setStatusFilter('Em Rota')}>Liberados</Button>
        <Button variant="outlined" onClick={() => setStatusFilter('Negado')}>Negados</Button>
      </Grid>
    </Grid>
  );
};

export default FilterBar;
