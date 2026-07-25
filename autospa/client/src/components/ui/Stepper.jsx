import { Check } from 'lucide-react'

import { cn } from '../../lib/utils.js'

/** Horizontal step indicator. steps: string[]; current is 0-indexed. */
export function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  done && 'bg-primary text-primary-foreground',
                  active && 'bg-primary text-primary-foreground ring-4 ring-[var(--ring)]',
                  !done && !active && 'bg-accent-light text-content-muted'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-medium sm:block', active ? 'text-content' : 'text-content-secondary')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn('mx-2 h-0.5 flex-1', done ? 'bg-primary' : 'bg-hairline')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default Stepper
