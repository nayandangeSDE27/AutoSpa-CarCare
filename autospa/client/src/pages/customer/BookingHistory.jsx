import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarCheck, Download } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { useBookings, useCancelBooking } from '../../hooks/useBookings.js'
import { currency, formatDate, formatTime, STATUS_META } from '../../lib/format.js'

const ACTIVE = ['PENDING', 'ACCEPTED', 'WORKER_ASSIGNED', 'IN_PROGRESS']

export default function BookingHistory() {
  const { data: bookings, isLoading } = useBookings()
  const cancel = useCancelBooking()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const b = bookings || []
    return {
      all: b.length,
      upcoming: b.filter((x) => ACTIVE.includes(x.status)).length,
      completed: b.filter((x) => x.status === 'COMPLETED').length,
      cancelled: b.filter((x) => ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(x.status)).length,
    }
  }, [bookings])

  const filtered = useMemo(() => {
    let list = bookings || []
    if (tab === 'upcoming') list = list.filter((x) => ACTIVE.includes(x.status))
    if (tab === 'completed') list = list.filter((x) => x.status === 'COMPLETED')
    if (tab === 'cancelled') list = list.filter((x) => ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(x.status))
    if (q.trim()) list = list.filter((x) => x.bookingNumber.toLowerCase().includes(q.trim().toLowerCase()))
    return [...list].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }, [bookings, tab, q])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">My Bookings</h1>
      <p className="mb-5 text-content-secondary">Track and manage your services.</p>

      <div className="mb-4"><Input placeholder="Search by booking number…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div>

      <Tabs
        className="mb-5"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { key: 'completed', label: 'Completed', count: counts.completed },
          { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        ]}
      />

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !filtered.length ? (
        <EmptyState
          icon={CalendarCheck}
          title={tab === 'all' ? 'No bookings yet' : `No ${tab} bookings`}
          description={tab === 'all' ? 'Book your first service to see it here.' : 'Nothing in this tab.'}
          action={tab === 'all' ? <Link to="/customer/garages"><Button>Browse garages</Button></Link> : null}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const meta = STATUS_META[b.status] || {}
            const isActive = ACTIVE.includes(b.status)
            return (
              <Card key={b._id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="tabular text-sm font-semibold text-content">{b.bookingNumber}</p>
                      <Badge className={meta.cls}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-content-secondary">{formatDate(b.startTime)} · {formatTime(b.startTime)}</p>
                    <p className="mt-0.5 text-sm text-content-muted">{b.services.map((s) => s.nameAtBooking).join(', ')} · <span className="tabular">{currency(b.totalAmount)}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/customer/bookings/${b._id}`}><Button variant="secondary" size="sm">View</Button></Link>
                    {isActive && b.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" onClick={() => window.confirm('Cancel this booking?') && cancel.mutate(b._id)}>Cancel</Button>
                    )}
                    {b.status === 'COMPLETED' && (
                      <Link to="/customer/reviews"><Button size="sm">Review</Button></Link>
                    )}
                    {['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(b.status) && (
                      <Link to={`/customer/bookings/new?garageId=${b.garageId}`}><Button size="sm">Rebook</Button></Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
