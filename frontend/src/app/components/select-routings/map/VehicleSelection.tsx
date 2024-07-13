import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Vehicle } from '../../../../types';

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  selectedVehicle: number | string;
  handleVehicleChange: (event: SelectChangeEvent<number | string>) => void;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({ vehicles, selectedVehicle, handleVehicleChange }) => (
  <FormControl fullWidth size="small">
    <InputLabel>Veículo</InputLabel>
    <Select value={selectedVehicle} onChange={handleVehicleChange}>
      {vehicles.map(vehicle => (
        <MenuItem key={vehicle.id} value={vehicle.id}>
          {vehicle.model}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default VehicleSelection;
