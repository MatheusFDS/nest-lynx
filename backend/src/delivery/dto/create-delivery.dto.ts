export class CreateDeliveryDto {
  motoristaId: number;
  veiculoId: number;
  orders: number[]; // IDs dos pedidos associados a esta entrega
}
