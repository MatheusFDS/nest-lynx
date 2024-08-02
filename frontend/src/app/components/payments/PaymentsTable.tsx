// components/PaymentsTable.tsx
import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Checkbox, IconButton, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
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
}) => (
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
            {payment.isGroup && (
              <Button onClick={() => handleUngroupPayments(payment.id)}>Desagrupar</Button>
            )}
            {payment.paymentDeliveries.map(pd => (
              <Button key={pd.delivery.id} onClick={() => generateDeliveryReport(pd.delivery)}>Gerar Relatório</Button>
            ))}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default PaymentsTable;
