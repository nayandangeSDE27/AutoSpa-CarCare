import { Inbox } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-control bg-surface px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-light">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-content-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
