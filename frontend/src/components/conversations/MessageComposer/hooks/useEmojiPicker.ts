import { useState, useCallback } from 'react'

export const useEmojiPicker = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev)
  }, [])

  const closeEmojiPicker = useCallback(() => {
    setShowEmojiPicker(false)
  }, [])

  const selectEmoji = useCallback((emoji: string, onSelect?: (emoji: string) => void) => {
    onSelect?.(emoji)
    setShowEmojiPicker(false)
  }, [])

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    closeEmojiPicker,
    selectEmoji
  }
}