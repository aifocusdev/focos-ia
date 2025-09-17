import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

class ApiService {
  private api: AxiosInstance

  private extractErrorMessage(error: AxiosError): string {
    // Verifica se há uma mensagem específica na resposta da API
    if (error.response?.data) {
      const data = error.response.data as any
      
      // Formato típico de erro do NestJS com validação
      if (data.message) {
        if (Array.isArray(data.message)) {
          return data.message.join(', ')
        }
        return data.message
      }
      
      // Outros formatos possíveis de erro
      if (data.error) {
        return data.error
      }
      
      if (data.detail) {
        return data.detail
      }
    }
    
    // Fallback para erros de rede ou outros tipos
    if (error.message) {
      return error.message
    }
    
    return 'Erro desconhecido'
  }

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const isLoginRequest = error.config?.url?.includes('/auth/login')
          if (!isLoginRequest) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('currentUser')
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        }
        
        // Adiciona a mensagem específica da API ao erro
        const specificMessage = this.extractErrorMessage(error)
        const enhancedError = new Error(specificMessage)
        enhancedError.name = error.name
        ;(enhancedError as any).response = error.response
        ;(enhancedError as any).request = error.request
        ;(enhancedError as any).config = error.config
        ;(enhancedError as any).status = error.response?.status
        
        return Promise.reject(enhancedError)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    })
    return response.data
  }
}

export const api = new ApiService()