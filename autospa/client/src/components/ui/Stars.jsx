import { Star } from 'lucide-react'

import { cn } from '../../lib/utils.js'

/** Read-only or interactive star rating. */
export function Stars({ value = 0, onChange, size = 'md', className }) {
  const px = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'
  const interactive = typeof onChange === 'function'
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange(n)}
          className={cn(interactive ? 'cursor-pointer' : 'cursor-default')}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(px, n <= Math.round(value) ? 'fill-primary text-primary' : 'text-control')}
          />
        </button>
      ))}
    </div>
  )
}

export default Stars
