import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  contractsUsedThisMonth?: number;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string; password?: string; currentPassword?: string }): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

