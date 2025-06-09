import { getApiUrl } from './utils/apiUtils';
import { Delivery, Order as AppOrder, Approval } from '../types'; // Garanta que Approval e AppOrder estão corretos

const API_URL = `${getApiUrl()}/delivery`;

export const fetchDeliveries = async (token: string): Promise<Delivery[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Tentar pegar mais detalhes do erro, se possível
    let errorMessage = 'Failed to fetch deliveries';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Se não conseguir parsear o JSON do erro, usa a mensagem padrão
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();

  // 1. Verificar se a resposta principal (responseData) é um array
  if (!Array.isArray(responseData)) {
    console.error('API response is not an array for deliveries:', responseData);
    return []; // Retorna um array vazio ou lança um erro mais específico
  }

  const deliveries: Delivery[] = responseData.map((delivery: any) => {
    // 2. Mapear 'orders' com segurança, tratando se for undefined ou não for array
    const orders = (Array.isArray(delivery.orders) ? delivery.orders : []).map((order: any) => ({
      id: order.id,
      numero: order.numero,
      cliente: order.cliente,
      valor: order.valor,
      peso: order.peso,
      data: order.data,
      idCliente: order.idCliente,
      endereco: order.endereco,
      cidade: order.cidade,
      uf: order.uf,
      volume: order.volume,
      prazo: order.prazo,
      prioridade: order.prioridade,
      telefone: order.telefone,
      email: order.email,
      bairro: order.bairro,
      instrucoesEntrega: order.instrucoesEntrega,
      nomeContato: order.nomeContato,
      cpfCnpj: order.cpfCnpj,
      cep: order.cep,
      status: order.status,
      tenantId: order.tenantId,
      sorting: order.sorting,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Certifique-se que todos os campos esperados pelo tipo AppOrder estejam aqui
    }));

    // 3. Mapear 'liberacoes' (para 'approvals') com segurança
    const approvals = (Array.isArray(delivery.liberacoes) ? delivery.liberacoes : []).map((approval: any) => ({
      id: approval.id,
      deliveryId: approval.deliveryId,
      tenantId: approval.tenantId,
      action: approval.action,
      motivo: approval.motivo,
      userId: approval.userId,
      createdAt: approval.createdAt,
      userName: approval.User?.name || 'N/A', // Mantém o optional chaining se User pode ser undefined
      User: approval.User, // Se precisar do objeto User completo
      // Certifique-se que todos os campos esperados pelo tipo Approval estejam aqui
    }));

    // Retornar o objeto delivery completo, conforme o tipo Delivery
    // O spread '...delivery' assume que a maioria das propriedades já vem com o nome correto.
    // As propriedades mapeadas (orders, approvals) sobrescrevem as do spread se tiverem o mesmo nome,
    // ou são adicionadas.
    return {
      ...delivery,
      orders: orders,
      approvals: approvals,
      // Se 'Driver' e 'Vehicle' vêm com esses nomes da API e na estrutura correta,
      // o spread já os inclui. Se os nomes ou estruturas forem diferentes,
      // eles precisariam de mapeamento explícito também.
      // Ex: Driver: delivery.AlgumNomeParaDriver || undefined,
      // Ex: Vehicle: delivery.AlgumNomeParaVehicle || undefined,
    };
  });

  return deliveries;
};

export const addDelivery = async (token: string, data: any): Promise<any> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to add delivery:', errorData);
    throw new Error(errorData.message || 'Failed to add delivery');
  }

  return await response.json();
};

export const updateDelivery = async (token: string, id: string, data: any): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to update delivery:', errorData);
    throw new Error('Failed to update delivery');
  }
};

export const deleteDelivery = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to delete delivery:', errorData);
    throw new Error('Failed to delete delivery');
  }
};

export const removeOrderFromDelivery = async (token: string, deliveryId: string, orderId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${deliveryId}/remove-order/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to remove order from delivery:', errorData);
    throw new Error('Failed to remove order from delivery');
  }
};

export const releaseDelivery = async (token: string, id: string): Promise<any> => {
  const response = await fetch(`${API_URL}/${id}/release`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to release delivery');
  }

  return await response.json();
};

export const rejectRelease = async (token: string, id: string, motivo: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ motivo }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to reject delivery';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch(e) {
      // Mantém a mensagem padrão se o corpo do erro não for JSON
    }
    throw new Error(errorMessage);
  }
  // Não há um response.json() para retornar aqui se o status for 2xx mas sem corpo,
  // ou se a função é Promise<void> e não deve retornar nada em caso de sucesso.
  // Se a API retorna algo no sucesso, ajuste o tipo de retorno e adicione: return await response.json();
};
