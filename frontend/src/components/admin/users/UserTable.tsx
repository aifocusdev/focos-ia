import React from 'react'
import { Edit, Trash2, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react'
import { useUserStore } from '../../../stores/userStore'
import LoadingSpinner from '../../ui/LoadingSpinner'
import type { User } from '../../../types/user.types'

interface UserTableProps {
  onEditUser: (user: User) => void
  onDeleteUser: (user: User) => void
}

const UserTable: React.FC<UserTableProps> = ({ onEditUser, onDeleteUser }) => {
  const { 
    users, 
    total, 
    page, 
    limit, 
    totalPages, 
    loading, 
    setPage, 
    fetchUsers 
  } = useUserStore()

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      await fetchUsers()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleName = (roleId: number) => {
    // Mapear role_id para nome - você pode expandir isso conforme necessário
    const roleMap: { [key: number]: string } = {
      1: 'Admin',
      2: 'Operador',
      3: 'Usuário'
    }
    return roleMap[roleId] || 'Desconhecido'
  }

  const getContactTypePreferenceName = (preference: 'ads' | 'all' | 'support') => {
    const typeMap = {
      'ads': 'Anúncios',
      'all': 'Todos',
      'support': 'Suporte'
    }
    return typeMap[preference]
  }

  if (loading && users.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-gray-300">Carregando usuários...</span>
        </div>
      </div>
    )
  }

  if (!loading && users.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-400">
            Não há usuários cadastrados ou que correspondam aos filtros aplicados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tipo de Contato
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                    {getRoleName(user.role_id)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.contact_type_preference === 'ads' 
                        ? 'bg-purple-900 text-purple-200' 
                        : user.contact_type_preference === 'support' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-orange-900 text-orange-200'
                    }`}>
                      {getContactTypePreferenceName(user.contact_type_preference)}
                    </span>
                    {user.contact_type_restriction && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-900 text-red-200" title="Restrição ativa">
                        R
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Editar usuário"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Deletar usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-600">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-300">
                Mostrando{' '}
                <span className="font-medium">{((page - 1) * limit) + 1}</span>
                {' '}até{' '}
                <span className="font-medium">
                  {Math.min(page * limit, total)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{total}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? 'z-10 bg-red-900 border-red-800 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && users.length > 0 && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center">
            <LoadingSpinner />
            <span className="ml-3 text-white">Atualizando...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserTable