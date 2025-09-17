import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuickReplyStore } from '../../../../stores/quickReplyStore'
import type { QuickReply } from '../../../../types/quickReply.types'

export interface QuickReplyPaletteState {
  isOpen: boolean
  searchQuery: string
  selectedIndex: number
  filteredReplies: QuickReply[]
  triggerPosition: number
  triggerStart: number
}

export interface QuickReplyPaletteActions {
  openPalette: (position: number, start: number) => void
  closePalette: () => void
  setSearchQuery: (query: string) => void
  selectNext: () => void
  selectPrevious: () => void
  selectCurrent: () => QuickReply | null
  selectReply: (reply: QuickReply) => void
  handleKeyDown: (e: React.KeyboardEvent) => boolean
}

export interface UseQuickReplyPaletteReturn extends QuickReplyPaletteState, QuickReplyPaletteActions {}

export const useQuickReplyPalette = (onInsertReply: (reply: QuickReply, triggerStart: number, triggerEnd: number) => void) => {
  const { quickReplies, fetchQuickReplies, isLoading } = useQuickReplyStore()
  
  const [state, setState] = useState<QuickReplyPaletteState>({
    isOpen: false,
    searchQuery: '',
    selectedIndex: 0,
    filteredReplies: [],
    triggerPosition: 0,
    triggerStart: 0
  })

  // Load quick replies when the hook is first used
  useEffect(() => {
    if (quickReplies.length === 0 && !isLoading) {
      fetchQuickReplies()
    }
  }, [quickReplies.length, isLoading, fetchQuickReplies])

  // Filter replies based on search query
  const filteredReplies = useMemo(() => {
    if (!state.searchQuery.trim()) {
      return quickReplies.slice(0, 10) // Limit to first 10 for performance
    }
    
    const query = state.searchQuery.toLowerCase().trim()
    return quickReplies
      .filter(reply => 
        reply.title.toLowerCase().includes(query) ||
        reply.shortcut.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit results
  }, [quickReplies, state.searchQuery])

  // Update filtered replies in state
  useEffect(() => {
    setState(prev => {
      const maxIndex = Math.max(0, filteredReplies.length - 1)
      // Only reset selectedIndex if it's out of bounds, preserve user navigation
      const needsReset = prev.selectedIndex > maxIndex
      
      return {
        ...prev,
        filteredReplies,
        selectedIndex: needsReset ? maxIndex : prev.selectedIndex
      }
    })
  }, [filteredReplies])

  // Ensure palette starts closed when component mounts
  useEffect(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const openPalette = useCallback((position: number, start: number) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      triggerPosition: position,
      triggerStart: start,
      selectedIndex: 0,
      searchQuery: ''
    }))
  }, [])

  const closePalette = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      searchQuery: '',
      selectedIndex: 0
    }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => {
      // Don't reset selectedIndex if query hasn't actually changed
      if (prev.searchQuery === query) {
        return prev // No change needed
      }
      
      return {
        ...prev,
        searchQuery: query,
        selectedIndex: 0 // Only reset when query actually changes
      }
    })
  }, [])

  const selectNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: Math.min(prev.selectedIndex + 1, Math.max(0, prev.filteredReplies.length - 1))
    }))
  }, [])

  const selectPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: Math.max(0, prev.selectedIndex - 1)
    }))
  }, [])

  const selectCurrent = useCallback(() => {
    if (state.filteredReplies.length > 0 && state.selectedIndex < state.filteredReplies.length) {
      return state.filteredReplies[state.selectedIndex]
    }
    return null
  }, [state.filteredReplies, state.selectedIndex])

  const selectReply = useCallback((reply: QuickReply) => {
    const triggerEnd = state.triggerStart + 1 + state.searchQuery.length // "/" + search query
    onInsertReply(reply, state.triggerStart, triggerEnd)
    closePalette()
  }, [state.triggerStart, state.searchQuery, onInsertReply, closePalette])

  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!state.isOpen) return false

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        closePalette()
        return true

      case 'ArrowDown':
        e.preventDefault()
        selectNext()
        return true

      case 'ArrowUp':
        e.preventDefault()
        selectPrevious()
        return true

      case 'Enter': {
        e.preventDefault()
        const selectedReply = selectCurrent()
        if (selectedReply) {
          selectReply(selectedReply)
        }
        return true
      }

      case 'Tab': {
        e.preventDefault()
        const tabSelectedReply = selectCurrent()
        if (tabSelectedReply) {
          selectReply(tabSelectedReply)
        }
        return true
      }

      default:
        return false
    }
  }, [state.isOpen, closePalette, selectNext, selectPrevious, selectCurrent, selectReply])

  return {
    ...state,
    filteredReplies,
    openPalette,
    closePalette,
    setSearchQuery,
    selectNext,
    selectPrevious,
    selectCurrent,
    selectReply,
    handleKeyDown
  }
}