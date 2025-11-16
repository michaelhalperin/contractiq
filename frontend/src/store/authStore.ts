import { create } from 'zustand';
import { authService, type User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      const response = await authService.register({ email, password, name });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

