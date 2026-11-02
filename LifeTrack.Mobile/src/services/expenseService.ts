
import api from '../config/api';

export interface Expense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  transactionDate: string;
  createdAt?: string;
}

export interface ExpenseData {
  title: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  transactionDate: string;
}

const getPayload = (response: any) => {
  return response.data?.data ?? response.data;
};

const authConfig = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getExpenses = async (
  token?: string
): Promise<Expense[]> => {
  const response = await api.get('/expenses', authConfig(token));
  const payload = getPayload(response);

  if (Array.isArray(payload)) return payload;

  return payload?.expenses ?? [];
};

export const createExpense = async (
  data: ExpenseData,
  token?: string
) => {
  const response = await api.post(
    '/expenses',
    data,
    authConfig(token)
  );

  return getPayload(response);
};

export const updateExpense = async (
  id: string,
  data: ExpenseData,
  token?: string
) => {
  const response = await api.put(
    `/expenses/${id}`,
    data,
    authConfig(token)
  );

  return getPayload(response);
};

export const deleteExpense = async (
  id: string,
  token?: string
) => {
  const response = await api.delete(
    `/expenses/${id}`,
    authConfig(token)
  );

  return getPayload(response);
};

export const getExpenseSummary = async (
  token?: string
) => {
  const response = await api.get(
    '/expenses/summary',
    authConfig(token)
  );

  return getPayload(response);
};
