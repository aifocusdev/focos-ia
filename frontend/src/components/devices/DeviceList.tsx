import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useDeviceStore } from '../../stores'
import DeviceTable from './DeviceTable'
import TablePagination from '../ui/TablePagination'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import Input from '../ui/Input'
import type { Device } from '../../types/device.types'

interface DeviceListProps {
  onCreateDevice: () => void
  onEditDevice: (device: Device) => void
  onDeleteDevice: (device: Device) => void
}

const DeviceList: React.FC<DeviceListProps> = ({
  onCreateDevice,
  onEditDevice,
  onDeleteDevice
}) => {
  const {
    devices,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    fetchDevices,
    setSearchQuery
  } = useDeviceStore()
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (page: number) => {
    fetchDevices({ page })
  }
  
  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500) as ReturnType<typeof setTimeout>

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchInput, setSearchQuery])
  
  // Fetch devices when search query changes
  useEffect(() => {
    fetchDevices()
  }, [searchQuery, fetchDevices])

  if (isLoading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dispositivos</h2>
          <p className="text-gray-400">
            {totalItems === 0 
              ? 'Nenhum dispositivo encontrado' 
              : `${totalItems} dispositivo${totalItems !== 1 ? 's' : ''} ${totalItems !== 1 ? 'encontrados' : 'encontrado'}`
            }
          </p>
        </div>
        
        <Button
          onClick={onCreateDevice}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Dispositivo
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar dispositivos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Device Table */}
      <DeviceTable
        devices={devices}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditDevice}
        onDelete={onDeleteDevice}
        emptyAction={
          <Button
            onClick={onCreateDevice}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Dispositivo
          </Button>
        }
      />

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={20}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        itemName="dispositivos"
      />
    </div>
  )
}

export default DeviceList