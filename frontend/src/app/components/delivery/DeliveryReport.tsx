// components/DeliveryReport.tsx
import { jsPDF } from 'jspdf';
import { Delivery, Driver, Vehicle, Order } from '../../../types';

interface DeliveryReportProps {
  delivery: Delivery;
  driver: Driver | undefined;
  vehicle: Vehicle | undefined;
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number };
  getRegionName: (delivery: Delivery) => string;
}

export const generatePDF = (
  delivery: Delivery,
  driver: Driver | undefined,
  vehicle: Vehicle | undefined,
  calculateTotalWeightAndValue: (orders: Order[]) => { totalWeight: number; totalValue: number },
  getRegionName: (delivery: Delivery) => string
) => {
  const doc = new jsPDF();
  const { totalWeight, totalValue } = calculateTotalWeightAndValue(delivery.orders as Order[]);
  const regionName = getRegionName(delivery);
  let currentPage = 1;
  let y = 10;

  // Function to add footer with page number
  const addFooter = (pageNumber: number) => {
    doc.setFontSize(8);
    doc.text(`Página ${pageNumber}`, 180, 290);
    doc.text(`Emissão: ${new Date().toLocaleString()}`, 10, 290);
  };

  // Function to increment page and add a new one if needed
  const checkPageLimit = (currentY: number) => {
    if (currentY > 270) {
      addFooter(currentPage);
      doc.addPage();
      currentPage += 1;
      return 10; // Reset Y position for new page
    }
    return currentY;
  };

  // Header
  doc.setFontSize(12);
  doc.text('ROTEIRO DE ENTREGA', 10, y);
  y += 10;

  // Dados do Roteiro
  doc.setFontSize(10);
  doc.text(`ID da Ordem de Carga: ${delivery.id}`, 10, y);
  doc.text(`Motorista: ${driver?.name || 'N/A'}`, 150, y);
  doc.text(`Transportadora: ${driver?.name || 'N/A'}`, 10, y += 5);
  doc.text(`Veículo: ${vehicle?.model || 'N/A'}`, 150, y);
  doc.text(`Data Início: ${delivery.dataInicio ? new Date(delivery.dataInicio).toLocaleString() : 'N/A'}`, 10, y += 5);
  doc.text(`Região: ${regionName}`, 150, y);
  doc.text(`Data Finalização: ${delivery.dataFim ? new Date(delivery.dataFim).toLocaleString() : 'N/A'}`, 10, y += 5);

  // Divider
  y += 5;
  doc.line(10, y, 200, y);
  y += 5;

  // Dados dos Pedidos
  doc.setFontSize(10);
  doc.text('DADOS DOS DOCUMENTOS', 10, y);
  y += 5;

  doc.setFontSize(8);
  doc.text('Seq', 10, y);
  doc.text('Nota', 20, y);
  doc.text('Valor', 40, y);
  doc.text('Endereço', 60, y);
  doc.text('Cliente', 110, y);
  doc.text('Peso (kg)', 160, y);
  doc.text('Assinatura', 180, y);
  y += 5;

  delivery.orders.forEach((order, index) => {
    y = checkPageLimit(y);
    const endereco = doc.splitTextToSize(order.endereco, 45);
    const cliente = doc.splitTextToSize(order.cliente, 45);
    doc.setFontSize(6);
    doc.text(`${order.sorting}`, 10, y);
    doc.text(`${order.numero}`, 20, y);
    doc.text(`R$ ${order.valor.toFixed(2)}`, 40, y);
    doc.text(endereco, 60, y);
    doc.text(cliente, 110, y);
    doc.setFontSize(8);
    doc.text(`${order.peso.toFixed(2)}`, 160, y);
    doc.text('_____________', 180, y);
    y += (endereco.length > cliente.length ? endereco.length : cliente.length) * 5 + 5;
  });

  // Divider
  y = checkPageLimit(y);
  doc.line(10, y, 200, y);
  y += 5;

  // Totalizadores
  doc.setFontSize(10);
  doc.text('TOTALIZADORES', 10, y);
  y += 5;
  doc.setFontSize(8);
  doc.text(`Total Peso: ${totalWeight.toFixed(2)} kg`, 20, y);
  doc.text(`Total Valor: R$ ${totalValue.toFixed(2)}`, 80, y);
  y += 5;
  doc.text('Assinatura do Motorista: ____________________', 10, y);
  y += 5;
  doc.text('Eu, o motorista acima assinado, assumo total responsabilidade pelas entregas descritas neste romaneio.', 10, y);

  // Adicionar rodapé final em todas as páginas
  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  // Salvar PDF
  doc.save(`Romaneio_Entrega_${delivery.id}.pdf`);
};

const DeliveryReport: React.FC<DeliveryReportProps> = ({ delivery, driver, vehicle, calculateTotalWeightAndValue, getRegionName }) => {
  // Este componente pode permanecer vazio, já que a lógica de geração de PDF foi movida para a função acima.
  return null;
};

export default DeliveryReport;
