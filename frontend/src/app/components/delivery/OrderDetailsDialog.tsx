import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Order } from '../../../types';

interface OrderDetailsDialogProps {
  detailsDialogOpen: boolean;
  handleDetailsDialogClose: () => void;
  selectedOrder: Order | null;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  detailsDialogOpen,
  handleDetailsDialogClose,
  selectedOrder,
}) => (
  <Dialog open={detailsDialogOpen} onClose={handleDetailsDialogClose} fullWidth maxWidth="sm">
    <DialogTitle>Detalhes do Pedido</DialogTitle>
    <DialogContent>
      {selectedOrder && (
        <>
          <Typography variant="body1"><strong>Pedido Número:</strong> {selectedOrder.numero}</Typography>
          <Typography variant="body1"><strong>Data:</strong> {selectedOrder.data}</Typography>
          <Typography variant="body1"><strong>ID Cliente:</strong> {selectedOrder.idCliente}</Typography>
          <Typography variant="body1"><strong>Cliente:</strong> {selectedOrder.cliente}</Typography>
          <Typography variant="body1"><strong>Endereço:</strong> {selectedOrder.endereco}</Typography>
          <Typography variant="body1"><strong>Cidade:</strong> {selectedOrder.cidade}</Typography>
          <Typography variant="body1"><strong>UF:</strong> {selectedOrder.uf}</Typography>
          <Typography variant="body1"><strong>Peso:</strong> {selectedOrder.peso} kg</Typography>
          <Typography variant="body1"><strong>Volume:</strong> {selectedOrder.volume} m³</Typography>
          <Typography variant="body1"><strong>Prazo:</strong> {selectedOrder.prazo}</Typography>
          <Typography variant="body1"><strong>Prioridade:</strong> {selectedOrder.prioridade}</Typography>
          <Typography variant="body1"><strong>Telefone:</strong> {selectedOrder.telefone}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {selectedOrder.email}</Typography>
          <Typography variant="body1"><strong>Bairro:</strong> {selectedOrder.bairro}</Typography>
          <Typography variant="body1"><strong>Valor:</strong> R$ {selectedOrder.valor}</Typography>
          <Typography variant="body1"><strong>Instruções de Entrega:</strong> {selectedOrder.instrucoesEntrega}</Typography>
          <Typography variant="body1"><strong>Nome do Contato:</strong> {selectedOrder.nomeContato}</Typography>
          <Typography variant="body1"><strong>CPF/CNPJ:</strong> {selectedOrder.cpfCnpj}</Typography>
          <Typography variant="body1"><strong>CEP:</strong> {selectedOrder.cep}</Typography>
          <Typography variant="body1"><strong>Status:</strong> {selectedOrder.status}</Typography>
          <Typography variant="body1"><strong>Data de Criação:</strong> {selectedOrder.createdAt}</Typography>
          <Typography variant="body1"><strong>Data de Atualização:</strong> {selectedOrder.updatedAt}</Typography>
          {selectedOrder.Delivery && (
            <>
              <Typography variant="body1"><strong>Data de Entrega:</strong> {selectedOrder.Delivery.dataFim}</Typography>
              {selectedOrder.Delivery.Driver && (
                <Typography variant="body1"><strong>Motorista:</strong> {selectedOrder.Delivery.Driver.name}</Typography>
              )}
            </>
          )}
        </>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleDetailsDialogClose} color="primary">
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

export default OrderDetailsDialog;
