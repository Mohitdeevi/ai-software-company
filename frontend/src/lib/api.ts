import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, setToken, clearToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization Bearer token from in-memory storage
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: on 401, attempt token refresh and retry original request
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token && config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      resolve(api(config));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or the request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If the failed request was the refresh endpoint itself, clear token and reject
    if (originalRequest.url?.includes('/auth/refresh')) {
      clearToken();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue requests while a refresh is in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      const newToken = data.data?.accessToken || data.accessToken;

      if (newToken) {
        setToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      }

      throw new Error('No token in refresh response');
    } catch (refreshError) {
      clearToken();
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper functions wrapping the axios instance
export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export default api;
