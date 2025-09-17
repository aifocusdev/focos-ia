import React, { forwardRef, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const inputVariants = cva(
  'w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-gray-600 focus:border-red-700 focus:ring-2 focus:ring-red-900/30',
        error: 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  icon?: ReactNode
  onIconClick?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, label, error, icon, onIconClick, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-white"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            className={clsx(
              inputVariants({ variant: error ? 'error' : variant }),
              icon && 'pr-12',
              className
            )}
            ref={ref}
            id={inputId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          {icon && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              onClick={onIconClick}
              tabIndex={-1}
            >
              {icon}
            </button>
          )}
        </div>
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-400 animate-fade-in"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
export default Input