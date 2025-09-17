import { api } from '../api'
import type { 
  Application, 
  ApplicationListResponse, 
  ApplicationListParams, 
  CreateApplicationRequest, 
  UpdateApplicationRequest 
} from '../../types/application.types'

class ApplicationService {
  async getApplications(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/applications?${queryString}` : '/applications'
    
    return await api.get<ApplicationListResponse>(url)
  }

  async getApplication(id: number): Promise<Application> {
    return await api.get<Application>(`/applications/${id}`)
  }

  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    return await api.post<Application>('/applications', data)
  }

  async updateApplication(id: number, data: UpdateApplicationRequest): Promise<Application> {
    return await api.patch<Application>(`/applications/${id}`, data)
  }

  async deleteApplication(id: number): Promise<void> {
    await api.delete(`/applications/${id}`)
  }
}

export const applicationService = new ApplicationService()