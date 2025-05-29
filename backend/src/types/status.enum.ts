// Status dos PEDIDOS INDIVIDUAIS (Orders)
export enum OrderStatus {
  PENDENTE = 'Pendente',                    // Quando a order não tem roteiro
  EM_ROTA = 'Em rota',                     // Quando tem um roteiro
  ENTREGA_INICIADA = 'Entrega Iniciada',   // Quando o motorista sinaliza que está indo
  ENTREGA_FINALIZADA = 'Entrega Finalizada', // Quando deu tudo certo
  ENTREGA_RETORNADA = 'Entrega Retornada'  // Quando houve problema
}

// Status dos ROTEIROS (Deliveries)
export enum DeliveryStatus {
  A_LIBERAR = 'A liberar',                 // Precisa de aprovação
  PENDENTE = 'Pendente',                   // Ainda não foi finalizado
  FINALIZADO = 'Finalizado'                // Todas as entregas foram finalizadas ou retornadas
}

// 🔧 MOBILE: Types atualizados (types/index.ts)
export type OrderStatusMobile = 
  | 'pendente'          // Pendente
  | 'em_rota'          // Em rota  
  | 'iniciada'         // Entrega Iniciada
  | 'finalizada'       // Entrega Finalizada
  | 'retornada';       // Entrega Retornada

export type RouteStatusMobile = 
  | 'a_liberar'        // A liberar
  | 'pendente'         // Pendente
  | 'finalizado';      // Finalizado

// 🔧 MAPEAMENTO: Backend ↔ Mobile
export const STATUS_MAPPING = {
  // Order Status: Backend → Mobile
  ORDER_TO_MOBILE: {
    'Pendente': 'pendente',
    'Em rota': 'em_rota',
    'Entrega Iniciada': 'iniciada',
    'Entrega Finalizada': 'finalizada',
    'Entrega Retornada': 'retornada'
  },
  
    // Order Status: Mobile → Backend
  MOBILE_TO_ORDER: {
    'pendente': 'Pendente',
    'em_rota': 'Em rota',
    'iniciada': 'Entrega Iniciada',
    'finalizada': 'Entrega Finalizada',
    'retornada': 'Entrega Retornada'
  },
  
  // Delivery Status: Backend → Mobile  
  DELIVERY_TO_MOBILE: {
    'A liberar': 'a_liberar',
    'Pendente': 'pendente',
    'Finalizado': 'finalizado'
  },
  
  // Delivery Status: Mobile → Backend
  MOBILE_TO_DELIVERY: {
    'a_liberar': 'A liberar',
    'pendente': 'Pendente',
    'finalizado': 'Finalizado'
  }
};