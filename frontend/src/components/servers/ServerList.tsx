import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useServerStore } from '../../stores'
import ServerTable from './ServerTable'
import TablePagination from '../ui/TablePagination'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import Input from '../ui/Input'
import type { Server } from '../../types/server.types'

interface ServerListProps {
  onCreateServer: () => void
  onEditServer: (server: Server) => void
  onDeleteServer: (server: Server) => void
}

const ServerList: React.FC<ServerListProps> = ({
  onCreateServer,
  onEditServer,
  onDeleteServer
}) => {
  const {
    servers,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    fetchServers,
    setSearchQuery
  } = useServerStore()
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (page: number) => {
    fetchServers({ page })
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
  
  // Fetch servers when search query changes
  useEffect(() => {
    fetchServers()
  }, [searchQuery, fetchServers])

  if (isLoading && servers.length === 0) {
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
          <h2 className="text-2xl font-bold text-white">Servidores</h2>
          <p className="text-gray-400">
            {totalItems === 0 
              ? 'Nenhum servidor encontrado' 
              : `${totalItems} servidor${totalItems !== 1 ? 'es' : ''} ${totalItems !== 1 ? 'encontrados' : 'encontrado'}`
            }
          </p>
        </div>
        
        <Button
          onClick={onCreateServer}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Servidor
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar servidores..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Server Table */}
      <ServerTable
        servers={servers}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditServer}
        onDelete={onDeleteServer}
        emptyAction={
          <Button
            onClick={onCreateServer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Servidor
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
        itemName="servidores"
      />
    </div>
  )
}

export default ServerList