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
  emailVerified?: boolean;
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

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password/' + token, { password });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-email/' + token);
    return response.data;
  },

  resendVerification: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },

  deleteAccount: async (password?: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/auth/account', {
      data: password ? { password } : {},
    });
    return response.data;
  },

  getNotificationSettings: async (): Promise<{ notificationSettings: any }> => {
    const response = await api.get<{ notificationSettings: any }>('/auth/notifications');
    return response.data;
  },

  updateNotificationSettings: async (settings: {
    emailOnAnalysisComplete?: boolean;
    emailOnRiskDetected?: boolean;
    emailOnMonthlyReport?: boolean;
    emailOnLimitReached?: boolean;
  }): Promise<{ notificationSettings: any }> => {
    const response = await api.patch<{ notificationSettings: any }>('/auth/notifications', settings);
    return response.data;
  },
};

