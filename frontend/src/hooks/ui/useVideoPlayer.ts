import { useState, useRef, useEffect, useCallback } from 'react'
import { getVideoMetadata } from '../../utils/mediaUtils'

interface UseVideoPlayerReturn {
  isPlaying: boolean
  isLoading: boolean
  isError: boolean
  isMuted: boolean
  isFullscreen: boolean
  isModalOpen: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
  dimensions: { width: number; height: number } | null
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  openModal: () => void
  closeModal: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export const useVideoPlayer = (src: string): UseVideoPlayerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  // Initialize video metadata
  useEffect(() => {
    if (src) {
      setIsLoading(true)
      setIsError(false)
      
      getVideoMetadata(src)
        .then((metadata) => {
          setDuration(metadata.duration)
          setDimensions({ width: metadata.width, height: metadata.height })
          setIsLoading(false)
        })
        .catch(() => {
          setIsError(true)
          setIsLoading(false)
        })
    }
  }, [src])

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      setIsLoading(false)
    }
    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setIsError(true)
      setIsLoading(false)
    }
    const handleVolumeChange = () => {
      setVolumeState(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const play = useCallback(async () => {
    if (videoRef.current && !isError) {
      try {
        await videoRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Error playing video:', error)
        setIsError(true)
      }
    }
  }, [isError])

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
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
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, newVolume))
      setVolumeState(newVolume)
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
        videoRef.current.muted = false
      }
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }, [])

  const openModal = useCallback(() => {
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    document.body.style.overflow = 'unset'
    // Also exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!isModalOpen) return

      switch (event.key) {
        case 'Escape':
          closeModal()
          break
        case ' ':
        case 'k':
          event.preventDefault()
          toggle()
          break
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          event.preventDefault()
          toggleMute()
          break
        case 'ArrowLeft':
          event.preventDefault()
          seek(Math.max(0, currentTime - 10))
          break
        case 'ArrowRight':
          event.preventDefault()
          seek(Math.min(duration, currentTime + 10))
          break
        case 'ArrowUp':
          event.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          event.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeydown)
      return () => document.removeEventListener('keydown', handleKeydown)
    }
  }, [isModalOpen, closeModal, toggle, toggleFullscreen, toggleMute, seek, currentTime, duration, setVolume, volume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return {
    isPlaying,
    isLoading,
    isError,
    isMuted,
    isFullscreen,
    isModalOpen,
    currentTime,
    duration,
    volume,
    progress,
    dimensions,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    openModal,
    closeModal,
    videoRef
  }
}