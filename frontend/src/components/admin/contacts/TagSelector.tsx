import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Tag as TagIcon } from 'lucide-react'
import { useContactStore } from '../../../stores/admin/adminContactStore'
import TagBadge from './TagBadge'
import LoadingSpinner from '../../ui/LoadingSpinner'

interface TagSelectorProps {
  selectedTagIds: number[]
  onChange: (tagIds: number[]) => void
  placeholder?: string
  className?: string
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds = [],
  onChange,
  placeholder = "Selecionar tags...",
  className = ""
}) => {
  const { tags, tagsLoading, fetchTags } = useContactStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load tags on mount
  useEffect(() => {
    if (tags.length === 0 && !tagsLoading) {
      fetchTags()
    }
  }, [tags.length, tagsLoading, fetchTags])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))
  
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTagIds.includes(tag.id)
  )

  const handleTagSelect = (tagId: number) => {
    onChange([...selectedTagIds, tagId])
    setSearchTerm('')
  }


  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Input */}
      <div
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <TagIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedTags.map(tag => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    size="sm"
                    className="mr-1"
                  />
                ))}
              </div>
            ) : (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center ml-2 flex-shrink-0">
            {selectedTags.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearAll()
                }}
                className="p-1 text-gray-400 hover:text-white mr-1"
                title="Limpar seleção"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tags..."
              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-40 overflow-y-auto">
            {tagsLoading ? (
              <div className="p-4 flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2 text-sm text-gray-300">Carregando tags...</span>
              </div>
            ) : filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
                  onClick={() => handleTagSelect(tag.id)}
                >
                  <TagBadge tag={tag} size="sm" />
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-400 text-center">
                {searchTerm ? 'Nenhuma tag encontrada' : 'Todas as tags foram selecionadas'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TagSelector