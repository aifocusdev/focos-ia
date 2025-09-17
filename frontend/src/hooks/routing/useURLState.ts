import { useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'

export type ConversationTab = 'mine' | 'queue' | 'bot'
export type SortField = 'updatedAt' | 'createdAt' | 'id'
export type SortOrder = 'asc' | 'desc'

export interface URLFilters {
  tab: ConversationTab
  search: string
  sortField: SortField
  sortOrder: SortOrder
  conversationId?: string
}

const DEFAULT_FILTERS: URLFilters = {
  tab: 'mine',
  search: '',
  sortField: 'updatedAt',
  sortOrder: 'desc'
}

export const useURLState = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): URLFilters => {
    const tab = (searchParams.get('tab') as ConversationTab) || DEFAULT_FILTERS.tab
    const search = searchParams.get('search') || DEFAULT_FILTERS.search
    const sortField = (searchParams.get('sortField') as SortField) || DEFAULT_FILTERS.sortField
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) || DEFAULT_FILTERS.sortOrder
    const conversationId = searchParams.get('conversation') || undefined

    return {
      tab,
      search,
      sortField,
      sortOrder,
      conversationId
    }
  }, [searchParams])

  // Update URL with new filters
  const updateURL = useCallback((filters: Partial<URLFilters>) => {
    const currentFilters = getFiltersFromURL()
    const newFilters = { ...currentFilters, ...filters }

    const params = new URLSearchParams()
    
    // Only add non-default values to keep URL clean
    if (newFilters.tab !== DEFAULT_FILTERS.tab) {
      params.set('tab', newFilters.tab)
    }
    
    if (newFilters.search && newFilters.search !== DEFAULT_FILTERS.search) {
      params.set('search', newFilters.search)
    }
    
    if (newFilters.sortField !== DEFAULT_FILTERS.sortField || newFilters.sortOrder !== DEFAULT_FILTERS.sortOrder) {
      params.set('sortField', newFilters.sortField)
      params.set('sortOrder', newFilters.sortOrder)
    }
    
    if (newFilters.conversationId) {
      params.set('conversation', newFilters.conversationId)
    }
    // Note: if conversationId is undefined, the parameter won't be added, effectively removing it

    // Update URL without causing a page reload
    const newSearch = params.toString()
    const newPath = location.pathname + (newSearch ? `?${newSearch}` : '')
    
    // Always navigate to ensure URL is updated, even if it seems the same
    navigate(newPath, { replace: true })
  }, [getFiltersFromURL, location, navigate])

  // Individual setters for convenience
  const setTab = useCallback((tab: ConversationTab) => {
    updateURL({ tab })
  }, [updateURL])

  const setSearch = useCallback((search: string) => {
    updateURL({ search })
  }, [updateURL])

  const setSort = useCallback((sortField: SortField, sortOrder: SortOrder) => {
    updateURL({ sortField, sortOrder })
  }, [updateURL])

  const setConversation = useCallback((conversationId?: string) => {
    updateURL({ conversationId })
  }, [updateURL])

  return {
    // Current state
    filters: getFiltersFromURL(),
    
    // Update functions
    updateURL,
    setTab,
    setSearch,
    setSort,
    setConversation,
    
    // Utilities
    getFiltersFromURL
  }
}