import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarCheck, Check, X } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { currency, formatDate, formatTime, STATUS_META } from '../../lib/format.js'
import { useGarageBookings, useBookingLifecycle } from '../../hooks/useGarageBookings.js'

const TABMAP = {
  pending: ['PENDING'],
  confirmed: ['ACCEPTED', 'WORKER_ASSIGNED'],
  inprogress: ['IN_PROGRESS'],
  completed: ['COMPLETED'],
  cancelled: ['CANCELLED', 'REJECTED', 'NO_SHOW'],
}

export default function Bookings() {
  const { data: bookings, isLoading } = useGarageBookings()
  const { setStatus } = useBookingLifecycle()
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const b = bookings || []
    return Object.fromEntries(Object.entries(TABMAP).map(([k, st]) => [k, b.filter((x) => st.includes(x.status)).length]))
  }, [bookings])

  const filtered = useMemo(() => {
    let list = (bookings || []).filter((b) => TABMAP[tab].includes(b.status))
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter((b) => b.bookingNumber.toLowerCase().includes(s) || b.customerId?.name?.toLowerCase().includes(s))
    }
    return list
  }, [bookings, tab, q])

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Bookings</h1>
      <p className="mb-5 text-content-secondary">Manage incoming and active jobs.</p>

      <div className="mb-4"><Input placeholder="Search by number or customer…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div>

      <Tabs className="mb-5" active={tab} onChange={setTab} tabs={[
        { key: 'pending', label: 'Pending', count: counts.pending },
        { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
        { key: 'inprogress', label: 'In Progress', count: counts.inprogress },
        { key: 'completed', label: 'Completed', count: counts.completed },
        { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
      ]} />

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !filtered.length ? (
        <EmptyState icon={CalendarCheck} title={`No ${tab} bookings`} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const meta = STATUS_META[b.status] || {}
            return (
              <Card key={b._id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="tabular text-sm font-semibold text-content">{b.bookingNumber}</span>
                      <Badge className={meta.cls}>{meta.label}</Badge>
                      {b.bookingType === 'WALK_IN' && <Badge className="bg-amber-100 text-amber-800">Walk-in</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-content-secondary">{b.bookingType === 'WALK_IN' ? (b.customerName || 'Walk-in customer') : (b.customerId?.name || 'Customer')} · {b.carId ? `${b.carId.make} ${b.carId.model}` : 'Vehicle details'}</p>
                    <p className="mt-0.5 text-sm text-content-muted">{formatDate(b.startTime)} · {formatTime(b.startTime)} · {b.services.map((s) => s.nameAtBooking).join(', ')} · <span className="tabular">{currency(b.totalAmount)}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => setStatus.mutate({ id: b._id, status: 'ACCEPTED' })}><Check className="h-4 w-4" /> Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => window.confirm('Reject this booking?') && setStatus.mutate({ id: b._id, status: 'REJECTED' })}><X className="h-4 w-4 text-danger" /> Reject</Button>
                      </>
                    )}
                    <Link to={`/garage/bookings/${b._id}`}><Button size="sm" variant="secondary">Details</Button></Link>
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
