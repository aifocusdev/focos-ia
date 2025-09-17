import React from 'react'
import { Server, Smartphone, Calendar, User } from 'lucide-react'
import type { ContactUserAccount } from '../../types/contact.types'

interface ContactUserAccountsProps {
  userAccounts: ContactUserAccount[]
}

const ContactUserAccounts: React.FC<ContactUserAccountsProps> = ({ userAccounts }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExpirationStatus = (expDate: string) => {
    const now = new Date()
    const expiration = new Date(expDate)
    const daysDiff = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 3600 * 24))
    
    if (daysDiff < 0) {
      return { status: 'expired', text: 'Expirado', color: 'text-red-400 bg-red-900/20' }
    } else if (daysDiff <= 7) {
      return { status: 'expiring', text: `${daysDiff} dias`, color: 'text-yellow-400 bg-yellow-900/20' }
    } else {
      return { status: 'active', text: `${daysDiff} dias`, color: 'text-green-400 bg-green-900/20' }
    }
  }

  if (userAccounts.length === 0) {
    return (
      <div className="text-center py-6">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400">Nenhuma conta vinculada a este contato.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {userAccounts.map((account) => {
        const expStatus = getExpirationStatus(account.date_exp)
        
        return (
          <div key={account.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            {/* Header with username */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-blue-400 mr-2" />
                <h4 className="font-semibold text-white">{account.username_final}</h4>
              </div>
              <span className="text-xs text-gray-400">ID: {account.id}</span>
            </div>

            {/* Account details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Server */}
              <div className="flex items-center">
                <Server className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{account.server?.name || 'Servidor não informado'}</p>
                  <p className="text-xs text-gray-400">{account.server?.host || 'Host não informado'}</p>
                </div>
              </div>

              {/* Application */}
              <div className="flex items-center">
                <Smartphone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{account.application?.name || 'Aplicação não informada'}</p>
                  <p className="text-xs text-gray-400">Device: {account.device?.name || 'Device não informado'}</p>
                </div>
              </div>

              {/* Expiration */}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <div className="flex items-center">
                    <span className="text-gray-300 mr-2">Expira em:</span>
                    <span className={`px-2 py-1 rounded text-xs ${expStatus.color}`}>
                      {expStatus.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(account.date_exp)}</p>
                </div>
              </div>

              {/* Line Server ID */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full mr-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Line Server ID</p>
                  <p className="text-xs text-gray-400">{account.id_line_server}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-400 gap-1">
                <span>Criado: {formatDate(account.created_at)}</span>
                <span>Atualizado: {formatDate(account.updated_at)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContactUserAccounts