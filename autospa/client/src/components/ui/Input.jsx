import { forwardRef, useId } from 'react'

import { cn } from '../../lib/utils.js'

/**
 * Text input with label, error text, and optional left/right icon slots.
 * Designed to pair with react-hook-form (spread register() onto it).
 */
const Input = forwardRef(function Input(
  { label, error, leftIcon, rightIcon, className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId
  const hasError = Boolean(error)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={cn(
            'h-11 w-full rounded-control border bg-surface text-content placeholder:text-content-muted',
            'px-3.5 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            hasError ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-control',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted">{rightIcon}</span>
        )}
      </div>
      {hasError && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
