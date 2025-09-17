import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useServerStore } from '../../stores'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { Server } from '../../types/server.types'

interface ServerFormProps {
  server?: Server | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ServerForm: React.FC<ServerFormProps> = ({
  server,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createServer, updateServer, isCreating, isUpdating } = useServerStore()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  const isEditing = !!server
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      setName(server?.name || '')
      setNameError('')
    }
  }, [isOpen, server])

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

    if (isEditing && server) {
      success = await updateServer(server.id, trimmedName)
    } else {
      success = await createServer(trimmedName)
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
            {isEditing ? 'Editar Servidor' : 'Novo Servidor'}
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
              htmlFor="server-name" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nome do Servidor *
            </label>
            <Input
              id="server-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do servidor"
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
              disabled={!name.trim() || !!nameError}
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Servidor
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ServerForm