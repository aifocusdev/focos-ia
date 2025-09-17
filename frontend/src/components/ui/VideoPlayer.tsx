import React, { useState } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Download,
  Loader2,
  AlertCircle,
  Expand,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useVideoPlayer } from '../../hooks/ui/useVideoPlayer'
import { formatDuration, formatFileSize } from '../../utils/mediaUtils'

interface VideoPlayerProps {
  src: string
  fileName?: string
  fileSize?: number
  className?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  fileName,
  fileSize,
  className 
}) => {
  const {
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
    toggle,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    openModal,
    closeModal,
    videoRef
  } = useVideoPlayer(src)

  const [showControls, setShowControls] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    seek(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleDownload = () => {
    window.open(src, '_blank')
  }

  if (isError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-red-900/20 border border-red-700/30 rounded-lg p-6 min-h-[200px]",
        className
      )}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-red-300 text-sm font-medium">
            Erro ao carregar vídeo
          </div>
          <div className="text-red-400 text-xs mt-1">
            Não foi possível reproduzir este arquivo
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail/Preview */}
      <div className={cn("relative bg-black rounded-lg overflow-hidden group", className)}>
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto max-h-80 sm:max-h-96 md:max-h-[500px] object-contain"
          preload="metadata"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          onClick={toggle}
        />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <div className="text-white text-sm">Carregando vídeo...</div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Info (top) */}
        {fileName && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium truncate">
                  {fileName}
                </div>
                {(dimensions || fileSize) && (
                  <div className="text-white/75 text-xs mt-0.5">
                    {dimensions && `${dimensions.width}×${dimensions.height}`}
                    {dimensions && fileSize && ' • '}
                    {fileSize && formatFileSize(fileSize)}
                  </div>
                )}
              </div>
              
              {/* Expand Button */}
              <button
                onClick={openModal}
                className="ml-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title="Expandir"
              >
                <Expand className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="p-4 space-y-3">
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-white/30 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-150 relative group-hover/progress:h-2.5"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150 -mr-2" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={toggle}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>

              {/* Time Display */}
              <div className="text-white text-sm font-mono tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Volume Control */}
              <div 
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Volume Slider */}
                {showVolumeSlider && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/90 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-white text-xs">{Math.round(volume * 100)}%</div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                        style={{ writingMode: 'horizontal-tb' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-white" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center p-4">
            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={src}
                className="max-w-full max-h-full object-contain"
                controls={false}
                preload="metadata"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(isPlaying ? false : true)}
                onClick={toggle}
              />

              {/* Modal Controls Overlay */}
              <div 
                className={cn(
                  "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300",
                  showControls || !isPlaying ? "opacity-100" : "opacity-0"
                )}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                  <div className="text-white">
                    {fileName && (
                      <div className="font-medium text-lg">{fileName}</div>
                    )}
                    {(dimensions || fileSize) && (
                      <div className="text-white/75 text-sm mt-1">
                        {dimensions && `${dimensions.width}×${dimensions.height}`}
                        {dimensions && fileSize && ' • '}
                        {fileSize && formatFileSize(fileSize)}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={closeModal}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="p-6 space-y-4">
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-2 bg-white/30 rounded-full cursor-pointer group/progress"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-150 relative group-hover/progress:h-3"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150 -mr-2.5" />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause Button */}
                      <button
                        onClick={toggle}
                        disabled={isLoading}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>

                      {/* Time Display */}
                      <div className="text-white text-base font-mono tabular-nums">
                        {formatDuration(currentTime)} / {formatDuration(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Volume Control */}
                      <div 
                        className="relative flex items-center"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <button
                          onClick={toggleMute}
                          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>

                        {/* Volume Slider */}
                        {showVolumeSlider && (
                          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/90 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                              <div className="text-white text-sm">{Math.round(volume * 100)}%</div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-24 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-white" />
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-5 h-5 text-white" />
                        ) : (
                          <Maximize2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="absolute bottom-4 left-4 text-white/60 text-xs">
              <div>Teclas: Espaço/K=Play/Pause • F=Tela Cheia • M=Mute • ←→=10s • ↑↓=Volume</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoPlayer