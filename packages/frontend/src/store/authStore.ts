import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setAccessToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  firstName: string;
  lastName: string;
  firstNameNe?: string;
  lastNameNe?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await api.post('/auth/logout', { refreshToken }).catch(() => {});
        }
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            set({ isLoading: false });
            return;
          }

          const { data: tokenData } = await api.post('/auth/refresh', { refreshToken });
          setAccessToken(tokenData.accessToken);

          const { data: userData } = await api.get('/auth/me');
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
