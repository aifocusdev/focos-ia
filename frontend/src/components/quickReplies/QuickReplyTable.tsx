import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Table from '../ui/Table'
import Button from '../ui/Button'
import type { QuickReply } from '../../types/quickReply.types'

interface QuickReplyTableProps {
  quickReplies: QuickReply[]
  isLoading?: boolean
  isDeleting?: boolean
  onEdit: (quickReply: QuickReply) => void
  onDelete: (quickReply: QuickReply) => void
  emptyAction?: React.ReactNode
}

const QuickReplyTable: React.FC<QuickReplyTableProps> = ({
  quickReplies,
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

  const truncateBody = (body: string, maxLength: number = 60) => {
    return body.length > maxLength ? `${body.substring(0, maxLength)}...` : body
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
      key: 'title',
      header: 'Título',
      className: 'min-w-0',
      render: (value: string) => (
        <div className="font-medium text-white truncate">{value}</div>
      )
    },
    {
      key: 'shortcut',
      header: 'Shortcut',
      className: 'w-24',
      render: (value: string) => (
        <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded text-blue-400">
          {value}
        </span>
      )
    },
    {
      key: 'body',
      header: 'Conteúdo',
      className: 'min-w-0 max-w-xs hidden md:table-cell',
      render: (value: string) => (
        <div className="text-sm text-gray-300 truncate" title={value}>
          {truncateBody(value)}
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
      className: 'w-32 hidden lg:table-cell',
      render: (value: string, item: QuickReply) => (
        <span className="text-sm text-gray-400">
          {item.updated_at !== item.created_at ? formatDate(value) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (_: unknown, quickReply: QuickReply) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(quickReply)}
            className="text-gray-300 hover:text-blue-400 hover:border-blue-500 p-2"
            disabled={isDeleting}
            title="Editar resposta rápida"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(quickReply)}
            className="text-gray-300 hover:text-red-400 hover:border-red-500 p-2"
            disabled={isDeleting}
            loading={isDeleting}
            title="Excluir resposta rápida"
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
      data={quickReplies}
      isLoading={isLoading}
      loadingRows={10}
      emptyMessage="Nenhuma resposta rápida encontrada"
      emptyAction={emptyAction}
      className="shadow-sm"
    />
  )
}

export default QuickReplyTable