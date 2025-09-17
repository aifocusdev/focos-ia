export interface ContactUserAccount {
  id: number
  contact_id: number
  username_final: string
  server_id: number
  id_line_server?: number
  date_exp?: string
  application_id?: number
  device_id?: number
  created_at: string
  updated_at: string
}

export interface CreateContactUserAccountRequest {
  contact_id: number
  username_final: string
  password_final: string
  server_id: number
  id_line_server?: number
  date_exp?: string
  application_id?: number
  device_id?: number
}

export interface UpdateContactUserAccountRequest {
  username_final?: string
  password_final?: string
  server_id: number
  date_exp: string
  application_id?: number
  device_id?: number
}

export interface ContactUserAccountsResponse {
  accounts: ContactUserAccount[]
  total: number
}