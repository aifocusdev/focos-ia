import React from 'react'
import { Tag, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Tag as TagType } from '../../types/tag.types'
import Button from '../ui/Button'
import { getTagColorStyle } from '../../utils/tagColors'

interface TagCardProps {
  tag: TagType
  onEdit: (tag: TagType) => void
  onDelete: (tag: TagType) => void
  isDeleting?: boolean
}

const TagCard: React.FC<TagCardProps> = ({ 
  tag, 
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
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
            style={getTagColorStyle(tag.color)}
          >
            <Tag className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {tag.name}
            </h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>ID: {tag.id}</p>
              <p>Criado {formatDate(tag.created_at)}</p>
              {tag.updated_at !== tag.created_at && (
                <p>Atualizado {formatDate(tag.updated_at)}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tag)}
            className="text-gray-300 hover:text-blue-400 hover:border-blue-500"
            disabled={isDeleting}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(tag)}
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

export default TagCard