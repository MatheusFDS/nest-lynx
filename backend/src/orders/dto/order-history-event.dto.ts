// Em backend/src/orders/dto/order-history-event.dto.ts

export class OrderHistoryEventDto {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  user?: string;
  details?: {
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    proofUrl?: string;
    deliveryId?: string;
    driverName?: string;
    vehiclePlate?: string;
    finalStatus?: string;
    deliveryStatus?: string; // <--- ADICIONADO
  };
}