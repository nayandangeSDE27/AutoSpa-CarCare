import { Link } from 'react-router-dom'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { cn } from '../../lib/utils.js'
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification } from '../../hooks/useNotifications.js'
import { useAuthStore } from '../../stores/auth.store.js'

function groupByDate(items) {
  const groups = {}
  for (const n of items) {
    const d = new Date(n.createdAt)
    const key = d.toDateString() === new Date().toDateString() ? 'Today' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    ;(groups[key] ||= []).push(n)
  }
  return groups
}

export default function Notifications() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllRead()
  const del = useDeleteNotification()
  const role = useAuthStore((s) => s.user?.role)

  const items = data?.items || []
  const basePath = role === 'garage_owner' ? '/garage' : role === 'admin' ? '/admin' : '/customer'
  const unread = data?.unread || 0
  const groups = groupByDate(items)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-content">Notifications</h1>
          <p className="text-content-secondary">{unread > 0 ? `${unread} unread` : 'You’re all caught up'}</p>
        </div>
        {unread > 0 && <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : !items.length ? (
        <EmptyState icon={Bell} title="No notifications" description="Updates about your bookings will appear here." />
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([date, list]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-muted">{date}</p>
              <div className="space-y-2">
                {list.map((n) => (
                  <Card key={n._id} className={cn('flex items-start gap-3 p-4', !n.isRead && 'border-primary/30 bg-accent-light/40')}>
                    <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-primary')} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-content">{n.title}</p>
                      {n.message && <p className="text-sm text-content-secondary">{n.message}</p>}
                      {n.relatedType === 'Booking' && n.relatedId && (
                        <Link to={`${basePath}/bookings/${n.relatedId}`} className="mt-1 inline-block text-sm font-medium text-primary">View booking →</Link>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!n.isRead && (
                        <button onClick={() => markRead.mutate(n._id)} aria-label="Mark read" className="rounded p-1.5 text-content-muted hover:bg-accent-light hover:text-primary"><Check className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => del.mutate(n._id)} aria-label="Delete" className="rounded p-1.5 text-content-muted hover:bg-accent-light hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
