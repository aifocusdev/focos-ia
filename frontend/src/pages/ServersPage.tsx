import React, { useState, useEffect } from 'react'
import { useServerStore } from '../stores'
import ServerList from '../components/servers/ServerList'
import ServerForm from '../components/servers/ServerForm'
import ServerDeleteModal from '../components/servers/ServerDeleteModal'
import type { Server } from '../types/server.types'

const ServersPage: React.FC = () => {
  const { fetchServers, clearError } = useServerStore()
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [deletingServer, setDeletingServer] = useState<Server | null>(null)

  // Load servers on component mount
  useEffect(() => {
    fetchServers()
    
    // Clear any previous errors when component mounts
    return () => {
      clearError()
    }
  }, [fetchServers, clearError])

  // Handlers for modals
  const handleCreateServer = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditServer = (server: Server) => {
    setEditingServer(server)
  }

  const handleDeleteServer = (server: Server) => {
    setDeletingServer(server)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingServer(null)
  }

  const handleCloseDeleteModal = () => {
    setDeletingServer(null)
  }

  const handleFormSuccess = () => {
    // Refresh the servers list after successful create/update
    fetchServers()
  }

  const handleDeleteSuccess = () => {
    // The store will automatically update the list after successful delete
    // No need to refresh since the store removes the item locally
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <ServerList
          onCreateServer={handleCreateServer}
          onEditServer={handleEditServer}
          onDeleteServer={handleDeleteServer}
        />

        {/* Create Server Modal */}
        <ServerForm
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleFormSuccess}
        />

        {/* Edit Server Modal */}
        <ServerForm
          server={editingServer}
          isOpen={!!editingServer}
          onClose={handleCloseEditModal}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Server Modal */}
        <ServerDeleteModal
          server={deletingServer}
          isOpen={!!deletingServer}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}

export default ServersPage