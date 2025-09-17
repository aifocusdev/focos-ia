import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useQuickReplyStore } from '../../stores/quickReplyStore'
import QuickReplyTable from './QuickReplyTable'
import TablePagination from '../ui/TablePagination'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import Input from '../ui/Input'
import type { QuickReply } from '../../types/quickReply.types'

interface QuickReplyListProps {
  onCreateQuickReply: () => void
  onEditQuickReply: (quickReply: QuickReply) => void
  onDeleteQuickReply: (quickReply: QuickReply) => void
}

const QuickReplyList: React.FC<QuickReplyListProps> = ({
  onCreateQuickReply,
  onEditQuickReply,
  onDeleteQuickReply
}) => {
  const {
    quickReplies,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    fetchQuickReplies,
    setSearchQuery
  } = useQuickReplyStore()
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (page: number) => {
    fetchQuickReplies({ page })
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
  
  // Fetch quick replies when search query changes
  useEffect(() => {
    fetchQuickReplies()
  }, [searchQuery, fetchQuickReplies])

  if (isLoading && quickReplies.length === 0) {
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
          <h2 className="text-2xl font-bold text-white">Respostas Rápidas</h2>
          <p className="text-gray-400">
            {totalItems === 0 
              ? 'Nenhuma resposta rápida encontrada' 
              : `${totalItems} resposta${totalItems !== 1 ? 's' : ''} rápida${totalItems !== 1 ? 's' : ''} ${totalItems !== 1 ? 'encontradas' : 'encontrada'}`
            }
          </p>
        </div>
        
        <Button
          onClick={onCreateQuickReply}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Resposta Rápida
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por título ou shortcut..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Quick Reply Table */}
      <QuickReplyTable
        quickReplies={quickReplies}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditQuickReply}
        onDelete={onDeleteQuickReply}
        emptyAction={
          <Button
            onClick={onCreateQuickReply}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Resposta Rápida
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
        itemName="respostas rápidas"
      />
    </div>
  )
}

export default QuickReplyList