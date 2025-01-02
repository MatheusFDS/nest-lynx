import React, { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Checkbox, IconButton, Button, Menu, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import DescriptionIcon from '@mui/icons-material/Description'; // Ícone de relatório mais apropriado
import { Payment, Delivery } from '../../../types';
import generateDeliveryReport from './generateDeliveryReport';

interface PaymentsTableProps {
  payments: Payment[];
  selectedPayments: string[];
  handlePaymentSelect: (paymentId: string) => void;
  handleViewDetails: (deliveryIds: string[]) => void;
  handlePaymentStatusChange: (paymentId: string, status: string) => void;
  handleUngroupPayments: (paymentId: string) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  selectedPayments,
  handlePaymentSelect,
  handleViewDetails,
  handlePaymentStatusChange,
  handleUngroupPayments
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentDeliveries, setCurrentDeliveries] = useState<Delivery[]>([]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deliveries: Delivery[]) => {
    setAnchorEl(event.currentTarget);
    setCurrentDeliveries(deliveries);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentDeliveries([]);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Selecionar</TableCell>
          <TableCell>ID Pagamento</TableCell>
          <TableCell>ID Roteiros</TableCell>
          <TableCell>Valor Total</TableCell>
          <TableCell>Data Criação</TableCell>
          <TableCell>Data Baixa</TableCell>
          <TableCell>Nome Motorista</TableCell>
          <TableCell>isGroup</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map(payment => (
          <TableRow key={payment.id}>
            <TableCell>
              <Checkbox
                checked={selectedPayments.includes(payment.id)}
                onChange={() => handlePaymentSelect(payment.id)}
                disabled={payment.isGroup || payment.groupedPaymentId !== null}
              />
            </TableCell>
            <TableCell>{payment.id}</TableCell>
            <TableCell>{payment.paymentDeliveries.map(pd => pd.delivery.id).join(', ')}</TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
            <TableCell>{payment.status === 'Baixado' ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}</TableCell>
            <TableCell>{payment.Driver?.name || 'N/A'}</TableCell>
            <TableCell>{payment.isGroup ? 'Sim' : 'Não'}</TableCell>
            <TableCell>
              <IconButton onClick={() => handleViewDetails(payment.paymentDeliveries.map(pd => pd.delivery.id))}>
                <InfoIcon />
              </IconButton>
              <IconButton onClick={() => handlePaymentStatusChange(payment.id, payment.status === 'Baixado' ? 'Pendente' : 'Baixado')}>
                {payment.status === 'Baixado' ? <GetAppIcon style={{ color: 'red' }} /> : <GetAppIcon />}
              </IconButton>
             
              <IconButton onClick={(event) => handleMenuClick(event, payment.paymentDeliveries.map(pd => pd.delivery))}>
                <DescriptionIcon /> {/* Ícone de relatório mais apropriado */}
              </IconButton>
              {payment.isGroup && (
                <Button onClick={() => handleUngroupPayments(payment.id)}>Desagrupar</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {currentDeliveries.map(delivery => (
          <MenuItem key={delivery.id} onClick={() => { generateDeliveryReport(delivery); handleMenuClose(); }}>
            Relatório {delivery.id}
          </MenuItem>
        ))}
      </Menu>
    </Table>
  );
};

export default PaymentsTable;
