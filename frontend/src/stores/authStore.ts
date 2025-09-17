import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService, type User } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (username: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await authService.login(username, password);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },

        logout: () => {
          authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        },

        setUser: (user: User | null) => {
          set({
            user,
            isAuthenticated: !!user,
          });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        initialize: () => {
          try {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('currentUser');
            
            if (token && userStr) {
              const user = JSON.parse(userStr) as User;
              set({
                user,
                isAuthenticated: true,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
              });
            }
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);