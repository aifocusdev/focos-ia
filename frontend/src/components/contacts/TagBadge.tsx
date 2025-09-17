import React from 'react'
import type { Tag } from '../../types/contact.types'

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}

const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }

  const baseClasses = 'inline-flex items-center rounded-full font-medium'

  const getTagStyle = () => {
    if (variant === 'outline') {
      return {
        borderColor: tag.color,
        color: tag.color,
        backgroundColor: 'transparent'
      }
    }
    
    // Default variant with background color
    return {
      backgroundColor: tag.color + '20', // Add transparency
      color: tag.color,
      borderColor: tag.color + '40'
    }
  }

  return (
    <span 
      className={`${baseClasses} ${sizeClasses[size]} border ${className}`}
      style={getTagStyle()}
      title={tag.name}
    >
      {tag.name}
    </span>
  )
}

export default TagBadge