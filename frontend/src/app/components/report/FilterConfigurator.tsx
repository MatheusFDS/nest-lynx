import React from 'react';
import { TextField, Box } from '@mui/material';

interface FilterConfiguratorProps {
  selectedColumns: string[];
  filters: { [key: string]: string };
  setFilters: (filters: { [key: string]: string }) => void;
}

const FilterConfigurator: React.FC<FilterConfiguratorProps> = ({ selectedColumns, filters, setFilters }) => {
  const handleFilterChange = (column: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [column]: event.target.value });
  };

  return (
    <Box>
      {selectedColumns.map(column => (
        <TextField
          key={column}
          label={`Filtrar por ${column}`}
          variant="outlined"
          style={{ marginBottom: 20 }}
          onChange={handleFilterChange(column)}
        />
      ))}
    </Box>
  );
};

export default FilterConfigurator;
