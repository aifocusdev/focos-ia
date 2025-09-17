import { useAuthStore } from '../../stores/authStore';

/**
 * Custom hook for authentication functionality
 * Provides a convenient interface to auth store with error handling
 */
export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Actions
    login: authStore.login,
    logout: authStore.logout,
    setError: authStore.setError,
    clearError: authStore.clearError,

    // Computed
    isAdmin: authStore.user?.role_id === 1,
    isAgent: authStore.user?.role_id === 2,
    userName: authStore.user?.name || 'Usuário',
  };
};