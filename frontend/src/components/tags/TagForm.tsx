import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useTagStore } from '../../stores/tagStore'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { Tag, TagColor } from '../../types/tag.types'
import { DEFAULT_TAG_COLOR, getTagColorStyle, isValidHexColor } from '../../utils/tagColors'

interface TagFormProps {
  tag?: Tag | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const TagForm: React.FC<TagFormProps> = ({
  tag,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createTag, updateTag, isCreating, isUpdating } = useTagStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColor>(DEFAULT_TAG_COLOR)
  const [nameError, setNameError] = useState('')

  const isEditing = !!tag
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      setName(tag?.name || '')
      setColor(tag?.color || DEFAULT_TAG_COLOR)
      setNameError('')
    }
  }, [isOpen, tag])

  const validateForm = () => {
    let isValid = true
    
    if (!name.trim()) {
      setNameError('Nome é obrigatório')
      isValid = false
    } else if (name.trim().length > 100) {
      setNameError('Nome deve ter no máximo 100 caracteres')
      isValid = false
    } else {
      setNameError('')
    }
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const trimmedName = name.trim()
    let success = false

    if (isEditing && tag) {
      success = await updateTag(tag.id, trimmedName, color)
    } else {
      success = await createTag(trimmedName, color)
    }

    if (success) {
      onSuccess()
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Editar Tag' : 'Nova Tag'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label 
              htmlFor="tag-name" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nome da Tag *
            </label>
            <Input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da tag"
              disabled={isLoading}
              error={nameError}
              className="w-full"
              maxLength={100}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-400">{nameError}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              {name.length}/100 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Cor da Tag *
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <HexColorPicker 
                    color={color} 
                    onChange={setColor}
                    style={{ width: '100%', height: '200px' }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-600 flex items-center justify-center shadow-lg"
                  style={getTagColorStyle(color)}
                >
                  <span className="text-sm font-medium">Tag</span>
                </div>
                <div className="text-center">
                  <Input
                    type="text"
                    value={color.toUpperCase()}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.startsWith('#') && value.length <= 7) {
                        setColor(value)
                      }
                    }}
                    placeholder="#000000"
                    className="w-24 text-center text-sm font-mono"
                    maxLength={7}
                    disabled={isLoading}
                  />
                  {!isValidHexColor(color) && color.length > 0 && (
                    <p className="mt-1 text-xs text-red-400">Cor inválida</p>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Escolha qualquer cor para identificar a tag
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={!name.trim() || !!nameError || !isValidHexColor(color)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Tag
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TagForm