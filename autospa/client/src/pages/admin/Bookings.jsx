import { useState } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { cn } from '../../lib/utils.js'
import { currency, formatDate, STATUS_META } from '../../lib/format.js'
import { BOOKING_STATUSES } from '../../lib/constants.js'
import { useAdminBookings, useAdminGarages, useAdminSettings } from '../../hooks/useAdmin.js'

export default function AdminBookings() {
  const [filters, setFilters] = useState({ status: '', garageId: '', from: '', to: '', payment: '' })
  const [page, setPage] = useState(1)
  const params = { page, limit: 15 }
  if (filters.status) params.status = filters.status
  if (filters.garageId) params.garageId = filters.garageId
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to

  const { data, isLoading } = useAdminBookings(params)
  const garages = useAdminGarages()
  const settings = useAdminSettings()
  const rate = settings.data?.commissionRate ?? 0.1

  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }
  let rows = data?.items || []
  if (filters.payment) rows = rows.filter((b) => b.paymentStatus === filters.payment)

  const selectCls = 'h-10 rounded-control border border-control bg-surface px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Bookings monitor</h1>
      <p className="mb-5 text-content-secondary">Platform-wide, read-only oversight.</p>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select className={selectCls} value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={filters.garageId} onChange={(e) => set('garageId', e.target.value)}>
          <option value="">All garages</option>
          {(garages.data || []).map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <select className={selectCls} value={filters.payment} onChange={(e) => set('payment', e.target.value)}>
          <option value="">Any payment</option>
          {['PENDING', 'PAID', 'REFUNDED', 'FAILED'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="date" className={selectCls} value={filters.from} onChange={(e) => set('from', e.target.value)} />
        <input type="date" className={selectCls} value={filters.to} onChange={(e) => set('to', e.target.value)} />
      </div>

      {isLoading ? <Skeleton className="h-64" /> : !rows.length ? (
        <EmptyState icon={CalendarCheck} title="No bookings match" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="border-b border-hairline text-left text-content-muted">
                <tr><Th>Booking</Th><Th>Customer</Th><Th>Garage</Th><Th>Service</Th><Th>Date</Th><Th className="text-right">Gross</Th><Th className="text-right">Commission*</Th><Th>Status</Th><Th>Payment</Th></tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map((b) => (
                  <tr key={b._id}>
                    <Td className="tabular font-medium text-content">{b.bookingNumber}</Td>
                    <Td className="text-content-secondary">{b.customerId?.name || '—'}</Td>
                    <Td className="text-content-secondary">{b.garageId?.name || '—'}</Td>
                    <Td className="text-content-secondary">{b.services?.map((s) => s.nameAtBooking).join(', ')}</Td>
                    <Td className="text-content-secondary">{formatDate(b.startTime)}</Td>
                    <Td className="text-right tabular">{currency(b.totalAmount)}</Td>
                    <Td className="text-right tabular text-content-muted">{currency(Math.round(b.totalAmount * rate * 100) / 100)}</Td>
                    <Td><Badge className={STATUS_META[b.status]?.cls}>{STATUS_META[b.status]?.label}</Badge></Td>
                    <Td><Badge className={b.paymentStatus === 'PAID' ? 'bg-accent-light text-primary' : 'bg-content-muted/15 text-content-secondary'}>{b.paymentStatus}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-hairline px-4 py-3 text-sm">
            <span className="text-content-muted">Page {data?.page} of {data?.totalPages || 1} · {data?.total} total</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="sm" variant="secondary" disabled={page >= (data?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      )}
      <p className="mt-2 text-xs text-content-muted">*Commission is estimated at the current rate ({Math.round(rate * 100)}%) for display.</p>
    </div>
  )
}

const Th = ({ children, className }) => <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
const Td = ({ children, className }) => <td className={cn('px-4 py-3', className)}>{children}</td>
