
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  AuthResponse,
  LoginData,
  RegisterData,
  loginUser,
  registerUser,
} from '../services/authService';

import {
  saveItem,
  getItem,
  removeItem,
} from '../utils/storage';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getItem('token');
        const userData = await getItem('user');

        if (token && userData) {
          setUser({
            ...JSON.parse(userData),
            token,
          });
        }
      } catch (error) {
        console.log('Session loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const saveSession = async (data: AuthResponse) => {
    const { token, ...userData } = data;

    await saveItem('token', token);
    await saveItem('user', JSON.stringify(userData));

    setUser(data);
  };

  const login = async (data: LoginData) => {
    const result = await loginUser(data);
    await saveSession(result);
  };

  const register = async (data: RegisterData) => {
    const result = await registerUser(data);
    await saveSession(result);
  };

  const logout = async () => {
    await removeItem('token');
    await removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
