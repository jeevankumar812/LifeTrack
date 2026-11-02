
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : 'http://192.168.1.33:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  console.log('API Request:', config.baseURL, config.url);
  return config;
});

export default api;
