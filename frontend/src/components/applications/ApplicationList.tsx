import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useApplicationStore } from '../../stores/applicationStore'
import ApplicationTable from './ApplicationTable'
import TablePagination from '../ui/TablePagination'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import Input from '../ui/Input'
import type { Application } from '../../types/application.types'

interface ApplicationListProps {
  onCreateApplication: () => void
  onEditApplication: (application: Application) => void
  onDeleteApplication: (application: Application) => void
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  onCreateApplication,
  onEditApplication,
  onDeleteApplication
}) => {
  const {
    applications,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    fetchApplications,
    setSearchQuery
  } = useApplicationStore()
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (page: number) => {
    fetchApplications({ page })
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
  
  // Fetch applications when search query changes
  useEffect(() => {
    fetchApplications()
  }, [searchQuery, fetchApplications])

  if (isLoading && applications.length === 0) {
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
          <h2 className="text-2xl font-bold text-white">Aplicações</h2>
          <p className="text-gray-400">
            {totalItems === 0 
              ? 'Nenhuma aplicação encontrada' 
              : `${totalItems} aplicação${totalItems !== 1 ? 'ões' : ''} ${totalItems !== 1 ? 'encontradas' : 'encontrada'}`
            }
          </p>
        </div>
        
        <Button
          onClick={onCreateApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Aplicação
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar aplicações..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Application Table */}
      <ApplicationTable
        applications={applications}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditApplication}
        onDelete={onDeleteApplication}
        emptyAction={
          <Button
            onClick={onCreateApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Aplicação
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
        itemName="aplicações"
      />
    </div>
  )
}

export default ApplicationList