// Conteúdo para: status.enum.ts

// Status dos PEDIDOS INDIVIDUAIS (Orders)
export enum OrderStatus {
  SEM_ROTA = 'Sem rota',                                  // Pedido não atribuído a um roteiro
  EM_ROTA_AGUARDANDO_LIBERACAO = 'Em rota, aguardando liberação', // Pedido em roteiro que precisa de aprovação
  EM_ROTA = 'Em rota',                                    // Pedido em roteiro liberado/iniciado
  EM_ENTREGA = 'Em entrega',                              // Motorista está a caminho do cliente para este pedido
  ENTREGUE = 'Entregue',                                  // Entrega bem-sucedida
  NAO_ENTREGUE = 'Não entregue'                           // Tentativa de entrega falhou (com motivo)
}

// Status dos ROTEIROS (Deliveries)
export enum DeliveryStatus {
  A_LIBERAR = 'A liberar',         // Roteiro aguardando aprovação
  INICIADO = 'Iniciado',           // Roteiro liberado e em andamento
  FINALIZADO = 'Finalizado',       // Todas as entregas do roteiro foram processadas
  REJEITADO = 'Rejeitado'          // Roteiro foi rejeitado durante a liberação
}

// (Opcional, mas útil) Ações de Aprovação
export enum ApprovalAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}


// MAPEAMENTO: Backend ↔ Mobile (Atualizado)
// Se o mobile for atualizado para usar os novos enums diretamente, este mapeamento pode ser simplificado.
export const STATUS_MAPPING = {
  ORDER_TO_MOBILE: {
    [OrderStatus.SEM_ROTA]: 'sem_rota',
    [OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO]: 'em_rota_aguardando_liberacao', // Novo
    [OrderStatus.EM_ROTA]: 'em_rota',
    [OrderStatus.EM_ENTREGA]: 'iniciada',
    [OrderStatus.ENTREGUE]: 'finalizada',
    [OrderStatus.NAO_ENTREGUE]: 'retornada'
  },
  MOBILE_TO_ORDER: {
    'sem_rota': OrderStatus.SEM_ROTA,
    'em_rota_aguardando_liberacao': OrderStatus.EM_ROTA_AGUARDANDO_LIBERACAO, // Novo
    'em_rota': OrderStatus.EM_ROTA,
    'iniciada': OrderStatus.EM_ENTREGA,
    'finalizada': OrderStatus.ENTREGUE,
    'retornada': OrderStatus.NAO_ENTREGUE
  },
  DELIVERY_TO_MOBILE: {
    [DeliveryStatus.A_LIBERAR]: 'a_liberar',   // Novo/Reintroduzido
    [DeliveryStatus.INICIADO]: 'pendente',    // 'Iniciado' no backend pode ser 'pendente'/'ativo' no mobile
    [DeliveryStatus.FINALIZADO]: 'finalizado',
    [DeliveryStatus.REJEITADO]: 'rejeitado'    // Novo
  },
  MOBILE_TO_DELIVERY: {
    'a_liberar': DeliveryStatus.A_LIBERAR,  // Novo/Reintroduzido
    'pendente': DeliveryStatus.INICIADO,
    'finalizado': DeliveryStatus.FINALIZADO,
    'rejeitado': DeliveryStatus.REJEITADO   // Novo
  }
};

// Modelos de motivo para não entrega (Exemplo)
export interface MotivoNaoEntrega {
  codigo: string;
  descricao: string;
}

export const MOTIVOS_NAO_ENTREGA: MotivoNaoEntrega[] = [
  { codigo: 'AUSENTE', descricao: 'Destinatário ausente' },
  { codigo: 'END_INC', descricao: 'Endereço incorreto/incompleto' },
  { codigo: 'RECUSADO', descricao: 'Recusado pelo destinatário' },
  { codigo: 'AVARIA', descricao: 'Produto avariado' },
  { codigo: 'OUTRO', descricao: 'Outro motivo (especificar)' },
];