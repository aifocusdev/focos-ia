import React, { useState } from 'react'
import { Tag, Plus, X, Edit3 } from 'lucide-react'
import { TagSelector } from '../ui/TagSelector'
import Button from '../ui/Button'
import { useContactStore } from '../../stores/contactStore'
import { cn } from '../../utils/cn'
import type { Tag as TagType } from '../../types/tag.types'

interface ContactTagsManagerProps {
  contactId: string
  tags: TagType[]
  className?: string
}

export const ContactTagsManager: React.FC<ContactTagsManagerProps> = ({
  contactId,
  tags,
  className
}) => {
  const [isManaging, setIsManaging] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  
  const { addTags, removeTags, isUpdatingTags } = useContactStore()

  const handleAddTags = async () => {
    if (selectedTagIds.length === 0) return
    
    try {
      await addTags(contactId, selectedTagIds)
      setSelectedTagIds([])
      setIsManaging(false)
    } catch (error) {
      console.error('Error adding tags:', error)
    }
  }

  const handleRemoveTag = async (tagId: number) => {
    try {
      await removeTags(contactId, [tagId])
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  const handleCancelManaging = () => {
    setIsManaging(false)
    setSelectedTagIds([])
  }

  // Filter out tags that are already assigned to the contact
  const availableTagIds = tags.map(tag => tag.id)

  return (
    <div className={cn('space-y-2', className)}>
      {/* Current Tags Display */}
      <div className="flex flex-wrap gap-2 items-center">
        {tags.length > 0 ? (
          tags.map(tag => (
            <div 
              key={tag.id} 
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white rounded px-2 py-1 group"
              style={{ backgroundColor: tag.color }}
            >
              <Tag className="w-3 h-3" />
              <span>{tag.name}</span>
              {!isUpdatingTags && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="opacity-70 hover:opacity-100 hover:bg-black/20 rounded-full p-0.5 transition-all"
                  title="Remover tag"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-400 italic">Nenhuma tag atribuída</span>
        )}
        
        {/* Manage Tags Button */}
        {!isManaging && (
          <button
            type="button"
            onClick={() => setIsManaging(true)}
            disabled={isUpdatingTags}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Gerenciar tags"
          >
            {isUpdatingTags ? (
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Edit3 className="w-3 h-3" />
            )}
            <span>Gerenciar</span>
          </button>
        )}
      </div>

      {/* Tag Management Interface */}
      {isManaging && (
        <div className="p-3 bg-gray-800 rounded-md border border-gray-600 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Adicionar Tags</h4>
            <button
              type="button"
              onClick={handleCancelManaging}
              className="text-gray-400 hover:text-white p-1 rounded"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <TagSelector
              selectedTagIds={selectedTagIds}
              onSelectionChange={setSelectedTagIds}
              placeholder="Selecionar tags para adicionar..."
              excludeTagIds={availableTagIds} // Exclude tags already assigned
            />
            
            {selectedTagIds.length > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-400">
                  {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selecionada{selectedTagIds.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelManaging}
                    disabled={isUpdatingTags}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddTags}
                    loading={isUpdatingTags}
                    disabled={isUpdatingTags}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}