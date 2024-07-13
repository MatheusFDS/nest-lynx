import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Driver } from '../../../../types';

interface DriverSelectionProps {
  drivers: Driver[];
  selectedDriver: number | string;
  handleDriverChange: (event: SelectChangeEvent<number | string>) => void;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({ drivers, selectedDriver, handleDriverChange }) => (
  <FormControl fullWidth size="small">
    <InputLabel>Motorista</InputLabel>
    <Select value={selectedDriver} onChange={handleDriverChange}>
      {drivers.map(driver => (
        <MenuItem key={driver.id} value={driver.id}>
          {driver.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default DriverSelection;
