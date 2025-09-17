import { useState, useEffect, useCallback } from 'react'
import { getImageDimensions } from '../../utils/mediaUtils'

interface UseImageViewerReturn {
  isLoading: boolean
  isError: boolean
  isModalOpen: boolean
  dimensions: { width: number; height: number } | null
  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
}

export const useImageViewer = (src: string): UseImageViewerReturn => {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  // Load image and get dimensions
  useEffect(() => {
    if (src) {
      setIsLoading(true)
      setIsError(false)
      
      getImageDimensions(src)
        .then((dims) => {
          setDimensions(dims)
          setIsLoading(false)
        })
        .catch(() => {
          setIsError(true)
          setIsLoading(false)
        })
    }
  }, [src])

  const openModal = useCallback(() => {
    setIsModalOpen(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    // Restore body scroll
    document.body.style.overflow = 'unset'
  }, [])

  const toggleModal = useCallback(() => {
    if (isModalOpen) {
      closeModal()
    } else {
      openModal()
    }
  }, [isModalOpen, openModal, closeModal])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen, closeModal])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return {
    isLoading,
    isError,
    isModalOpen,
    dimensions,
    openModal,
    closeModal,
    toggleModal
  }
}