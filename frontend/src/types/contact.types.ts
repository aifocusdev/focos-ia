export interface Contact {
  id: number
  external_id: string | null
  name: string
  phone_number: string
  notes: string | null
  accepts_remarketing: boolean
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
  updated_at?: string
}

export interface ContactUserAccount {
  id: number
  contact_id: number
  username_final: string
  server_id: number
  id_line_server: number
  date_exp: string
  application_id: number
  device_id: number
  created_at: string
  updated_at: string
  server: {
    id: number
    name: string
    host: string
  }
  application: {
    id: number
    name: string
  }
  device: {
    id: number
    name: string
  }
}

export interface ContactFilters {
  page?: number
  limit?: number
  search?: string
  external_id?: string
  tag_ids?: number[]
  include_tags?: boolean
  date_exp_from?: string
  date_exp_to?: string
}

export interface TagFilters {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ContactResponse = PaginatedResponse<Contact>
export type TagResponse = PaginatedResponse<Tag>

export interface ContactProfileData {
  contact: Contact
  userAccounts: ContactUserAccount[]
}