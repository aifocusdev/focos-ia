import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useTagStore } from '../../stores/tagStore'
import TagTable from './TagTable'
import TablePagination from '../ui/TablePagination'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import Input from '../ui/Input'
import type { Tag } from '../../types/tag.types'

interface TagListProps {
  onCreateTag: () => void
  onEditTag: (tag: Tag) => void
  onDeleteTag: (tag: Tag) => void
}

const TagList: React.FC<TagListProps> = ({
  onCreateTag,
  onEditTag,
  onDeleteTag
}) => {
  const {
    tags,
    isLoading,
    isDeleting,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    fetchTags,
    setSearchQuery
  } = useTagStore()
  
  const [searchInput, setSearchInput] = useState(searchQuery)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (page: number) => {
    fetchTags({ page })
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
  
  // Fetch tags when search query changes
  useEffect(() => {
    fetchTags()
  }, [searchQuery, fetchTags])

  if (isLoading && tags.length === 0) {
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
          <h2 className="text-2xl font-bold text-white">Tags</h2>
          <p className="text-gray-400">
            {totalItems === 0 
              ? 'Nenhuma tag encontrada' 
              : `${totalItems} tag${totalItems !== 1 ? 's' : ''} ${totalItems !== 1 ? 'encontradas' : 'encontrada'}`
            }
          </p>
        </div>
        
        <Button
          onClick={onCreateTag}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tag
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Tag Table */}
      <TagTable
        tags={tags}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={onEditTag}
        onDelete={onDeleteTag}
        emptyAction={
          <Button
            onClick={onCreateTag}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Tag
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
        itemName="tags"
      />
    </div>
  )
}

export default TagList