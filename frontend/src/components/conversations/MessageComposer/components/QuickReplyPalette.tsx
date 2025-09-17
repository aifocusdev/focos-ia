import React, { useEffect, useRef } from 'react'
import { Zap, Hash } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import type { QuickReply } from '../../../../types/quickReply.types'

interface QuickReplyPaletteProps {
  show: boolean
  replies: QuickReply[]
  selectedIndex: number
  searchQuery: string
  onSelectReply: (reply: QuickReply) => void
  isLoading?: boolean
}

const QuickReplyPalette: React.FC<QuickReplyPaletteProps> = ({
  show,
  replies,
  selectedIndex,
  searchQuery,
  onSelectReply,
  isLoading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedItemRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to selected item
  useEffect(() => {
    if (show && selectedIndex >= 0 && scrollContainerRef.current && replies.length > 0) {
      const container = scrollContainerRef.current
      const items = container.querySelectorAll('button')
      const selectedItem = items[selectedIndex]
      
      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      }
    }
  }, [selectedIndex, show, replies.length])

  if (!show) return null

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 bg-gray-700/50 border-b border-gray-600 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            {searchQuery ? `Buscando "${searchQuery}"` : 'Respostas Rápidas'}
          </span>
          {isLoading && (
            <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Content */}
        <div ref={scrollContainerRef} className="max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Carregando templates...
            </div>
          ) : replies.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? (
                <div>
                  <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum template encontrado para "{searchQuery}"</p>
                  <p className="text-xs mt-1">Tente buscar por outro termo</p>
                </div>
              ) : (
                <div>
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum template disponível</p>
                  <p className="text-xs mt-1">Crie templates na seção "Respostas Rápidas"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-1">
              {replies.map((reply, index) => (
                <button
                  key={reply.id}
                  ref={index === selectedIndex ? selectedItemRef : undefined}
                  onClick={() => onSelectReply(reply)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors',
                    'border-l-2 border-transparent',
                    index === selectedIndex && 'bg-gray-700 border-blue-500'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Shortcut Badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-block px-2 py-0.5 bg-gray-600 text-blue-400 text-xs font-mono rounded">
                        {reply.shortcut}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-1">
                        {reply.title}
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {truncateText(reply.body)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {replies.length > 0 && (
          <div className="px-3 py-2 bg-gray-700/30 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>↑↓ para navegar • Enter para selecionar • Esc para fechar</span>
              <span>{replies.length} template{replies.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickReplyPalette