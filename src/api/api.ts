import axios, { AxiosError } from "axios";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/logout') &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register')) {
      originalRequest._retry = true;
      
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        window.history.pushState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (data: RegisterCredentials): Promise<{ user: User }> => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data; 
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при регистрации"
    );
  }
};

export const login = async (data: LoginCredentials): Promise<{ user: User }> => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data; 
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при авторизации"
    );
  }
};

export const getUser = async (): Promise<User> => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при получении данных пользователя"
    );
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Ошибка при выходе");
  }
};

export const runCode = async (data: {
  source_code: string;
  language: string;
  stdin?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}): Promise<{ output: string; status: any; time?: string; memory?: number }> => {
  try {
    const response = await api.post("/code/run", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при выполнении кода"
    );
  }
};