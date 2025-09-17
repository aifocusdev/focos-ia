import React, { useEffect, useRef, useCallback } from 'react'
import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import MessageBubble from './MessageBubble'
import LoadingSpinner from '../ui/LoadingSpinner'
import type { Message } from '../../types/conversation.types'

interface MessageThreadProps {
  messages: Message[]
  onLoadMore?: () => void
  hasMoreMessages?: boolean
  isLoadingMore?: boolean
  shouldScrollToBottom?: boolean
  conversationId?: string
}

const MessageThread: React.FC<MessageThreadProps> = ({ 
  messages, 
  onLoadMore, 
  hasMoreMessages = false,
  isLoadingMore = false,
  shouldScrollToBottom = true,
  conversationId
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollHeight = useRef<number>(0)
  const isLoadingOlderMessages = useRef<boolean>(false)
  const previousMessageCount = useRef<number>(0)
  const lastScrollTop = useRef<number>(0)
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje'
    } else if (isYesterday(date)) {
      return 'Ontem'
    } else {
      return format(date, 'dd MMMM yyyy', { locale: ptBR })
    }
  }

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [])

  // Enhanced load more handler with context tracking
  const handleLoadMoreClick = useCallback(() => {
    if (onLoadMore && hasMoreMessages && !isLoadingMore) {
      const container = containerRef.current
      if (container) {
        // Capture position immediately before calling onLoadMore
        const currentScrollTop = container.scrollTop
        const currentScrollHeight = container.scrollHeight
        
        console.log('📜 Capturing position via handleLoadMoreClick:', {
          scrollTop: currentScrollTop,
          scrollHeight: currentScrollHeight
        })
        
        lastScrollTop.current = currentScrollTop
        lastScrollHeight.current = currentScrollHeight
        isLoadingOlderMessages.current = true
      }
      onLoadMore()
    }
  }, [onLoadMore, hasMoreMessages, isLoadingMore])


  const renderDateSeparator = (date: Date) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
        {formatDate(date)}
      </div>
    </div>
  )


  // Group messages by date and determine which need avatars
  const groupedByDate: { date: Date; messages: Message[] }[] = []
  let lastDate: Date | null = null

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp)
    
    if (!lastDate || !isSameDay(lastDate, messageDate)) {
      groupedByDate.push({ date: messageDate, messages: [message] })
      lastDate = messageDate
    } else {
      groupedByDate[groupedByDate.length - 1].messages.push(message)
    }
  })

  // Handle scroll to detect when user scrolls to top
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || !onLoadMore || !hasMoreMessages || isLoadingMore) return
    
    // Check if user scrolled to near the top (within 100px)
    if (container.scrollTop <= 100) {
      console.log('🔄 User scrolled to top, loading more messages...')
      
      // Capture position immediately, not in a timeout
      const currentScrollTop = container.scrollTop
      const currentScrollHeight = container.scrollHeight
      
      console.log('📜 Capturing position via handleScroll:', {
        scrollTop: currentScrollTop,
        scrollHeight: currentScrollHeight
      })
      
      lastScrollTop.current = currentScrollTop
      lastScrollHeight.current = currentScrollHeight
      isLoadingOlderMessages.current = true
      onLoadMore()
    }
  }, [onLoadMore, hasMoreMessages, isLoadingMore])
  
  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Smart scroll management based on context
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const currentMessageCount = messages.length
    const previousCount = previousMessageCount.current

    console.log('📜 MessageThread scroll effect:', {
      currentMessageCount,
      previousCount,
      isLoadingOlderMessages: isLoadingOlderMessages.current,
      lastScrollTop: lastScrollTop.current,
      lastScrollHeight: lastScrollHeight.current,
      currentScrollHeight: container.scrollHeight,
      currentScrollTop: container.scrollTop
    })

    // If no messages, do nothing
    if (currentMessageCount === 0) {
      console.log('📜 No messages, resetting count')
      previousMessageCount.current = 0
      return
    }

    // First time loading messages for this conversation (and not loading older messages)
    if (previousCount === 0 && shouldScrollToBottom && !isLoadingOlderMessages.current) {
      console.log('📜 First time loading - scrolling to bottom')
      setTimeout(scrollToBottom, 100)
      previousMessageCount.current = currentMessageCount
      return
    }

    // Loading older messages - preserve scroll position
    if (isLoadingOlderMessages.current && currentMessageCount > previousCount) {
      const heightDiff = container.scrollHeight - lastScrollHeight.current
      const newScrollTop = lastScrollTop.current + heightDiff
      console.log('📜 Loading older messages - preserving position:', {
        heightDiff,
        newScrollTop,
        lastScrollTop: lastScrollTop.current,
        lastScrollHeight: lastScrollHeight.current,
        currentScrollHeight: container.scrollHeight
      })
      
      // Use requestAnimationFrame for more precise timing
      requestAnimationFrame(() => {
        if (heightDiff > 0 && newScrollTop >= 0) {
          container.scrollTop = newScrollTop
          console.log('📜 Applied new scroll position via RAF:', container.scrollTop)
        } else {
          console.log('📜 Invalid height calculation, maintaining current position')
        }
      })
      
      isLoadingOlderMessages.current = false
      previousMessageCount.current = currentMessageCount
      return
    }

    // New messages added (not loading older) - scroll to bottom if should
    if (!isLoadingOlderMessages.current && currentMessageCount > previousCount && shouldScrollToBottom) {
      console.log('📜 New messages - scrolling to bottom')
      scrollToBottom()
      previousMessageCount.current = currentMessageCount
      return
    }

    console.log('📜 No action taken, just updating count')
    previousMessageCount.current = currentMessageCount
  }, [messages.length, shouldScrollToBottom, scrollToBottom])

  // Reset counters when conversation changes (use stable conversationId)
  useEffect(() => {
    console.log('📜 RESETTING counters for conversationId:', conversationId)
    
    // Don't reset if we're in the middle of loading older messages for the same conversation
    if (!isLoadingOlderMessages.current) {
      previousMessageCount.current = 0
      isLoadingOlderMessages.current = false
      lastScrollHeight.current = 0
      lastScrollTop.current = 0
      console.log('📜 Reset applied for conversation change')
    } else {
      console.log('📜 Reset skipped - currently loading older messages')
    }
  }, [conversationId])

  // Initialize counters for first render with messages (separate from conversation change)
  useEffect(() => {
    if (previousMessageCount.current === 0 && messages.length > 0 && !isLoadingOlderMessages.current) {
      previousMessageCount.current = messages.length
      console.log('📜 Initialized previousCount to:', messages.length)
    }
  }, [messages.length])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-gray-800 p-4 pb-2">
      {/* Loading indicator for older messages */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Carregando mensagens antigas...</span>
          </div>
        </div>
      )}
      
      {/* Load more button as fallback */}
      {hasMoreMessages && !isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <button
            onClick={handleLoadMoreClick}
            className="text-blue-400 hover:text-blue-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Carregar mensagens antigas
          </button>
        </div>
      )}
      
      <div className="space-y-2">
        {groupedByDate.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {/* Date Separator */}
            {renderDateSeparator(group.date)}
            
            {/* Messages for this date */}
            <div className="space-y-1">
              {group.messages.map((message, messageIndex) => {
                const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null
                const nextMessage = messageIndex < group.messages.length - 1 ? group.messages[messageIndex + 1] : null
                
                const shouldShowAvatar = !prevMessage || 
                  prevMessage.direction !== message.direction ||
                  prevMessage.senderId !== message.senderId
                
                const isFirstInGroup = shouldShowAvatar
                const isLastInGroup = !nextMessage || 
                  nextMessage.direction !== message.direction ||
                  nextMessage.senderId !== message.senderId
                
                const isGrouped = !isFirstInGroup || !isLastInGroup

                return (
                  <MessageBubble 
                    key={message.id}
                    message={message} 
                    showAvatar={shouldShowAvatar && message.direction === 'inbound'}
                    isGrouped={isGrouped}
                    isFirst={isFirstInGroup}
                    isLast={isLastInGroup}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageThread