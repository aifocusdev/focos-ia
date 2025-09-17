import React, { useState, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'
import { useTagStore } from '../../stores/tagStore'
import { cn } from '../../utils/cn'
import type { Tag } from '../../types/tag.types'

interface TagSelectorProps {
  selectedTagIds: number[]
  onSelectionChange: (tagIds: number[]) => void
  placeholder?: string
  className?: string
  excludeTagIds?: number[]
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onSelectionChange,
  placeholder = 'Selecionar tags...',
  className,
  excludeTagIds = []
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { tags, isLoading, fetchTags } = useTagStore()

  useEffect(() => {
    fetchTags({ limit: 100 }) // Load all tags for selection
  }, [fetchTags])

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !excludeTagIds.includes(tag.id)
  )

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id)
    
    if (isSelected) {
      onSelectionChange(selectedTagIds.filter(id => id !== tag.id))
    } else {
      onSelectionChange([...selectedTagIds, tag.id])
    }
  }

  const handleRemoveTag = (tagId: number) => {
    onSelectionChange(selectedTagIds.filter(id => id !== tagId))
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className={cn('relative', className)}>
      {/* Selected Tags Display */}
      <div 
        className="min-h-[38px] w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 cursor-pointer hover:border-gray-500 focus-within:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            <>
              {selectedTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTag(tag.id)
                    }}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearAll()
                  }}
                  className="text-gray-400 hover:text-white text-xs ml-1"
                >
                  Limpar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-600">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Tags List */}
          <div className="max-h-40 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-400 text-sm">
                Carregando tags...
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-sm">
                {searchQuery ? 'Nenhuma tag encontrada' : 'Nenhuma tag disponível'}
              </div>
            ) : (
              filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id)
                
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors',
                      isSelected ? 'bg-gray-700' : ''
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-left text-white">{tag.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}