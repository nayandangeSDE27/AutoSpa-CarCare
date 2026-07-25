import { cn } from '../../lib/utils.js'

export function Badge({ className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

export default Badge
