import React from 'react'
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAudioPlayer } from '../../hooks/ui/useAudioPlayer'

interface AudioPlayerProps {
  src: string
  className?: string
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
  const {
    isPlaying,
    isLoading,
    isError,
    currentTime,
    duration,
    progress,
    toggle,
    seek
  } = useAudioPlayer(src)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    seek(newTime)
  }

  if (isError) {
    return (
      <div className={cn(
        "flex items-center gap-3 bg-red-900/20 border border-red-700/30 rounded-lg p-3 min-w-[250px]",
        className
      )}>
        <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-red-300 text-sm font-medium">
            Erro ao carregar áudio
          </div>
          <div className="text-red-400 text-xs mt-0.5">
            Não foi possível reproduzir este arquivo
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 bg-gray-700/80 backdrop-blur-sm rounded-lg p-3",
      "min-w-[200px] w-full max-w-[280px] sm:max-w-[320px]",
      className
    )}>
      {/* Play/Pause Button */}
      <button
        onClick={toggle}
        disabled={isLoading}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700",
          "touch-manipulation" // Better touch responsiveness
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      {/* Progress and Time */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div 
          className={cn(
            "w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-1.5 group",
            "touch-manipulation" // Better touch responsiveness
          )}
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-150 group-hover:bg-blue-400 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Progress handle for better mobile interaction */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 -mr-1.5" />
          </div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span className="font-mono tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="font-mono text-gray-400 tabular-nums">
            {duration > 0 ? formatTime(duration) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer