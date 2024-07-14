// utils/generateDeliveryReport.ts
import { jsPDF } from 'jspdf';
import { Delivery } from '../../../types';

const generateDeliveryReport = (delivery: Delivery) => {
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
  doc.text('Relatório de Entrega', 10, y);
  y += 10;

  // Dados do Roteiro
  doc.setFontSize(10);
  doc.text(`ID da Rota: ${delivery.id}`, 10, y);
  doc.text(`Motorista: ${delivery.Driver?.name || 'N/A'}`, 80, y);
  doc.text(`Veículo: ${delivery.Vehicle?.model || 'N/A'}`, 10, y += 5);
  doc.text(`Valor do Frete: R$ ${delivery.valorFrete.toFixed(2)}`, 80, y);
  doc.text(`Total Peso: ${delivery.totalPeso.toFixed(2)} kg`, 10, y += 5);
  doc.text(`Total Valor: R$ ${delivery.totalValor.toFixed(2)}`, 80, y);
  doc.text(`Status: ${delivery.status}`, 10, y += 5);
  doc.text(`Data Início: ${new Date(delivery.dataInicio).toLocaleString()}`, 80, y);
  doc.text(`Data Fim: ${delivery.dataFim ? new Date(delivery.dataFim).toLocaleString() : 'N/A'}`, 10, y += 5);

  // Divider
  y += 5;
  doc.line(10, y, 200, y);
  y += 5;

  // Dados dos Pedidos
  doc.setFontSize(10);
  doc.text('Pedidos', 10, y);
  y += 10;

  delivery.orders.forEach(order => {
    y = checkPageLimit(y);
    doc.setFontSize(8);
    doc.text(`ID Pedido: ${order.id}`, 10, y);
    doc.text(`Cliente: ${order.cliente}`, 60, y);
    y += 5;
    doc.text(`Endereço: ${order.endereco}`, 10, y);
    y += 5;
    doc.text(`Cidade: ${order.cidade}`, 10, y);
    doc.text(`UF: ${order.uf}`, 80, y);
    doc.text(`CEP: ${order.cep}`, 100, y);
    y += 5;
    doc.text(`Valor: R$ ${order.valor.toFixed(2)}`, 10, y);
    doc.text(`Peso: ${order.peso.toFixed(2)} kg`, 80, y);
    doc.text(`Volume: ${order.volume}`, 100, y);
    y += 5;
    doc.text(`Status: ${order.status}`, 10, y);
    doc.text(`Data de Criação: ${new Date(order.createdAt).toLocaleString()}`, 60, y);
    y += 5;
    doc.text(`Data de Atualização: ${new Date(order.updatedAt).toLocaleString()}`, 10, y);
    y += 10;
  });

  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  doc.save(`Relatorio_Entrega_${delivery.id}.pdf`);
};

export default generateDeliveryReport;
