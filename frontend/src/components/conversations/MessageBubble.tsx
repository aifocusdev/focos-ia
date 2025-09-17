import React from 'react'
import { Play } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatTime } from '../../utils/formatters'
import AudioPlayer from '../ui/AudioPlayer'
import ImageViewer from '../ui/ImageViewer'
import VideoPlayer from '../ui/VideoPlayer'
import DocumentViewer from '../ui/DocumentViewer'
import type { Message } from '../../types/conversation.types'

interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
  isGrouped?: boolean
  isFirst?: boolean
  isLast?: boolean
}



const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  message,
  showAvatar = false,
  isGrouped = false,
  isFirst = false,
  isLast = false
}) => {
  const { direction, content, type, timestamp, mediaUrl, fileName, fileSize, senderName } = message
  const isOutbound = direction === 'outbound'

  const renderMediaContent = () => {
    switch (type) {
      case 'image':
        return (
          <ImageViewer
            src={mediaUrl || ''}
            alt="Imagem"
            fileName={fileName}
            fileSize={fileSize}
          />
        )
      
      case 'video':
        return (
          <VideoPlayer
            src={mediaUrl || ''}
            fileName={fileName}
            fileSize={fileSize}
          />
        )
      
      case 'audio':
        return mediaUrl ? (
          <AudioPlayer src={mediaUrl} />
        ) : (
          <div className="flex items-center gap-3 bg-gray-700/50 border border-gray-600 rounded-lg p-3 min-w-[250px]">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Play className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-300 text-sm font-medium">
                Mensagem de áudio
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                Não foi possível carregar o arquivo
              </div>
            </div>
          </div>
        )
      
      case 'document':
        return (
          <DocumentViewer
            fileName={fileName || 'Documento'}
            fileUrl={mediaUrl}
            fileSize={fileSize}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col w-full px-2',
        isGrouped ? (isFirst ? 'mt-2' : isLast ? 'mb-2' : 'my-0.5') : 'my-3'
      )}
    >
      {/* Sender Name (only for outbound messages from users) */}
      {isOutbound && senderName && (
        <div className="flex justify-end mb-1">
          <span className="text-xs text-gray-400 mr-2">
            {senderName}
          </span>
        </div>
      )}

      <div
        className={cn(
          'flex w-full',
          isOutbound ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'flex max-w-[85%] sm:max-w-[75%] md:max-w-[65%]',
            isOutbound ? 'flex-row-reverse' : 'flex-row'
          )}
        >
        {/* Avatar */}
        {showAvatar && !isOutbound && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0 mt-auto mb-1">
            A
          </div>
        )}

        {/* Spacer for grouped messages without avatar */}
        {!showAvatar && !isOutbound && (
          <div className="w-11 flex-shrink-0" />
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'px-3 py-2 relative group',
            // Base styles with improved shadows
            'rounded-2xl shadow-md',
            // Direction-based styles with better colors
            isOutbound 
              ? 'bg-blue-600 text-white shadow-blue-900/20' 
              : 'bg-gray-700 text-white shadow-black/20',
            // Grouping styles for better visual flow
            isGrouped && !isFirst && (
              isOutbound 
                ? 'rounded-tr-lg' 
                : 'rounded-tl-lg'
            ),
            isGrouped && !isLast && (
              isOutbound 
                ? 'rounded-br-lg' 
                : 'rounded-bl-lg'
            ),
            // Hover effect for interactivity
            'transition-all duration-200 hover:shadow-lg',
            isOutbound && 'hover:shadow-blue-900/30',
            !isOutbound && 'hover:shadow-black/30'
          )}
        >
          {/* Media Content */}
          {type !== 'text' && renderMediaContent()}
          
          {/* Text Content */}
          {content && (
            <div className={cn(
              'text-sm leading-relaxed break-words',
              type !== 'text' && 'mt-2'
            )}>
              {content.split('\n').map((line, index, array) => (
                <React.Fragment key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Message Footer */}
          <div className={cn(
            'flex items-center justify-end gap-1 mt-2',
            'text-xs opacity-70'
          )}>
            <span className="text-xs">
              {formatTime(timestamp)}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
})

export default MessageBubble