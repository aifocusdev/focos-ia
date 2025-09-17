import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useConversationStore } from '../../stores/conversationStore'
import { useSocket } from '../../hooks'
import { useURLState } from '../../hooks'
import ConversationList from './ConversationList'
import ConversationHeaderActions from './ConversationHeaderActions'
import MessageThread from './MessageThread'
import MessageComposer, { type MessageComposerRef } from './MessageComposer'
import LoadingSpinner from '../ui/LoadingSpinner'
import ContactProfileDrawer from '../contacts/ContactProfileDrawer'
import { MessageCircle, X } from 'lucide-react'

const ConversationLayout: React.FC = () => {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)
  
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    messages, 
    isLoadingMessages,
    loadMessagesIfNeeded,
    markConversationAsRead,
    messagesPagination,
    loadMoreMessages 
  } = useConversationStore()
  const { joinConversation, leaveConversation } = useSocket()
  const { filters: urlFilters, setConversation } = useURLState()
  const previousConversationId = useRef<string | null>(null)
  const messageComposerRef = useRef<MessageComposerRef>(null)

  // Sync conversation from URL ONLY on mount or when URL changes (not when conversations array changes)
  useEffect(() => {
    if (urlFilters.conversationId && conversations?.length > 0) {
      const conversation = conversations.find(c => c.id === urlFilters.conversationId)
      if (conversation && conversation.id !== activeConversation?.id) {
        setActiveConversation(conversation)
        loadMessagesIfNeeded(urlFilters.conversationId)
        if (conversation.unreadCount > 0) {
          markConversationAsRead(urlFilters.conversationId)
        }
        
        // Auto-focus message input when conversation loads from URL
        setTimeout(() => {
          messageComposerRef.current?.focusInput()
        }, 150)
      }
    }
  }, [urlFilters.conversationId]) // Removed 'conversations' dependency to prevent re-runs when list updates

  const handleConversationSelect = useCallback(async (conversationId: string) => {
    const conversation = conversations?.find(c => c.id === conversationId)
    if (conversation) {
      setActiveConversation(conversation)
      setConversation(conversationId)
      await loadMessagesIfNeeded(conversationId)
      if (conversation.unreadCount > 0) {
        await markConversationAsRead(conversationId)
      }
      
      // Auto-focus message input after conversation loads
      setTimeout(() => {
        messageComposerRef.current?.focusInput()
      }, 100)
    }
  }, [conversations, setActiveConversation, setConversation, loadMessagesIfNeeded, markConversationAsRead])

  const handleCloseConversation = useCallback(() => {
    console.log('🔄 Closing conversation')
    setActiveConversation(null)
    setConversation(undefined)
    setIsProfileDrawerOpen(false)
  }, [setActiveConversation, setConversation])

  const handleShowProfile = useCallback(() => {
    setIsProfileDrawerOpen(true)
  }, [])

  const handleCloseProfile = useCallback(() => {
    setIsProfileDrawerOpen(false)
  }, [])

  // Handle WebSocket room management when active conversation changes
  useEffect(() => {
    // Leave previous conversation room if any
    if (previousConversationId.current && previousConversationId.current !== activeConversation?.id) {
      console.log('🔌 Leaving conversation room:', previousConversationId.current)
      leaveConversation(previousConversationId.current)
    }

    // Join new conversation room if any
    if (activeConversation?.id && previousConversationId.current !== activeConversation.id) {
      console.log('🔗 Joining conversation room:', activeConversation.id)
      joinConversation(activeConversation.id)
      previousConversationId.current = activeConversation.id
    } else if (!activeConversation?.id) {
      previousConversationId.current = null
    }
  }, [activeConversation?.id, leaveConversation, joinConversation])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (previousConversationId.current) {
        leaveConversation(previousConversationId.current)
      }
    }
  }, [leaveConversation])


  const conversationMessages = useMemo(() => {
    if (!activeConversation) return []
    return messages[activeConversation.id] || []
  }, [activeConversation?.id, messages[activeConversation?.id || '']])
  
  const messagePagination = useMemo(() => {
    return activeConversation ? messagesPagination[activeConversation.id] : undefined
  }, [activeConversation?.id, messagesPagination])
  
  const handleLoadMoreMessages = useCallback(() => {
    if (activeConversation && messagePagination?.hasMore && !messagePagination.isLoading) {
      loadMoreMessages(activeConversation.id)
    }
  }, [activeConversation?.id, messagePagination, loadMoreMessages])
  
  // Memoize conversation to prevent unnecessary re-renders in MessageComposer
  const memoizedConversation = useMemo(() => {
    return activeConversation
  }, [activeConversation?.id]) // Only change when ID changes, not the entire object

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Lista de Conversas */}
      <div className="w-80 flex-shrink-0 border-r border-gray-700 flex flex-col h-full">
        <ConversationList
          onConversationSelect={handleConversationSelect}
          selectedConversationId={activeConversation?.id}
        />
      </div>

      {/* Area do Chat */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {activeConversation ? (
          <>
            {/* Header do Chat */}
            <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                    {activeConversation.contact?.avatar ? (
                      <img 
                        src={activeConversation.contact.avatar} 
                        alt={activeConversation.contact.name || 'Contato'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      activeConversation.contact?.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  
                  {/* Contact Name - Same Line */}
                  <h2 className="text-white font-medium truncate ml-3 text-lg">
                    {activeConversation.contact?.name || activeConversation.contact?.phone || 'Contato Desconhecido'}
                  </h2>
                  
                  {/* Status - Same Line */}
                  {activeConversation.contact?.isOnline && (
                    <span className="text-green-400 text-sm ml-2">• Online</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ConversationHeaderActions 
                    conversation={activeConversation} 
                    onShowProfile={handleShowProfile}
                    onConversationClose={handleCloseConversation}
                  />
                  <button
                    onClick={handleCloseConversation}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden bg-gray-800">
                {isLoadingMessages && conversationMessages.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center text-center">
                      <LoadingSpinner size="lg" className="mb-3" />
                      <p className="text-gray-400 text-sm">Carregando mensagens...</p>
                    </div>
                  </div>
                ) : conversationMessages.length > 0 ? (
                  <>
                    {isLoadingMessages && (
                      <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50 pointer-events-none">
                        <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3 pointer-events-auto">
                          <LoadingSpinner size="sm" className="flex-shrink-0" />
                          <span className="text-gray-300 text-sm">Atualizando mensagens...</span>
                        </div>
                      </div>
                    )}
                    <MessageThread 
                      messages={conversationMessages} 
                      onLoadMore={handleLoadMoreMessages}
                      hasMoreMessages={messagePagination?.hasMore || false}
                      isLoadingMore={messagePagination?.isLoading || false}
                      shouldScrollToBottom={true}
                      conversationId={activeConversation.id}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center min-h-[300px] text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-base">Nenhuma mensagem ainda</p>
                      <p className="text-sm mt-1 opacity-75">As mensagens aparecerão aqui quando chegarem</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Mensagem */}
              {memoizedConversation && (
                <div className="flex-shrink-0 border-t border-gray-700">
                  <MessageComposer 
                    ref={messageComposerRef}
                    conversation={memoizedConversation}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-800">
            <div className="text-center text-gray-400 max-w-md mx-auto px-6">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-300">Escolha uma conversa na lista para começar a conversar</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Profile Drawer */}
      {activeConversation?.contact && (
        <ContactProfileDrawer
          isOpen={isProfileDrawerOpen}
          onClose={handleCloseProfile}
          contactId={activeConversation.contact.id}
        />
      )}
    </div>
  )
}

export default ConversationLayout