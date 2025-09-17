import React, { useState, useEffect } from 'react'
import { useQuickReplyStore } from '../stores/quickReplyStore'
import QuickReplyList from '../components/quickReplies/QuickReplyList'
import QuickReplyForm from '../components/quickReplies/QuickReplyForm'
import QuickReplyDeleteModal from '../components/quickReplies/QuickReplyDeleteModal'
import type { QuickReply } from '../types/quickReply.types'

const QuickRepliesPage: React.FC = () => {
  const { fetchQuickReplies, clearError } = useQuickReplyStore()
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null)
  const [deletingQuickReply, setDeletingQuickReply] = useState<QuickReply | null>(null)

  // Load quick replies on component mount
  useEffect(() => {
    fetchQuickReplies()
    
    // Clear any previous errors when component mounts
    return () => {
      clearError()
    }
  }, [fetchQuickReplies, clearError])

  // Handlers for modals
  const handleCreateQuickReply = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditQuickReply = (quickReply: QuickReply) => {
    setEditingQuickReply(quickReply)
  }

  const handleDeleteQuickReply = (quickReply: QuickReply) => {
    setDeletingQuickReply(quickReply)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingQuickReply(null)
  }

  const handleCloseDeleteModal = () => {
    setDeletingQuickReply(null)
  }

  const handleFormSuccess = () => {
    // Refresh the quick replies list after successful create/update
    fetchQuickReplies()
  }

  const handleDeleteSuccess = () => {
    // The store will automatically update the list after successful delete
    // No need to refresh since the store removes the item locally
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <QuickReplyList
          onCreateQuickReply={handleCreateQuickReply}
          onEditQuickReply={handleEditQuickReply}
          onDeleteQuickReply={handleDeleteQuickReply}
        />

        {/* Create Quick Reply Modal */}
        <QuickReplyForm
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleFormSuccess}
        />

        {/* Edit Quick Reply Modal */}
        <QuickReplyForm
          quickReply={editingQuickReply}
          isOpen={!!editingQuickReply}
          onClose={handleCloseEditModal}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Quick Reply Modal */}
        <QuickReplyDeleteModal
          quickReply={deletingQuickReply}
          isOpen={!!deletingQuickReply}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}

export default QuickRepliesPage