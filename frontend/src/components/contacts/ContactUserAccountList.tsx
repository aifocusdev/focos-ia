import React, { useState, useMemo } from 'react'
import { Edit2, Trash2, Calendar, Server, Smartphone, Monitor } from 'lucide-react'
import Button from '../ui/Button'
import { showModal } from '../../stores/uiStore'
import { useServers } from '../../hooks/data/useServers'
import { useApplications } from '../../hooks/data/useApplications'
import { useDevices } from '../../hooks/data/useDevices'
import type { ContactUserAccount } from '../../types/contact-user-accounts.types'
import { format } from 'date-fns'

interface ContactUserAccountListProps {
  accounts: ContactUserAccount[]
  isLoading: boolean
  isDeleting: boolean
  onEdit: (account: ContactUserAccount) => void
  onDelete: (accountId: number) => Promise<void>
}

const ContactUserAccountList: React.FC<ContactUserAccountListProps> = ({
  accounts,
  isLoading,
  isDeleting,
  onEdit,
  onDelete
}) => {
  const { servers } = useServers()
  const { applications } = useApplications()
  const { devices } = useDevices()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Create lookup maps for better performance
  const serverMap = useMemo(() => {
    return servers.reduce((map, server) => {
      map[server.id] = server.name
      return map
    }, {} as Record<number, string>)
  }, [servers])

  const applicationMap = useMemo(() => {
    return applications.reduce((map, app) => {
      map[app.id] = app.name
      return map
    }, {} as Record<number, string>)
  }, [applications])

  const deviceMap = useMemo(() => {
    return devices.reduce((map, device) => {
      map[device.id] = device.name
      return map
    }, {} as Record<number, string>)
  }, [devices])

  const handleDelete = (account: ContactUserAccount) => {
    showModal.confirm(
      'Excluir Conta',
      `Tem certeza que deseja excluir a conta "${account.username_final}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          setDeletingId(account.id)
          await onDelete(account.id)
        } catch (error) {
          console.error('Error deleting account:', error)
        } finally {
          setDeletingId(null)
        }
      }
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
    } catch {
      return 'Data inválida'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Carregando contas...</p>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="p-6 text-center">
        <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 text-lg mb-2">Nenhuma conta encontrada</p>
        <p className="text-gray-500 text-sm">Este contato ainda não possui contas de usuário cadastradas.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {accounts.map((account) => (
        <div 
          key={account.id} 
          className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                {account.username_final.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {account.username_final}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-medium border border-blue-500/30">
                    ID: {account.id}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-medium">Ativo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(account)}
                disabled={isDeleting}
                className="p-2.5 bg-gray-700/50 hover:bg-blue-600/20 hover:text-blue-400 border-gray-600/50"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(account)}
                disabled={isDeleting}
                loading={deletingId === account.id}
                className="p-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <div className="p-1.5 bg-green-500/10 rounded-md">
                  <Server className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Servidor</div>
                  <div className="text-sm text-white font-medium">
                    {serverMap[account.server_id] || `ID ${account.server_id}`}
                  </div>
                </div>
              </div>

              {account.application_id && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="p-1.5 bg-purple-500/10 rounded-md">
                    <Monitor className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Aplicação</div>
                    <div className="text-sm text-white font-medium">
                      {applicationMap[account.application_id] || `ID ${account.application_id}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {account.id_line_server && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="p-1.5 bg-blue-500/10 rounded-md">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Linha</div>
                    <div className="text-sm text-white font-medium">{account.id_line_server}</div>
                  </div>
                </div>
              )}

              {account.device_id && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="p-1.5 bg-orange-500/10 rounded-md">
                    <Smartphone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Dispositivo</div>
                    <div className="text-sm text-white font-medium">
                      {deviceMap[account.device_id] || `ID ${account.device_id}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expiration and Timestamps */}
          <div className="pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  Criado: <span className="text-gray-300">{formatDate(account.created_at)}</span>
                </span>
                {account.updated_at !== account.created_at && (
                  <span className="text-gray-400">
                    Atualizado: <span className="text-gray-300">{formatDate(account.updated_at)}</span>
                  </span>
                )}
              </div>
              
              {account.date_exp && (
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">Expira: {formatDate(account.date_exp)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactUserAccountList