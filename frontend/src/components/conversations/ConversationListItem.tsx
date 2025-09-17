import React from 'react'
import { User } from 'lucide-react'
import { cn } from '../../utils/cn'
import { MESSAGE_STATUS_ICONS, MESSAGE_STATUS_COLORS } from '../../config/ui.constants'
import { formatConversationTime, formatMessagePreview } from '../../utils/formatters'
import type { Conversation } from '../../types/conversation.types'

interface ConversationListItemProps {
  conversation: Conversation
  isActive?: boolean
  onClick: () => void
}




const ConversationListItem: React.FC<ConversationListItemProps> = React.memo(({
  conversation,
  isActive,
  onClick
}) => {
  const { contact, lastMessage, unreadCount, assignedUser, updatedAt, isTyping } = conversation


  const getMessageStatus = () => {
    if (!lastMessage || lastMessage.direction === 'inbound') return null
    
    const StatusIcon = MESSAGE_STATUS_ICONS[lastMessage.status]
    
    return (
      <StatusIcon 
        className={cn('w-3 h-3 ml-1 flex-shrink-0', MESSAGE_STATUS_COLORS[lastMessage.status])} 
      />
    )
  }


  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center p-4 border-l-2 cursor-pointer transition-all duration-200 hover:bg-gray-800/50',
        'border-gray-600',
        isActive ? 'bg-gray-800/70 border-opacity-100' : 'bg-transparent border-opacity-50'
      )}
    >
      {/* Contact Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-medium text-lg">
          {contact?.avatar ? (
            <img 
              src={contact.avatar} 
              alt={contact?.name || 'Contato'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            contact?.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        
        {/* Online Status */}
        {contact?.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
        )}
      </div>

      {/* Conversation Details */}
      <div className="flex-1 min-w-0 ml-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-white font-medium truncate">
              {contact?.name || contact?.phone || 'Contato Desconhecido'}
            </h3>
            
            {/* Tags */}
            {contact?.tags && contact.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {contact.tags.slice(0, 3).map(tag => (
                  <div
                    key={tag.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                    title={tag.name}
                  />
                ))}
                {contact.tags.length > 3 && (
                  <span className="text-xs text-gray-400 ml-0.5">
                    +{contact.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {formatConversationTime(updatedAt)}
          </span>
        </div>

        {/* Message Preview Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {isTyping ? (
              <div className="flex items-center text-green-400 text-sm">
                <div className="flex space-x-1 mr-2">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>digitando...</span>
              </div>
            ) : (
              <p className="text-gray-300 text-sm truncate flex items-center">
                {lastMessage?.direction === 'outbound' && (
                  <span className="text-gray-400 mr-1">Você:</span>
                )}
                <span className="truncate">{formatMessagePreview(lastMessage)}</span>
                {getMessageStatus()}
              </p>
            )}
          </div>

          {/* Right Side Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Assigned User */}
            {assignedUser && (
              <div className="flex items-center text-xs text-gray-400" title={`Atribuído a ${assignedUser.name}`}>
                <User className="w-3 h-3" />
              </div>
            )}

            {/* Unread Count */}
            {unreadCount > 0 && (
              <div className="min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium px-1.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}

          </div>
        </div>

        {/* Additional Info Row */}
        {contact?.lastSeen && !contact?.isOnline && (
          <div className="text-xs text-gray-500 mt-1">
            Visto {formatConversationTime(contact.lastSeen)}
          </div>
        )}
      </div>
    </div>
  )
})

export default ConversationListItem