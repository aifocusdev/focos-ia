import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-gray-300',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-t-gray-600',
        md: 'h-6 w-6 border-t-gray-600',
        lg: 'h-8 w-8 border-t-gray-700',
        xl: 'h-12 w-12 border-t-gray-800',
      },
      variant: {
        default: 'border-t-gray-600',
        primary: 'border-t-primary-600',
        white: 'border-gray-200 border-t-white',
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
)

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size, 
  variant, 
  className 
}) => {
  return (
    <div className={cn(spinnerVariants({ size, variant }), className)} />
  )
}

export default LoadingSpinner