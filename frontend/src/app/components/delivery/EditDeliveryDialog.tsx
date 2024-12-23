import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Delivery, Driver, Vehicle, Order } from '../../../types';
import { SelectChangeEvent } from '@mui/material/Select';

interface EditDeliveryDialogProps {
  dialogOpen: boolean;
  handleDialogClose: () => void;
  currentDelivery: Delivery | null;
  setCurrentDelivery: React.Dispatch<React.SetStateAction<Delivery | null>>;
  drivers: Driver[];
  selectedDriver: string;
  handleDriverChange: (e: SelectChangeEvent<string>) => void;
  vehicles: Vehicle[];
  selectedVehicle: string;
  handleVehicleChange: (e: SelectChangeEvent<string>) => void;
  tollValue: number;
  setTollValue: React.Dispatch<React.SetStateAction<number>>;
  handleConfirmDelivery: () => void;
  tabIndex: number;
  setTabIndex: React.Dispatch<React.SetStateAction<number>>;
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  handleRemoveOrderFromDelivery: (deliveryId: string, orderId: string) => void;
}

const EditDeliveryDialog: React.FC<EditDeliveryDialogProps> = ({
  dialogOpen,
  handleDialogClose,
  currentDelivery,
  setCurrentDelivery,
  drivers,
  selectedDriver,
  handleDriverChange,
  vehicles,
  selectedVehicle,
  handleVehicleChange,
  tollValue,
  setTollValue,
  handleConfirmDelivery,
  tabIndex,
  setTabIndex,
  calculateTotalWeightAndValue,
  handleRemoveOrderFromDelivery,
}) => {
  const handleRemoveOrder = (deliveryId: string, orderId: string) => {
    handleRemoveOrderFromDelivery(deliveryId, orderId);
    if (currentDelivery) {
      setCurrentDelivery({
        ...currentDelivery,
        orders: currentDelivery.orders.filter((order) => order.id !== orderId),
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle>Editar Roteiro</DialogTitle>
      <DialogContent>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="Dados" />
          <Tab label="Documentos" />
        </Tabs>
        {tabIndex === 0 && currentDelivery && (
          <div>
            <div>
              <Typography variant="h6">Informações da Rota</Typography>
              <Typography>ID da Rota: {currentDelivery.id}</Typography>
              <Typography>Nome da Região: {/* Adicionar função para obter nome da região */}</Typography>
            </div>
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
            <TextField
              label="Valor do Pedágio"
              type="number"
              fullWidth
              margin="normal"
              value={tollValue}
              onChange={(e) => setTollValue(Number(e.target.value))}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={currentDelivery.status}
                onChange={(e) => setCurrentDelivery(currentDelivery ? { ...currentDelivery, status: e.target.value as string } : null)}
              >
                <MenuItem value="Em Rota">Em Rota</MenuItem>
                <MenuItem value="Finalizado">Finalizado</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data Início"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={currentDelivery.dataInicio ? new Date(currentDelivery.dataInicio).toISOString().slice(0, 16) : ''}
              onChange={(e) => setCurrentDelivery({ ...currentDelivery, dataInicio: new Date(e.target.value) })}
            />
            <TextField
              label="Data Finalização"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={currentDelivery.dataFim ? new Date(currentDelivery.dataFim).toISOString().slice(0, 16) : ''}
              onChange={(e) => setCurrentDelivery({ ...currentDelivery, dataFim: new Date(e.target.value) })}
            />
          </div>
        )}
        {tabIndex === 1 && (
          <div>
            <List>
              {currentDelivery?.orders.map(order => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={`Documento ${order.numero} - Cliente: ${order.cliente}`}
                    secondary={`CEP: ${order.cep}, Valor: ${order.valor}, Peso: ${order.peso}, Ordem: ${order.sorting}`}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveOrder(currentDelivery.id, order.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
              <Typography variant="body1" style={{ marginTop: '16px' }}>
                Total Peso: {calculateTotalWeightAndValue(currentDelivery?.orders as Order[] || []).totalWeight.toFixed(2)} kg
              </Typography>
              <Typography variant="body1">Total Valor: R$ {calculateTotalWeightAndValue(currentDelivery?.orders as Order[] || []).totalValue.toFixed(2)}</Typography>
            </List>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleConfirmDelivery} color="primary">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDeliveryDialog;
