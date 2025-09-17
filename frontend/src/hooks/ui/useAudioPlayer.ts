import { useState, useRef, useEffect, useCallback } from 'react'

interface UseAudioPlayerReturn {
  isPlaying: boolean
  isLoading: boolean
  isError: boolean
  currentTime: number
  duration: number
  progress: number
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
}

export const useAudioPlayer = (src: string): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Initialize audio element
  useEffect(() => {
    if (src) {
      audioRef.current = new Audio(src)
      const audio = audioRef.current

      // Event listeners
      const handleLoadStart = () => setIsLoading(true)
      const handleCanPlay = () => setIsLoading(false)
      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0)
        setIsLoading(false)
      }
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
      const handleEnded = () => setIsPlaying(false)
      const handleError = () => {
        setIsError(true)
        setIsLoading(false)
      }

      audio.addEventListener('loadstart', handleLoadStart)
      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart)
        audio.removeEventListener('canplay', handleCanPlay)
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
        audio.pause()
        audioRef.current = null
      }
    }
  }, [src])

  const play = useCallback(async () => {
    if (audioRef.current && !isError) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Error playing audio:', error)
        setIsError(true)
      }
    }
  }, [isError])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return {
    isPlaying,
    isLoading,
    isError,
    currentTime,
    duration,
    progress,
    play,
    pause,
    toggle,
    seek,
    setCurrentTime
  }
}