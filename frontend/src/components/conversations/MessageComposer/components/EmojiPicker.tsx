import React, { useRef, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { X } from 'lucide-react'

interface EmojiPickerProps {
  show: boolean
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

const CustomEmojiPicker: React.FC<EmojiPickerProps> = ({
  show,
  onEmojiSelect,
  onClose
}) => {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50" ref={pickerRef}>
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-700/50 border-b border-gray-600">
          <span className="text-sm font-medium text-gray-300">Emojis</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            onEmojiSelect(emojiData.emoji)
          }}
          width={320}
          height={400}
          theme={'dark' as any}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{
            showPreview: false
          }}
        />
      </div>
    </div>
  )
}

export default CustomEmojiPicker