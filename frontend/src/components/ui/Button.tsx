import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-red-900 text-white hover:bg-red-800 focus:ring-red-900/50 shadow-sm',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-600/50 border border-gray-600',
        outline: 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500/50',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500/50',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/50 shadow-sm',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base rounded-lg',
        sm: 'h-9 px-4 py-2 text-sm rounded-md',
        lg: 'h-14 px-8 py-4 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button