import React, { useEffect, useCallback, useRef } from 'react'
import { Search, SortDesc, Users, Filter, Mail, MailOpen } from 'lucide-react'
import { useConversationStore } from '../../stores/conversationStore'
import { useURLState } from '../../hooks'
import ConversationListItem from './ConversationListItem'
import LoadingSpinner from '../ui/LoadingSpinner'
import Input from '../ui/Input'
import { TagSelector } from '../ui/TagSelector'
import { cn } from '../../utils/cn'
import { CONVERSATION_SORT_OPTIONS } from '../../config/ui.constants'
import type { ConversationSort } from '../../types/conversation.types'

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void
  selectedConversationId?: string
}




const ConversationList: React.FC<ConversationListProps> = ({
  onConversationSelect,
  selectedConversationId
}) => {
  const {
    conversations,
    isLoading,
    sort,
    searchQuery,
    activeTab,
    hasMore,
    filters,
    loadConversations,
    loadMoreConversations,
    setFilters,
    setSort,
    setSearchQuery,
    setActiveTab
  } = useConversationStore()
  
  // URL state management
  const { filters: urlFilters, setTab, setSearch, setSort: setURLSort } = useURLState()

  const [searchInput, setSearchInput] = React.useState(searchQuery || urlFilters.search)
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { startPolling, stopPolling } = useConversationStore()

  // Sync URL filters to store on mount
  useEffect(() => {
    // Set filters from URL first
    if (urlFilters.tab !== activeTab) {
      setActiveTab(urlFilters.tab)
    }
    if (urlFilters.search !== searchQuery) {
      setSearchQuery(urlFilters.search)
    }
    if (urlFilters.sortField !== sort.field || urlFilters.sortOrder !== sort.order) {
      setSort({ field: urlFilters.sortField, order: urlFilters.sortOrder })
    }
    
    // Then load conversations and start polling
    loadConversations(true)
    startPolling() // Start polling fallback
    
    return () => {
      stopPolling() // Cleanup on unmount
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
      setSearch(searchInput) // Update URL
    }, 500) as ReturnType<typeof setTimeout>

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchInput])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || isLoading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100 // pixels from bottom

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMoreConversations()
    }
  }, [isLoading, hasMore, loadMoreConversations])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])


  const handleSortChange = (newSort: ConversationSort) => {
    setSort(newSort)
    setURLSort(newSort.field, newSort.order) // Update URL
  }

  const handleUnreadToggle = (unread: boolean) => {
    setFilters({ ...filters, unread: unread || undefined })
  }

  const handleTagSelection = (tagIds: number[]) => {
    setFilters({ ...filters, tag_ids: tagIds.length > 0 ? tagIds : undefined })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.unread) count++
    if (filters.tag_ids && filters.tag_ids.length > 0) count++
    return count
  }

  const getTotalUnreadCount = () => {
    return conversations?.reduce((sum, c) => sum + c.unreadCount, 0) || 0
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Conversas</h2>
          <div className="flex items-center gap-2">
            {getTotalUnreadCount() > 0 && (
              <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {getTotalUnreadCount()}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-3">
          <button
            onClick={() => {
              setActiveTab('mine')
              setTab('mine') // Update URL
            }}
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'mine' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            Minhas
          </button>
          <button
            onClick={() => {
              setActiveTab('queue')
              setTab('queue') // Update URL
            }}
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'queue' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            Fila
          </button>
          <button
            onClick={() => {
              setActiveTab('bot')
              setTab('bot') // Update URL
            }}
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
              activeTab === 'bot' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            Bot
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={`${sort.field}-${sort.order}`}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const [field, order] = e.target.value.split('-') as [ConversationSort['field'], ConversationSort['order']]
                handleSortChange({ field, order })
              }}
              className="w-full appearance-none bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-blue-500"
            >
              {CONVERSATION_SORT_OPTIONS.map((option) => (
                <option key={`${option.field}-${option.order}`} value={`${option.field}-${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
            <SortDesc className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors',
              showAdvancedFilters || getActiveFiltersCount() > 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
            )}
          >
            <Filter className="w-4 h-4" />
            {getActiveFiltersCount() > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-3 p-3 bg-gray-800 rounded-md border border-gray-600 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Unread Filter */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Apenas não lidas</span>
              <button
                onClick={() => handleUnreadToggle(!filters.unread)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                  filters.unread
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                )}
              >
                {filters.unread ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                {filters.unread ? 'Ativas' : 'Todas'}
              </button>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Filtrar por tags</label>
              <TagSelector
                selectedTagIds={filters.tag_ids || []}
                onSelectionChange={handleTagSelection}
                placeholder="Selecionar tags..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {isLoading && (conversations?.length || 0) === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <LoadingSpinner size="md" className="mb-2" />
            <p className="text-sm">Carregando conversas...</p>
          </div>
        ) : (conversations?.length || 0) === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Users className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma conversa encontrada</p>
            {searchQuery ? (
              <button 
                onClick={() => {
                  setFilters({ search: '' })
                  setSearchInput('')
                }}
                className="text-blue-400 text-xs mt-1 hover:underline"
              >
                Limpar busca
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {conversations?.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedConversationId}
                onClick={() => onConversationSelect(conversation.id)}
              />
            ))}
            
            {/* Loading more indicator */}
            {isLoading && (conversations?.length || 0) > 0 && (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-400">Carregando mais...</span>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && (conversations?.length || 0) > 10 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Todas as conversas foram carregadas
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ConversationList