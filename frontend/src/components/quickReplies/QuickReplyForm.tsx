import React, { useState, useEffect, useRef } from 'react'
import { X, Smile } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
import EmojiPicker from 'emoji-picker-react'
import { useQuickReplyStore } from '../../stores/quickReplyStore'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { cn } from '../../utils/cn'
import type { QuickReply } from '../../types/quickReply.types'

interface QuickReplyFormProps {
  quickReply?: QuickReply | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const QuickReplyForm: React.FC<QuickReplyFormProps> = ({
  quickReply,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createQuickReply, updateQuickReply, isCreating, isUpdating } = useQuickReplyStore()
  const [title, setTitle] = useState('')
  const [shortcut, setShortcut] = useState('')
  const [body, setBody] = useState('')
  const [titleError, setTitleError] = useState('')
  const [shortcutError, setShortcutError] = useState('')
  const [bodyError, setBodyError] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const isEditing = !!quickReply
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      setTitle(quickReply?.title || '')
      setShortcut(quickReply?.shortcut || '')
      setBody(quickReply?.body || '')
      setTitleError('')
      setShortcutError('')
      setBodyError('')
    }
  }, [isOpen, quickReply])

  const validateTitle = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Título é obrigatório'
    }
    if (trimmed.length > 100) {
      return 'Título deve ter no máximo 100 caracteres'
    }
    return ''
  }

  const validateShortcut = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Shortcut é obrigatório'
    }
    if (!trimmed.startsWith('/')) {
      return 'Shortcut deve começar com "/"'
    }
    if (trimmed.length < 2 || trimmed.length > 32) {
      return 'Shortcut deve ter entre 2 e 32 caracteres'
    }
    return ''
  }

  const validateBody = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Conteúdo é obrigatório'
    }
    if (trimmed.length > 5000) {
      return 'Conteúdo deve ter no máximo 5000 caracteres'
    }
    return ''
  }

  const validateForm = () => {
    const titleErr = validateTitle(title)
    const shortcutErr = validateShortcut(shortcut)
    const bodyErr = validateBody(body)

    setTitleError(titleErr)
    setShortcutError(shortcutErr)
    setBodyError(bodyErr)

    return !titleErr && !shortcutErr && !bodyErr
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    setTitleError(validateTitle(value))
  }

  const handleShortcutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Auto-add "/" if not present and not empty
    if (value && !value.startsWith('/')) {
      value = '/' + value
    }
    
    setShortcut(value)
    setShortcutError(validateShortcut(value))
  }

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setBody(value)
    setBodyError(validateBody(value))
  }
  
  const handleEmojiSelect = (emojiData: any) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const cursorPosition = textarea.selectionStart
    const textBefore = body.substring(0, cursorPosition)
    const textAfter = body.substring(cursorPosition)
    const newText = textBefore + emojiData.emoji + textAfter
    
    setBody(newText)
    setBodyError(validateBody(newText))
    setShowEmojiPicker(false)
    
    // Restore cursor position after emoji
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPosition + emojiData.emoji.length, cursorPosition + emojiData.emoji.length)
    }, 0)
  }
  
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const data = {
      title: title.trim(),
      shortcut: shortcut.trim(),
      body: body.trim()
    }

    let success = false

    if (isEditing && quickReply) {
      success = await updateQuickReply(quickReply.id, data)
    } else {
      success = await createQuickReply(data)
    }

    if (success) {
      onSuccess()
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setShowEmojiPicker(false)
      onClose()
    }
  }
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label 
              htmlFor="quick-reply-title" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Título *
            </label>
            <Input
              id="quick-reply-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Ex: Saudação inicial"
              disabled={isLoading}
              error={titleError}
              className="w-full"
              maxLength={100}
            />
            {titleError && (
              <p className="mt-1 text-sm text-red-400">{titleError}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              {title.length}/100 caracteres
            </p>
          </div>

          {/* Shortcut */}
          <div>
            <label 
              htmlFor="quick-reply-shortcut" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Shortcut *
            </label>
            <Input
              id="quick-reply-shortcut"
              type="text"
              value={shortcut}
              onChange={handleShortcutChange}
              placeholder="Ex: /oi"
              disabled={isLoading}
              error={shortcutError}
              className="w-full font-mono"
              maxLength={32}
            />
            {shortcutError && (
              <p className="mt-1 text-sm text-red-400">{shortcutError}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              {shortcut.length}/32 caracteres • Deve começar com "/"
            </p>
          </div>

          {/* Body */}
          <div>
            <label 
              htmlFor="quick-reply-body" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Conteúdo da Mensagem *
            </label>
            
            <div className="relative">
              <div className="relative">
                <TextareaAutosize
                  ref={textareaRef}
                  id="quick-reply-body"
                  value={body}
                  onChange={handleBodyChange}
                  placeholder="Digite o conteúdo da resposta rápida..."
                  disabled={isLoading}
                  minRows={3}
                  maxRows={12}
                  maxLength={5000}
                  className={cn(
                    'w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg resize-none',
                    'text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    bodyError && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={toggleEmojiPicker}
                  disabled={isLoading}
                  className={cn(
                    'absolute right-2 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    'text-gray-400 hover:text-white hover:bg-gray-600/50',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    showEmojiPicker && 'text-yellow-400 bg-gray-600/50'
                  )}
                  title="Adicionar emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute top-full right-0 mt-2 z-50"
                >
                  <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      width={320}
                      height={400}
                      theme={'dark' as any}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {bodyError && (
              <p className="mt-1 text-sm text-red-400">{bodyError}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              {body.length}/5000 caracteres
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
              disabled={!title.trim() || !shortcut.trim() || !body.trim() || !!titleError || !!shortcutError || !!bodyError}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Resposta Rápida
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickReplyForm