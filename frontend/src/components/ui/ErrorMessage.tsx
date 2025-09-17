import React from 'react'
import { clsx } from 'clsx'
import { AlertCircle } from 'lucide-react'

export interface ErrorMessageProps {
  message?: string
  className?: string
  showIcon?: boolean
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className, 
  showIcon = true 
}) => {
  if (!message) return null

  return (
    <div 
      className={clsx(
        'flex items-start gap-2 p-4 bg-red-900/20 border border-red-800/30 rounded-lg',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
      )}
      <p className="text-sm text-red-300 leading-relaxed">
        {message}
      </p>
    </div>
  )
}

export { ErrorMessage }