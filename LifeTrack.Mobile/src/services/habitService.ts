
import api from '../config/api';

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  frequency: string;
  isActive: boolean;
  createdAt?: string;
  completedToday: boolean;
}

export interface HabitData {
  name: string;
  description: string;
  frequency: string;
  isActive?: boolean;
}

export interface HabitProgress {
  habitId: string;
  habitName: string;
  totalDays: number;
  completedDays: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
}

const getPayload = (response: any) => {
  return response.data?.data ?? response.data;
};

const authConfig = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getHabits = async (token?: string): Promise<Habit[]> => {
  const response = await api.get('/habits', authConfig(token));
  const payload = getPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.habits ?? [];
};

export const getHabit = async (id: string, token?: string) => {
  const response = await api.get(`/habits/${id}`, authConfig(token));
  return getPayload(response);
};

export const createHabit = async (
  data: HabitData,
  token?: string
) => {
  const response = await api.post('/habits', data, authConfig(token));
  return getPayload(response);
};

export const updateHabit = async (
  id: string,
  data: HabitData,
  token?: string
) => {
  const response = await api.put(
    `/habits/${id}`,
    data,
    authConfig(token)
  );

  return getPayload(response);
};

export const deleteHabit = async (id: string, token?: string) => {
  const response = await api.delete(
    `/habits/${id}`,
    authConfig(token)
  );

  return getPayload(response);
};

export const completeHabit = async (id: string, token?: string) => {
  const response = await api.post(
    `/habits/${id}/complete`,
    {},
    authConfig(token)
  );

  return getPayload(response);
};

export const undoHabitCompletion = async (
  id: string,
  token?: string
) => {
  const response = await api.delete(
    `/habits/${id}/complete`,
    authConfig(token)
  );

  return getPayload(response);
};

export const getHabitProgress = async (
  id: string,
  token?: string,
  days: number = 30
): Promise<HabitProgress> => {
  const response = await api.get(
    `/habits/${id}/progress`,
    {
      ...authConfig(token),
      params: { days },
    }
  );

  return getPayload(response);
};
