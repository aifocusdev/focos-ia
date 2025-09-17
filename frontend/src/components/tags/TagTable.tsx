import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Table from '../ui/Table'
import Button from '../ui/Button'
import type { Tag } from '../../types/tag.types'
import { getTagColorStyle } from '../../utils/tagColors'

interface TagTableProps {
  tags: Tag[]
  isLoading?: boolean
  isDeleting?: boolean
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
  emptyAction?: React.ReactNode
}

const TagTable: React.FC<TagTableProps> = ({
  tags,
  isLoading = false,
  isDeleting = false,
  onEdit,
  onDelete,
  emptyAction
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-20',
      render: (value: number) => (
        <span className="font-mono text-sm text-gray-400">#{value}</span>
      )
    },
    {
      key: 'name',
      header: 'Nome',
      className: 'min-w-0',
      render: (value: string, tag: Tag) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full border border-gray-600"
            style={getTagColorStyle(tag.color)}
          />
          <div className="font-medium text-white truncate">{value}</div>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Criado em',
      className: 'w-32 hidden sm:table-cell',
      render: (value: string) => (
        <span className="text-sm text-gray-400">{formatDate(value)}</span>
      )
    },
    {
      key: 'updated_at',
      header: 'Atualizado em',
      className: 'w-32 hidden md:table-cell',
      render: (value: string, item: Tag) => (
        <span className="text-sm text-gray-400">
          {item.updated_at !== item.created_at ? formatDate(value) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (_: unknown, tag: Tag) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tag)}
            className="text-gray-300 hover:text-blue-400 hover:border-blue-500 p-2"
            disabled={isDeleting}
            title="Editar tag"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(tag)}
            className="text-gray-300 hover:text-red-400 hover:border-red-500 p-2"
            disabled={isDeleting}
            loading={isDeleting}
            title="Excluir tag"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      data={tags}
      isLoading={isLoading}
      loadingRows={10}
      emptyMessage="Nenhuma tag encontrada"
      emptyAction={emptyAction}
      className="shadow-sm"
    />
  )
}

export default TagTable