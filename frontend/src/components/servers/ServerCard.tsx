import React from 'react'
import { Server, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Server as ServerType } from '../../types/server.types'
import Button from '../ui/Button'

interface ServerCardProps {
  server: ServerType
  onEdit: (server: ServerType) => void
  onDelete: (server: ServerType) => void
  isDeleting?: boolean
}

const ServerCard: React.FC<ServerCardProps> = ({ 
  server, 
  onEdit, 
  onDelete, 
  isDeleting = false 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Server className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {server.name}
            </h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>ID: {server.id}</p>
              <p>Criado {formatDate(server.created_at)}</p>
              {server.updated_at !== server.created_at && (
                <p>Atualizado {formatDate(server.updated_at)}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(server)}
            className="text-gray-300 hover:text-blue-400 hover:border-blue-500"
            disabled={isDeleting}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(server)}
            className="text-gray-300 hover:text-red-400 hover:border-red-500"
            disabled={isDeleting}
            loading={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServerCard