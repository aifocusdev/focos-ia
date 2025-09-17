import React, { useState, useEffect } from 'react'
import { useDeviceStore } from '../stores'
import DeviceList from '../components/devices/DeviceList'
import DeviceForm from '../components/devices/DeviceForm'
import DeviceDeleteModal from '../components/devices/DeviceDeleteModal'
import type { Device } from '../types/device.types'

const DevicesPage: React.FC = () => {
  const { fetchDevices, clearError } = useDeviceStore()
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null)

  // Load devices on component mount
  useEffect(() => {
    fetchDevices()
    
    // Clear any previous errors when component mounts
    return () => {
      clearError()
    }
  }, [fetchDevices, clearError])

  // Handlers for modals
  const handleCreateDevice = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device)
  }

  const handleDeleteDevice = (device: Device) => {
    setDeletingDevice(device)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingDevice(null)
  }

  const handleCloseDeleteModal = () => {
    setDeletingDevice(null)
  }

  const handleFormSuccess = () => {
    // Refresh the devices list after successful create/update
    fetchDevices()
  }

  const handleDeleteSuccess = () => {
    // The store will automatically update the list after successful delete
    // No need to refresh since the store removes the item locally
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <DeviceList
          onCreateDevice={handleCreateDevice}
          onEditDevice={handleEditDevice}
          onDeleteDevice={handleDeleteDevice}
        />

        {/* Create Device Modal */}
        <DeviceForm
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleFormSuccess}
        />

        {/* Edit Device Modal */}
        <DeviceForm
          device={editingDevice}
          isOpen={!!editingDevice}
          onClose={handleCloseEditModal}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Device Modal */}
        <DeviceDeleteModal
          device={deletingDevice}
          isOpen={!!deletingDevice}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  )
}

export default DevicesPage