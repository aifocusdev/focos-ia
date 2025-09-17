import { useEffect, useCallback } from 'react'

export const useDraftSaving = (conversationId: string, message: string) => {
  const draftKey = `draft_${conversationId}`

  // Load saved draft - função simples sem dependências
  const loadDraft = useCallback((): string => {
    return localStorage.getItem(`draft_${conversationId}`) || ''
  }, [conversationId])

  // Auto-save draft com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (message.trim()) {
        localStorage.setItem(draftKey, message)
      } else {
        localStorage.removeItem(draftKey)
      }
    }, 1000) // Aumentei para 1 segundo para reduzir frequência

    return () => clearTimeout(timeoutId)
  }, [message, draftKey])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey)
  }, [draftKey])

  return { loadDraft, clearDraft }
}