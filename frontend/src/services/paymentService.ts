import { Payment } from '../types';

const API_URL = 'http://localhost:4000/payments';

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
