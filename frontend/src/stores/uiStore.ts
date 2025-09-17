import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface Modal {
  id: string;
  type: 'confirm' | 'info' | 'form';
  title: string;
  content: React.ReactNode | string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface UIState {
  // Loading states
  isGlobalLoading: boolean;
  loadingStates: Map<string, boolean>;
  
  // Toasts
  toasts: Toast[];
  
  // Modals
  modals: Modal[];
  
  // Sidebar
  isSidebarOpen: boolean;
  
  // Mobile
  isMobile: boolean;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Connection status
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

interface UIActions {
  // Loading
  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  getLoading: (key: string) => boolean;
  clearAllLoading: () => void;
  
  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Mobile
  setIsMobile: (mobile: boolean) => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Connection
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // State
      isGlobalLoading: false,
      loadingStates: new Map(),
      toasts: [],
      modals: [],
      isSidebarOpen: true,
      isMobile: false,
      theme: 'light',
      isConnected: false,
      connectionStatus: 'disconnected',

      // Actions
      setGlobalLoading: (loading: boolean) => {
        set({ isGlobalLoading: loading });
      },

      setLoading: (key: string, loading: boolean) => {
        set(state => {
          const newLoadingStates = new Map(state.loadingStates);
          if (loading) {
            newLoadingStates.set(key, true);
          } else {
            newLoadingStates.delete(key);
          }
          return { loadingStates: newLoadingStates };
        });
      },

      getLoading: (key: string) => {
        const state = get();
        return state.loadingStates.get(key) || false;
      },

      clearAllLoading: () => {
        set({ loadingStates: new Map() });
      },

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = {
          id,
          duration: 5000, // Default 5 seconds
          ...toast,
        };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      clearAllToasts: () => {
        set({ toasts: [] });
      },

      openModal: (modal: Omit<Modal, 'id'>) => {
        const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newModal: Modal = {
          id,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          ...modal,
        };

        set(state => ({
          modals: [...state.modals, newModal],
        }));

        return id;
      },

      closeModal: (id: string) => {
        set(state => ({
          modals: state.modals.filter(modal => modal.id !== id),
        }));
      },

      closeAllModals: () => {
        set({ modals: [] });
      },

      toggleSidebar: () => {
        set(state => ({
          isSidebarOpen: !state.isSidebarOpen,
        }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ isSidebarOpen: open });
      },

      setIsMobile: (mobile: boolean) => {
        set({ isMobile: mobile });
        
        // Auto-close sidebar on mobile
        if (mobile) {
          set({ isSidebarOpen: false });
        }
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Persist theme preference
        localStorage.setItem('theme', theme);
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        get().setTheme(currentTheme === 'light' ? 'dark' : 'light');
      },

      setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
        set({ 
          connectionStatus: status,
          isConnected: status === 'connected',
        });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);

// Helper functions for common UI actions
export const showToast = {
  success: (title: string, message?: string) => 
    useUIStore.getState().addToast({ type: 'success', title, message }),
  
  error: (title: string, message?: string) => 
    useUIStore.getState().addToast({ type: 'error', title, message }),
  
  warning: (title: string, message?: string) => 
    useUIStore.getState().addToast({ type: 'warning', title, message }),
  
  info: (title: string, message?: string) => 
    useUIStore.getState().addToast({ type: 'info', title, message }),
};

export const showModal = {
  confirm: (title: string, content: string, onConfirm: () => void, onCancel?: () => void) =>
    useUIStore.getState().openModal({
      type: 'confirm',
      title,
      content,
      onConfirm,
      onCancel,
    }),
  
  info: (title: string, content: React.ReactNode) =>
    useUIStore.getState().openModal({
      type: 'info',
      title,
      content,
    }),
};