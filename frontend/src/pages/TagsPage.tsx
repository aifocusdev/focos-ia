import React, { useState, useEffect } from 'react'
import { useTagStore } from '../stores/tagStore'
import TagList from '../components/tags/TagList'
import TagForm from '../components/tags/TagForm'
import TagDeleteModal from '../components/tags/TagDeleteModal'
import type { Tag } from '../types/tag.types'

const TagsPage: React.FC = () => {
  const { fetchTags, clearError } = useTagStore()
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)

  // Load tags on component mount
  useEffect(() => {
    fetchTags()
    
    // Clear any previous errors when component mounts
    return () => {
      clearError()
    }
  }, [fetchTags, clearError])

  // Handlers for modals
  const handleCreateTag = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
  }

  const handleDeleteTag = (tag: Tag) => {
    setDeletingTag(tag)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingTag(null)
  }

  const handleCloseDeleteModal = () => {
    setDeletingTag(null)
  }

  const handleFormSuccess = () => {
    // Refresh the tags list after successful create/update
    fetchTags()
  }

  const handleDeleteSuccess = () => {
    // The store will automatically update the list after successful delete
    // No need to refresh since the store removes the item locally
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <TagList
          onCreateTag={handleCreateTag}
          onEditTag={handleEditTag}
          onDeleteTag={handleDeleteTag}
        />

        {/* Create Tag Modal */}
        <TagForm
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleFormSuccess}
        />

        {/* Edit Tag Modal */}
        <TagForm
          tag={editingTag}
          isOpen={!!editingTag}
          onClose={handleCloseEditModal}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Tag Modal */}
        <TagDeleteModal
          tag={deletingTag}
          isOpen={!!deletingTag}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}

export default TagsPage