import React, { useState, useEffect } from 'react'
import { Users, Plus } from 'lucide-react'
import { useUserStore } from '../../stores/userStore'
import UserFilters from '../../components/admin/users/UserFilters'
import UserTable from '../../components/admin/users/UserTable'
import UserModal from '../../components/admin/users/UserModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import type { User } from '../../types/user.types'

const UsersPage: React.FC = () => {
  const { fetchUsers, deleteUser, error, setError } = useUserStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Clear error when component unmounts or modals close
  useEffect(() => {
    return () => {
      setError(null)
    }
  }, [setError])

  const handleCreateUser = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditUser(user)
  }

  const handleDeleteUser = (user: User) => {
    setDeleteConfirm(user)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await deleteUser(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch {
      // Error is already handled by the store
    }
  }

  const handleModalSuccess = () => {
    // Reset any error state
    setError(null)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center shadow-lg mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gerenciamento de Usuários
                </h1>
                <p className="text-gray-300">
                  Controle de usuários e permissões do sistema
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCreateUser}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Filters */}
        <UserFilters />

        {/* Users Table */}
        <UserTable
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

        {/* Create User Modal */}
        <UserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleModalSuccess}
        />

        {/* Edit User Modal */}
        <UserModal
          isOpen={!!editUser}
          user={editUser || undefined}
          onClose={() => setEditUser(null)}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o usuário "${deleteConfirm?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </div>
  )
}

export default UsersPage