import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, AlertTriangle } from 'lucide-react'
import { useConversationStore } from '../../../stores/conversationStore'
import { cn } from '../../../utils/cn'
import { isWithin24Hours, getHoursUntilExpiry, getMinutesUntilExpiry } from '../../../utils/formatters'
import type { Conversation } from '../../../types/conversation.types'

// Import modular components and hooks
import EmojiPicker from './components/EmojiPicker'
import MessageInput, { type MessageInputRef } from './components/MessageInput'
import FileDropZone from './components/FileDropZone'
import FilePreview from './components/FilePreview'
import QuickReplyPalette from './components/QuickReplyPalette'
import { useDraftSaving } from './hooks/useDraftSaving'
import { useEmojiPicker } from './hooks/useEmojiPicker'
import { useQuickReplyPalette } from './hooks/useQuickReplyPalette'
import type { QuickReply } from '../../../types/quickReply.types'

interface MessageComposerProps {
  conversation: Conversation
}

export interface MessageComposerRef {
  focusInput: () => void
}

const MessageComposer = React.forwardRef<MessageComposerRef, MessageComposerProps>((props, ref) => {
  const { conversation } = props
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileDropZone, setShowFileDropZone] = useState(false)
  const { sendMessage, sendMessageWithMedia } = useConversationStore()
  
  const messageInputRef = useRef<MessageInputRef>(null)
  const maxLength = 4096

  // Expose focusInput method to parent components
  React.useImperativeHandle(ref, () => ({
    focusInput: () => {
      messageInputRef.current?.focus()
    }
  }))

  // Use modular hooks
  const { loadDraft, clearDraft } = useDraftSaving(conversation.id, message)
  const { 
    showEmojiPicker, 
    toggleEmojiPicker, 
    closeEmojiPicker 
  } = useEmojiPicker()

  // Quick reply palette hook
  const quickReplyPalette = useQuickReplyPalette((reply: QuickReply, triggerStart: number, triggerEnd: number) => {
    messageInputRef.current?.insertTextAtPosition(reply.body, triggerStart, triggerEnd)
  })

  // Load saved draft on conversation change
  useEffect(() => {
    if (isLoading || isSending || message.trim()) {
      return
    }
    
    const savedDraft = loadDraft()
    if (savedDraft && savedDraft !== message && !savedDraft.trim().startsWith('/')) {
      setMessage(savedDraft)
    }
  }, [conversation.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    const hasFiles = selectedFiles.length > 0
    
    if (!trimmedMessage && !hasFiles || isLoading || isSending) {
      return
    }

    setIsSending(true)
    setIsLoading(true)
    
    try {
      if (hasFiles) {
        await sendMessageWithMedia(conversation.id, trimmedMessage, selectedFiles)
      } else {
        await sendMessage(conversation.id, trimmedMessage)
      }
      
      setMessage('')
      clearDraft()
      setSelectedFiles([])
      setShowFileDropZone(false)
      
      requestAnimationFrame(() => {
        messageInputRef.current?.focus()
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (quickReplyPalette.handleKeyDown(e)) {
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }

  const handleMessageChange = React.useCallback((value: string) => {
    setMessage(value)
  }, [])

  const handleInputBlur = React.useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    
    if (relatedTarget && relatedTarget.closest('form') === e.currentTarget.closest('form')) {
      setTimeout(() => {
        messageInputRef.current?.focus()
      }, 0)
    }
  }, [])

  const handleEmojiSelect = React.useCallback((emoji: string) => {
    setMessage(prev => prev + emoji)
    requestAnimationFrame(() => {
      messageInputRef.current?.focus()
    })
  }, [])

  const handleFilesSelected = React.useCallback((files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files])
    setShowFileDropZone(false)
    requestAnimationFrame(() => {
      messageInputRef.current?.focus()
    })
  }, [])

  const handleRemoveFile = (index?: number) => {
    if (index !== undefined) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  const toggleFileDropZone = React.useCallback(() => {
    setShowFileDropZone(prev => !prev)
    if (showEmojiPicker) {
      closeEmojiPicker()
    }
    if (quickReplyPalette.isOpen) {
      quickReplyPalette.closePalette()
    }
    requestAnimationFrame(() => {
      messageInputRef.current?.focus()
    })
  }, [showEmojiPicker, closeEmojiPicker, quickReplyPalette])

  const handleTemplateTriggered = React.useCallback((position: number, start: number, query: string) => {
    quickReplyPalette.openPalette(position, start)
    quickReplyPalette.setSearchQuery(query)
    
    if (showEmojiPicker) {
      closeEmojiPicker()
    }
    if (showFileDropZone) {
      setShowFileDropZone(false)
    }
  }, [quickReplyPalette, showEmojiPicker, closeEmojiPicker, showFileDropZone])

  const handleTemplateClosed = React.useCallback(() => {
    if (quickReplyPalette.isOpen) {
      quickReplyPalette.closePalette()
    }
  }, [quickReplyPalette])

  // Check if conversation is within 24-hour messaging window
  const isWithinMessagingWindow = isWithin24Hours(conversation.lastContactMessageAt)
  const hoursUntilExpiry = getHoursUntilExpiry(conversation.lastContactMessageAt)
  const minutesUntilExpiry = getMinutesUntilExpiry(conversation.lastContactMessageAt)
  
  // Show warning only if we have a valid lastContactMessageAt and it's problematic
  // If lastContactMessageAt is null, don't show warning (we don't know the history)
  const showMessagingWarning = conversation.lastContactMessageAt && (
    !isWithinMessagingWindow || (hoursUntilExpiry !== null && hoursUntilExpiry < 2)
  )
  
  const isDisabled = false
  const hasContent = message.trim() || selectedFiles.length > 0

  return (
    <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="p-4">
        {isDisabled && (
          <div className="mb-3 p-2 bg-orange-500/20 border border-orange-500/30 rounded-md">
            <p className="text-orange-400 text-sm">
              Esta conversa está fechada. Reabra para enviar mensagens.
            </p>
          </div>
        )}

        {showMessagingWarning && (
          <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 text-sm font-medium">
                  {!isWithinMessagingWindow 
                    ? 'Janela de mensagens expirada' 
                    : 'Janela de mensagens expirando em breve'
                  }
                </p>
                <p className="text-yellow-300 text-xs mt-1">
                  {!isWithinMessagingWindow 
                    ? 'O contato não enviou mensagem nas últimas 24h. Mensagens podem não ser entregues devido às políticas do WhatsApp Business.'
                    : hoursUntilExpiry !== null && hoursUntilExpiry > 0
                    ? `Restam ${hoursUntilExpiry}h para enviar mensagens livres.`
                    : minutesUntilExpiry !== null && minutesUntilExpiry > 0
                    ? `Restam ${minutesUntilExpiry} minutos para enviar mensagens livres.`
                    : 'A janela de 24h está prestes a expirar.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-end">
          <div className="flex-1 relative">
            <QuickReplyPalette
              show={quickReplyPalette.isOpen}
              replies={quickReplyPalette.filteredReplies}
              selectedIndex={quickReplyPalette.selectedIndex}
              searchQuery={quickReplyPalette.searchQuery}
              onSelectReply={quickReplyPalette.selectReply}
              isLoading={false}
            />
            
            <MessageInput
              ref={messageInputRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              onTemplateTriggered={handleTemplateTriggered}
              onTemplateClosed={handleTemplateClosed}
              disabled={isDisabled || isLoading}
              placeholder={isDisabled ? 'Conversa fechada' : 'Digite sua mensagem...'}
              maxLength={maxLength}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
              <button
                type="button"
                disabled={isDisabled}
                onClick={toggleFileDropZone}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  isDisabled 
                    ? 'text-gray-500 cursor-not-allowed'
                    : showFileDropZone
                    ? 'text-blue-400 bg-gray-600/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                )}
                title="Anexar arquivo"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={toggleEmojiPicker}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isDisabled 
                      ? 'text-gray-500 cursor-not-allowed'
                      : showEmojiPicker
                      ? 'text-yellow-400 bg-gray-600/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  )}
                  title="Emojis"
                >
                  <Smile className="w-4 h-4" />
                </button>
                
                <EmojiPicker
                  show={showEmojiPicker}
                  onEmojiSelect={handleEmojiSelect}
                  onClose={closeEmojiPicker}
                />
              </div>
              
              <button
                type="submit"
                disabled={!hasContent || isDisabled || isLoading}
                className={cn(
                  'w-8 h-8 flex items-center justify-center transition-colors',
                  isDisabled || !hasContent
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-red-400 hover:text-red-300'
                )}
                title="Enviar mensagem"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {showFileDropZone && (
          <div className="mt-3">
            <FileDropZone
              onFilesSelected={handleFilesSelected}
              disabled={isDisabled || isLoading}
            />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-3">
            <FilePreview
              files={selectedFiles}
              onRemoveFile={handleRemoveFile}
              disabled={isDisabled || isLoading}
            />
          </div>
        )}

        {!isDisabled && (
          <div className="mt-2 text-xs text-gray-500">
            Enter para enviar • Shift+Enter para nova linha • "/" para templates
          </div>
        )}
      </form>
    </div>
  )
})

MessageComposer.displayName = 'MessageComposer'

export default MessageComposer