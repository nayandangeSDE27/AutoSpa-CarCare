import { cn } from '../../lib/utils.js'

/**
 * Simple controlled tab bar. tabs: [{ key, label, count? }].
 */
export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto border-b border-hairline', className)}>
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-content-secondary hover:text-content'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'ml-2 rounded-full px-1.5 py-0.5 text-xs',
                  isActive ? 'bg-accent-light text-primary' : 'bg-accent-light text-content-muted'
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
