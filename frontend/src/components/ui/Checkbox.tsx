import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

const checkboxVariants = cva(
  'relative inline-flex items-center justify-center w-5 h-5 border-2 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
  {
    variants: {
      variant: {
        default: 'border-gray-600 text-white focus:ring-red-900/30',
        error: 'border-red-500 focus:ring-red-500/30'
      },
      isChecked: {
        true: 'bg-red-700 border-red-700',
        false: 'bg-gray-800 hover:bg-gray-700'
      }
    },
    defaultVariants: {
      variant: 'default',
      isChecked: false
    }
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, label, description, error, checked, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${checkboxId}-error`
    const descriptionId = `${checkboxId}-description`
    
    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              ref={ref}
              id={checkboxId}
              checked={checked}
              aria-describedby={clsx(
                error && errorId,
                description && descriptionId
              )}
              aria-invalid={error ? 'true' : 'false'}
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={clsx(
                checkboxVariants({ 
                  variant: error ? 'error' : variant,
                  isChecked: checked 
                }),
                className
              )}
            >
              {checked && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </label>
          </div>
          
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label 
                  htmlFor={checkboxId}
                  className="block text-sm font-medium text-white cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p 
                  id={descriptionId}
                  className="text-sm text-gray-400 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-400 animate-fade-in ml-8"
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

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }
export default Checkbox