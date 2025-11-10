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
    if (error instanceof AxiosError && error.response?.status === 403 && error.response?.data?.is_banned) {
      throw { ...error, isBanned: true, message: error.response.data.message };
    }
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

export const submitTaskSolution = async (data: {
  gameId: string;
  taskId: number;
  source_code: string;
  language: string;
  isRunTest?: boolean;
}): Promise<{ success: boolean; testResults: Array<{ input: string; expected: string; actual: string; passed: boolean }>; levelUp?: boolean; gameFinished?: boolean }> => {
  try {
    const response = await api.post("/game/submit", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при отправке решения задачи"
    );
  }
};

export const getTaskByLevel = async (level: number): Promise<any> => {
  try {
    const response = await api.get(`/code/task/level/${level}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при получении задачи"
    );
  }
};

export const getTaskTemplate = async (taskId: number, language: string): Promise<{ template: string; functionSignature: string }> => {
  try {
    const response = await api.get(`/game/task/${taskId}/template?language=${language}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при получении шаблона задачи"
    );
  }
};

export const getGameProgress = async (gameId: string): Promise<{
  currentLevel: number;
  playerLevel: number;
  opponentLevel: number;
  currentTask: any;
  solvedTasks: number[];
}> => {
  try {
    const response = await api.get(`/game/progress/${gameId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "Ошибка при получении прогресса игры"
    );
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    await api.delete("/users/delete");
  } catch (error) {
    throw new Error(
      error instanceof AxiosError && error.response?.data?.error
        ? error.response.data.error
        : "Ошибка при удалении аккаунта"
    );
  }
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  banUser: async (userId: number) => {
    const response = await api.post(`/admin/users/${userId}/ban`);
    return response.data;
  },
  unbanUser: async (userId: number) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },
  getTasks: async () => {
    const response = await api.get("/admin/tasks");
    return response.data;
  },
  createTask: async (task: any) => {
    const response = await api.post("/admin/tasks", task);
    return response.data;
  },
  updateTask: async (taskId: number, task: any) => {
    const response = await api.put(`/admin/tasks/${taskId}`, task);
    return response.data;
  },
  deleteTask: async (taskId: number) => {
    const response = await api.delete(`/admin/tasks/${taskId}`);
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get("/admin/statistics");
    return response.data;
  },
  testTask: async (taskId: number, languageId: number, code: string) => {
    const response = await api.post(`/admin/tasks/${taskId}/test`, { languageId, code });
    return response.data;
  }
};