import { cn } from '../../lib/utils.js'

/**
 * Shimmer skeleton block. We use skeletons (not spinners) for data loading.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-control bg-accent-light',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export default Skeleton
