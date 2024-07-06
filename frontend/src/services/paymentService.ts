import { Payment, Delivery } from '../types';

const API_URL = 'http://localhost:4000/payments';
const DELIVERY_API_URL = 'http://localhost:4000/delivery';

export const fetchPayments = async (token: string): Promise<Payment[]> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }

  return response.json();
};

export const updatePaymentStatus = async (token: string, id: number, status: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update payment status');
  }
};

export const fetchDeliveryDetails = async (token: string, deliveryId: number): Promise<Delivery> => {
  const response = await fetch(`${DELIVERY_API_URL}/${deliveryId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch delivery details');
  }

  return response.json();
};

export const groupPayments = async (token: string, paymentIds: number[]): Promise<Payment> => {
  const response = await fetch(`${API_URL}/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ paymentIds }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to group payments: ${errorMessage}`);
  }

  return response.json();
};

export const ungroupPayments = async (token: string, paymentId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/ungroup/${paymentId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to ungroup payment: ${errorMessage}`);
  }
};
