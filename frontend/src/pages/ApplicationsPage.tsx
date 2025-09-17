import React, { useState, useEffect } from 'react'
import { useApplicationStore } from '../stores/applicationStore'
import ApplicationList from '../components/applications/ApplicationList'
import ApplicationForm from '../components/applications/ApplicationForm'
import ApplicationDeleteModal from '../components/applications/ApplicationDeleteModal'
import type { Application } from '../types/application.types'

const ApplicationsPage: React.FC = () => {
  const { fetchApplications, clearError } = useApplicationStore()
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null)

  // Load applications on component mount
  useEffect(() => {
    fetchApplications()
    
    // Clear any previous errors when component mounts
    return () => {
      clearError()
    }
  }, [fetchApplications, clearError])

  // Handlers for modals
  const handleCreateApplication = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditApplication = (application: Application) => {
    setEditingApplication(application)
  }

  const handleDeleteApplication = (application: Application) => {
    setDeletingApplication(application)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingApplication(null)
  }

  const handleCloseDeleteModal = () => {
    setDeletingApplication(null)
  }

  const handleFormSuccess = () => {
    // Refresh the applications list after successful create/update
    fetchApplications()
  }

  const handleDeleteSuccess = () => {
    // The store will automatically update the list after successful delete
    // No need to refresh since the store removes the item locally
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <ApplicationList
          onCreateApplication={handleCreateApplication}
          onEditApplication={handleEditApplication}
          onDeleteApplication={handleDeleteApplication}
        />

        {/* Create Application Modal */}
        <ApplicationForm
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleFormSuccess}
        />

        {/* Edit Application Modal */}
        <ApplicationForm
          application={editingApplication}
          isOpen={!!editingApplication}
          onClose={handleCloseEditModal}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Application Modal */}
        <ApplicationDeleteModal
          application={deletingApplication}
          isOpen={!!deletingApplication}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}

export default ApplicationsPage