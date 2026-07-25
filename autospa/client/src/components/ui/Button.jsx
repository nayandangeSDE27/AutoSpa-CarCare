import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '../../lib/utils.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft',
        secondary:
          'bg-surface text-content border border-control hover:bg-accent-light hover:border-strong',
        ghost: 'bg-transparent text-content hover:bg-accent-light',
        danger: 'bg-danger text-danger-foreground hover:bg-danger-hover shadow-soft',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

const Button = forwardRef(function Button(
  { className, variant, size, loading = false, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})

export { buttonVariants }
export default Button
