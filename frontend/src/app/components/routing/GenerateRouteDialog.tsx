import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton, SelectChangeEvent } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Order, Driver, Vehicle, Direction, Category } from '../../../types';

interface GenerateRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDriver: number | string;
  selectedVehicle: number | string;
  handleDriverChange: (e: SelectChangeEvent<number | string>) => void;
  handleVehicleChange: (e: SelectChangeEvent<number | string>) => void;
  drivers: Driver[];
  vehicles: Vehicle[];
  orders: Order[];
  calculateFreightValue: () => number;
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  openGoogleMaps: (cep: string) => void;
  setSelectedOrders: React.Dispatch<React.SetStateAction<{ [key: number]: Order[] }>>;
  currentDirectionId: number | null;
}

const GenerateRouteDialog: React.FC<GenerateRouteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedDriver,
  selectedVehicle,
  handleDriverChange,
  handleVehicleChange,
  drivers,
  vehicles,
  orders,
  calculateFreightValue,
  calculateTotalWeightAndValue,
  openGoogleMaps,
  setSelectedOrders,
  currentDirectionId,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gerar Roteiro</DialogTitle>
      <DialogContent>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="DADOS" />
          <Tab label="NOTAS" />
        </Tabs>
        {tabIndex === 0 && (
          <div>
            <FormControl fullWidth margin="normal">
              <InputLabel>Motorista</InputLabel>
              <Select value={selectedDriver} onChange={handleDriverChange}>
                {drivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Veículo</InputLabel>
              <Select value={selectedVehicle} onChange={handleVehicleChange}>
                {vehicles.map(vehicle => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" style={{ marginTop: '16px' }}>
              Total Peso: {calculateTotalWeightAndValue(orders).totalWeight.toFixed(2)} kg
            </Typography>
            <Typography variant="body2">Total Valor: R$ {calculateTotalWeightAndValue(orders).totalValue.toFixed(2)}</Typography>
            <Typography variant="body2">Valor do Frete: R$ {calculateFreightValue().toFixed(2)}</Typography>
          </div>
        )}
        {tabIndex === 1 && (
          <div>
            <List>
              {orders.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={<Typography variant="body2">{`Pedido ${order.numero} - Cliente: ${order.cliente}`}</Typography>}
                    secondary={<Typography variant="caption">{`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}`}</Typography>}
                  />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => setSelectedOrders(prevState => {
                      const updatedOrders = { ...prevState };
                      updatedOrders[currentDirectionId!] = updatedOrders[currentDirectionId!].filter(o => o.id !== order.id);
                      return updatedOrders;
                    })}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
              <Typography variant="body2" style={{ marginTop: '16px' }}>
                Total Peso: {calculateTotalWeightAndValue(orders).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body2">Total Valor: R$ {calculateTotalWeightAndValue(orders).totalValue.toFixed(2)}</Typography>
            </List>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginTop: '16px' }}
              onClick={() => openGoogleMaps(orders[0]?.cep || '')}
            >
              Mapa
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={onConfirm} color="primary">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateRouteDialog;
