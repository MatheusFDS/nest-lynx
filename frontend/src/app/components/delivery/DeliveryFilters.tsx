import React from 'react';
import { Grid, TextField, Checkbox, FormControlLabel } from '@mui/material';

interface DeliveryFiltersProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dateRange: { startDate: string; endDate: string };
  handleDateFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFinalized: boolean;
  handleStatusFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPending: boolean;
  showToRelease: boolean;
}

const DeliveryFilters: React.FC<DeliveryFiltersProps> = ({
  searchTerm,
  handleSearch,
  dateRange,
  handleDateFilter,
  showFinalized,
  handleStatusFilterChange,
  showPending,
  showToRelease,
}) => (
  <Grid container spacing={2} alignItems="center" style={{ marginBottom: '16px' }}>
    <Grid item xs={12} md={3}>
      <TextField
        label="Buscar"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
    </Grid>
    <Grid item xs={5} md={2}>
      <TextField
        label="Data Início"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={dateRange.startDate}
        onChange={handleDateFilter}
        name="startDate"
        fullWidth
        margin="normal"
      />
    </Grid>
    <Grid item xs={5} md={2}>
      <TextField
        label="Data Fim"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={dateRange.endDate}
        onChange={handleDateFilter}
        name="endDate"
        fullWidth
        margin="normal"
      />
    </Grid>
    <Grid item xs={4} md={1.2}>
      <FormControlLabel
        control={<Checkbox checked={showFinalized} onChange={handleStatusFilterChange} name="showFinalized" />}
        label="Finalizados"
      />
    </Grid>
    <Grid item xs={4} md={1.2}>
      <FormControlLabel
        control={<Checkbox checked={showPending} onChange={handleStatusFilterChange} name="showPending" />}
        label="Pendentes"
      />
    </Grid>
    <Grid item xs={4} md={1.4}>
      <FormControlLabel
        control={<Checkbox checked={showToRelease} onChange={handleStatusFilterChange} name="showToRelease" />}
        label="A Liberar"
      />
    </Grid>
  </Grid>
);

export default DeliveryFilters;
