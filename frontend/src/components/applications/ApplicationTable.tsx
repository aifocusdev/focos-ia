import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Table from '../ui/Table'
import Button from '../ui/Button'
import type { Application } from '../../types/application.types'

interface ApplicationTableProps {
  applications: Application[]
  isLoading?: boolean
  isDeleting?: boolean
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  emptyAction?: React.ReactNode
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
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
      render: (value: string) => (
        <div className="font-medium text-white truncate">{value}</div>
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
      render: (value: string, item: Application) => (
        <span className="text-sm text-gray-400">
          {item.updated_at !== item.created_at ? formatDate(value) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (_: unknown, application: Application) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(application)}
            className="text-gray-300 hover:text-blue-400 hover:border-blue-500 p-2"
            disabled={isDeleting}
            title="Editar aplicação"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(application)}
            className="text-gray-300 hover:text-red-400 hover:border-red-500 p-2"
            disabled={isDeleting}
            loading={isDeleting}
            title="Excluir aplicação"
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
      data={applications}
      isLoading={isLoading}
      loadingRows={10}
      emptyMessage="Nenhuma aplicação encontrada"
      emptyAction={emptyAction}
      className="shadow-sm"
    />
  )
}

export default ApplicationTable