
import api from '../config/api';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'Low' | 'Medium' | 'High';
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TaskData {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'Low' | 'Medium' | 'High';
}

const getPayload = (response: any) =>
  response.data?.data ?? response.data;

export const getTasks = async (
  status?: 'pending' | 'completed',
  token?: string
): Promise<Task[]> => {
  const response = await api.get('/tasks', {
    params: status ? { status } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = getPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.tasks ?? [];
};

export const createTask = async (
  data: TaskData,
  token?: string
) => {
  const response = await api.post('/tasks', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getPayload(response);
};

export const updateTask = async (
  id: string,
  data: TaskData & { isCompleted: boolean },
  token?: string
) => {
  const response = await api.put(`/tasks/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getPayload(response);
};

export const completeTask = async (
  id: string,
  token?: string
) => {
  const response = await api.patch(
    `/tasks/${id}/complete`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return getPayload(response);
};

export const deleteTask = async (
  id: string,
  token?: string
) => {
  const response = await api.delete(`/tasks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getPayload(response);
};
