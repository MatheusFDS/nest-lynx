import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Order } from '../../../types';

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ open, onClose, order }) => {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes do Documento</DialogTitle>
      <DialogContent>
        <Typography variant="body2"><strong>Número Documento:</strong> {order.numero}</Typography>
        <Typography variant="body2"><strong>Data:</strong> {order.data}</Typography>
        <Typography variant="body2"><strong>ID Cliente:</strong> {order.idCliente}</Typography>
        <Typography variant="body2"><strong>Cliente:</strong> {order.cliente}</Typography>
        <Typography variant="body2"><strong>Endereço:</strong> {order.endereco}</Typography>
        <Typography variant="body2"><strong>Cidade:</strong> {order.cidade}</Typography>
        <Typography variant="body2"><strong>UF:</strong> {order.uf}</Typography>
        <Typography variant="body2"><strong>Peso:</strong> {order.peso} kg</Typography>
        <Typography variant="body2"><strong>Volume:</strong> {order.volume} m³</Typography>
        <Typography variant="body2"><strong>Prazo:</strong> {order.prazo}</Typography>
        <Typography variant="body2"><strong>Prioridade:</strong> {order.prioridade}</Typography>
        <Typography variant="body2"><strong>Telefone:</strong> {order.telefone}</Typography>
        <Typography variant="body2"><strong>Email:</strong> {order.email}</Typography>
        <Typography variant="body2"><strong>Bairro:</strong> {order.bairro}</Typography>
        <Typography variant="body2"><strong>Valor:</strong> R$ {order.valor}</Typography>
        <Typography variant="body2"><strong>Instruções de Entrega:</strong> {order.instrucoesEntrega}</Typography>
        <Typography variant="body2"><strong>Nome do Contato:</strong> {order.nomeContato}</Typography>
        <Typography variant="body2"><strong>CPF/CNPJ:</strong> {order.cpfCnpj}</Typography>
        <Typography variant="body2"><strong>CEP:</strong> {order.cep}</Typography>
        <Typography variant="body2"><strong>Status:</strong> {order.status}</Typography>
        <Typography variant="body2"><strong>Data de Criação:</strong> {order.createdAt}</Typography>
        <Typography variant="body2"><strong>Data de Atualização:</strong> {order.updatedAt}</Typography>
        {order.Delivery && (
          <>
            <Typography variant="body2"><strong>Data de Entrega:</strong> {order.Delivery.dataFim}</Typography>
            {order.Delivery.Driver && (
              <Typography variant="body2"><strong>Motorista:</strong> {order.Delivery.Driver.name}</Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
