import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { getUserDisplayName } from '../../utils/user';

/**
 * Custom hook for authentication functionality
 * Provides a convenient interface to auth store with error handling
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const { setLoading } = useUIStore();

  const login = async (username: string, password: string) => {
    setLoading('auth-login', true);
    try {
      await authStore.login(username, password);
    } finally {
      setLoading('auth-login', false);
    }
  };

  const logout = () => {
    authStore.logout();
  };

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Actions
    login,
    logout,
    setError: authStore.setError,
    clearError: authStore.clearError,

    // Computed
    isAdmin: authStore.user?.role === 'admin',
    isAgent: authStore.user?.role === 'agent' || authStore.user?.role === 'employer',
    userName: authStore.user ? getUserDisplayName(authStore.user) : 'Usuário',
  };
};