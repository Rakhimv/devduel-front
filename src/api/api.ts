import axios, { AxiosError } from "axios";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Не делаем перезагрузку, пусть AuthContext сам обработает
    }
    return Promise.reject(error);
  }
);



export const register = async (data: RegisterCredentials) => {
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

export const login = async (data: LoginCredentials): Promise<{ user: User; token: string }> => {
  try {

    const response = await api.post("/auth/login", data);
    const { user, token } = response.data;
    
    localStorage.setItem("token", token);
    return { user, token };
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

export const logout = (): void => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};