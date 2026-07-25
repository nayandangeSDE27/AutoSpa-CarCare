import { cn } from '../../lib/utils.js'

/**
 * Card — white surface, hairline border, ~13px radius, soft shadow.
 */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-card border border-hairline bg-surface shadow-card', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-5 pt-5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold text-content', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('mt-1 text-sm text-content-secondary', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-2 px-5 pb-5', className)} {...props} />
}

export default Card
