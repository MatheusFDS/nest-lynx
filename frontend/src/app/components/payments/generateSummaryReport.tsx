// utils/generateSummaryReport.ts
import { jsPDF } from 'jspdf';
import { Payment } from '../../../types';

const generateSummaryReport = (filteredPayments: Payment[], startDate: string, endDate: string) => {
  const doc = new jsPDF();
  let currentPage = 1;
  let y = 10;

  const addFooter = (pageNumber: number) => {
    doc.setFontSize(8);
    doc.text(`Página ${pageNumber}`, 180, 290);
    doc.text(`Emissão: ${new Date().toLocaleString()}`, 10, 290);
  };

  const checkPageLimit = (currentY: number) => {
    if (currentY > 270) {
      addFooter(currentPage);
      doc.addPage();
      currentPage += 1;
      return 10;
    }
    return currentY;
  };

  // Header
  doc.setFontSize(12);
  doc.text('RELATÓRIO TOTALIZADOR DE ENTREGAS', 10, y);
  y += 10;

  // Período
  doc.setFontSize(10);
  doc.text(`Período: ${startDate ? new Date(startDate).toLocaleString() : 'N/A'} - ${endDate ? new Date(endDate).toLocaleString() : 'N/A'}`, 10, y);
  y += 10;

  // Totalizadores
  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2);
  const totalWeight = filteredPayments.reduce((sum, payment) => sum + payment.paymentDeliveries.reduce((subSum, pd) => subSum + pd.delivery.totalPeso, 0), 0).toFixed(2);

  doc.setFontSize(10);
  doc.text(`Total de Pagamentos: ${totalPayments}`, 10, y);
  doc.text(`Valor Total: R$ ${totalAmount}`, 80, y);
  y += 5;
  doc.text(`Peso Total: ${totalWeight} kg`, 10, y);
  y += 10;

  // Detalhes dos Pagamentos
  doc.setFontSize(10);
  doc.text('DETALHES DOS PAGAMENTOS', 10, y);
  y += 5;

  filteredPayments.forEach(payment => {
    y = checkPageLimit(y);
    doc.setFontSize(8);
    doc.text(`ID Pagamento: ${payment.id}`, 10, y);
    doc.text(`ID Roteiros: ${payment.paymentDeliveries.map(pd => pd.delivery.id).join(', ')}`, 120, y);
    y += 5;
    doc.text(`Valor: R$ ${payment.amount.toFixed(2)}`, 10, y);
    doc.text(`Data Criação: ${new Date(payment.createdAt).toLocaleString()}`, 120, y);
    y += 5;
    doc.text(`Data Baixa: ${payment.status === 'Baixado' ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}`, 10, y);
    doc.text(`Nome Motorista: ${payment.Driver?.name || 'N/A'}`, 120, y);
    y += 10;
  });

  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  doc.save('Relatorio_Totalizador.pdf');
};

export default generateSummaryReport;
