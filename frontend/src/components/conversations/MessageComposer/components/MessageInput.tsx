import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '../../../../utils/cn'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onBlur: (e: React.FocusEvent) => void
  disabled: boolean
  placeholder: string
  maxLength: number
  onTemplateTriggered?: (position: number, start: number, query: string) => void
  onTemplateClosed?: () => void
  children?: React.ReactNode // For internal buttons
}

export interface MessageInputRef {
  focus: () => void
  blur: () => void
  insertTextAtPosition: (text: string, start: number, end: number) => void
  getCursorPosition: () => number
  setCursorPosition: (position: number) => void
}

const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  value,
  onChange,
  onKeyDown,
  onBlur,
  disabled,
  placeholder,
  maxLength,
  onTemplateTriggered,
  onTemplateClosed,
  children
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastTriggerTextRef = useRef<string>('')
  const remainingChars = maxLength - value.length
  const isNearLimit = remainingChars < 100

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    },
    blur: () => {
      textareaRef.current?.blur()
    },
    insertTextAtPosition: (text: string, start: number, end: number) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const newValue = value.substring(0, start) + text + value.substring(end)
      
      // Use React's state update to avoid triggering events
      onChange(newValue)

      // Set cursor position after the inserted text with proper timing
      requestAnimationFrame(() => {
        const newCursorPosition = start + text.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      })
    },
    getCursorPosition: () => {
      return textareaRef.current?.selectionStart ?? 0
    },
    setCursorPosition: (position: number) => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.setSelectionRange(position, position)
      }
    }
  }))

  // Note: Auto-resize is now handled by TextareaAutosize component

  // Template trigger detection with debounce
  useEffect(() => {
    if (!onTemplateTriggered || !onTemplateClosed) return

    const timeoutId = setTimeout(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Only trigger if textarea is focused (user is actively typing)
      if (document.activeElement !== textarea) {
        onTemplateClosed()
        return
      }

      const cursorPosition = textarea.selectionStart || 0
      const textBeforeCursor = value.substring(0, cursorPosition)
      
      // Only process if the text before cursor actually changed
      if (lastTriggerTextRef.current === textBeforeCursor) {
        return // No change in trigger text, skip processing
      }
      
      lastTriggerTextRef.current = textBeforeCursor
      
      // Look for "/" trigger at the end of text before cursor
      // Only trigger if "/" is at word boundary (start of line or after space)
      const triggerMatch = textBeforeCursor.match(/(^|[\s\n])\/([^/\s\n]*)$/)
      
      if (triggerMatch) {
        const fullMatch = triggerMatch[0]
        const searchQuery = triggerMatch[2] || ''
        const triggerStart = cursorPosition - fullMatch.length + (triggerMatch[1] ? triggerMatch[1].length : 0)
        onTemplateTriggered(cursorPosition, triggerStart, searchQuery)
      } else {
        onTemplateClosed()
      }
    }, 150) // Slightly longer debounce

    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, onTemplateTriggered, onTemplateClosed])

  return (
    <div className="flex-1 relative">
      <TextareaAutosize
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        minRows={1}
        maxRows={5}
        maxLength={maxLength}
        className={cn(
          'w-full p-3 pr-28 bg-gray-700 border border-gray-600',
          'text-white placeholder-gray-400 rounded-2xl resize-none',
          'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      
      {/* Internal buttons container */}
      {children && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
      
      {/* Character Counter */}
      {isNearLimit && (
        <div className={cn(
          'absolute bottom-1 right-2 text-xs pointer-events-none',
          remainingChars < 50 ? 'text-red-400' : 'text-yellow-400'
        )}>
          {remainingChars}
        </div>
      )}
    </div>
  )
})

MessageInput.displayName = 'MessageInput'

export default MessageInput