import { useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'

export interface ToastOptions {
  duration?: number
}

export const useToast = () => {
  const addToast = useUIStore(state => state.addToast)
  const removeToast = useUIStore(state => state.removeToast)
  const clearAllToasts = useUIStore(state => state.clearAllToasts)

  const toast = {
    success: useCallback((title: string, message?: string, options?: ToastOptions) => {
      return addToast({
        type: 'success',
        title,
        message,
        duration: options?.duration
      })
    }, [addToast]),

    error: useCallback((title: string, message?: string, options?: ToastOptions) => {
      return addToast({
        type: 'error',
        title,
        message,
        duration: options?.duration
      })
    }, [addToast]),

    warning: useCallback((title: string, message?: string, options?: ToastOptions) => {
      return addToast({
        type: 'warning',
        title,
        message,
        duration: options?.duration
      })
    }, [addToast]),

    info: useCallback((title: string, message?: string, options?: ToastOptions) => {
      return addToast({
        type: 'info',
        title,
        message,
        duration: options?.duration
      })
    }, [addToast]),

    // Convenience methods
    promise: useCallback(async <T>(
      promise: Promise<T>,
      {
        loading,
        success,
        error
      }: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ): Promise<T> => {
      const toastId = addToast({
        type: 'info',
        title: loading,
        duration: 0 // Don't auto-remove
      })

      try {
        const result = await promise
        
        removeToast(toastId)
        
        const successMessage = typeof success === 'function' ? success(result) : success
        addToast({
          type: 'success',
          title: successMessage
        })

        return result
      } catch (err) {
        removeToast(toastId)
        
        const errorMessage = typeof error === 'function' ? error(err) : error
        addToast({
          type: 'error',
          title: errorMessage
        })

        throw err
      }
    }, [addToast, removeToast])
  }

  return {
    toast,
    removeToast,
    clearAllToasts
  }
}

// Standalone toast functions (can be used outside components)
export const toast = {
  success: (title: string, message?: string, options?: ToastOptions) => {
    return useUIStore.getState().addToast({
      type: 'success',
      title,
      message,
      duration: options?.duration
    })
  },

  error: (title: string, message?: string, options?: ToastOptions) => {
    return useUIStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: options?.duration
    })
  },

  warning: (title: string, message?: string, options?: ToastOptions) => {
    return useUIStore.getState().addToast({
      type: 'warning',
      title,
      message,
      duration: options?.duration
    })
  },

  info: (title: string, message?: string, options?: ToastOptions) => {
    return useUIStore.getState().addToast({
      type: 'info',
      title,
      message,
      duration: options?.duration
    })
  },

  promise: async <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ): Promise<T> => {
    const store = useUIStore.getState()
    const toastId = store.addToast({
      type: 'info',
      title: loading,
      duration: 0
    })

    try {
      const result = await promise
      
      store.removeToast(toastId)
      
      const successMessage = typeof success === 'function' ? success(result) : success
      store.addToast({
        type: 'success',
        title: successMessage
      })

      return result
    } catch (err) {
      store.removeToast(toastId)
      
      const errorMessage = typeof error === 'function' ? error(err) : error
      store.addToast({
        type: 'error',
        title: errorMessage
      })

      throw err
    }
  }
}