
import api from '../config/api';

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  token: string;
  expiresAt: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data.data ?? response.data;
};

export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data.data ?? response.data;
};
