import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, LineChart, Line } from 'recharts'
import { IndianRupee, CalendarCheck, Clock, Loader2, Wallet as WalletIcon, TrendingUp, TrendingDown, AlertCircle, ChevronRight, PlusCircle } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { useGarageDashboard, useWallet, useWorkers, useGarageAnalytics, useOwnerServices } from '../../hooks/useOwner.js'
import { useGarageBookings, useBookingLifecycle } from '../../hooks/useGarageBookings.js'
import { currency, formatTime, STATUS_META } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'

const WORKER_DOT = { available: 'bg-primary', busy: 'bg-amber-500', off: 'bg-content-muted' }

const COLUMNS = [
  { key: 'pending', title: 'Pending', statuses: ['PENDING', 'ACCEPTED', 'WORKER_ASSIGNED'] },
  { key: 'inprogress', title: 'In Progress', statuses: ['IN_PROGRESS'] },
  { key: 'completed', title: 'Completed', statuses: ['COMPLETED'] },
]

export default function Dashboard() {
  const dash = useGarageDashboard()
  const wallet = useWallet()
  const workers = useWorkers()
  const analytics = useGarageAnalytics()
  const bookings = useGarageBookings()
  const services = useOwnerServices()
  const { createWalkIn } = useBookingLifecycle()
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    customerPhone: '',
    vehicleRegistrationNumber: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleType: '',
    bookingDate: '',
    estimatedStartTime: '',
    notes: '',
  })
  const [selectedServiceIds, setSelectedServiceIds] = useState([])

  const d = dash.data
  const revenueSeries = (analytics.data?.revenueOverTime || []).slice(-7).map((r) => ({ date: r.date.slice(5), revenue: r.revenue }))
  const today = revenueSeries.at(-1)?.revenue ?? 0
  const yesterday = revenueSeries.at(-2)?.revenue ?? 0
  const delta = today - yesterday
  const inProgress = (bookings.data || []).filter((b) => b.status === 'IN_PROGRESS').length

  const toggleService = (id) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const submitWalkIn = async (e) => {
    e.preventDefault()
    if (!walkInForm.customerName || !walkInForm.vehicleRegistrationNumber || !walkInForm.bookingDate || !walkInForm.estimatedStartTime || !selectedServiceIds.length) {
      toast.error('Please complete the required walk-in fields')
      return
    }

    await createWalkIn.mutateAsync({
      ...walkInForm,
      serviceIds: selectedServiceIds,
    }, {
      onSuccess: () => {
        setWalkInOpen(false)
        setWalkInForm({
          customerName: '',
          customerPhone: '',
          vehicleRegistrationNumber: '',
          vehicleBrand: '',
          vehicleModel: '',
          vehicleType: '',
          bookingDate: '',
          estimatedStartTime: '',
          notes: '',
        })
        setSelectedServiceIds([])
      },
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-content">Dashboard</h1>
          <p className="text-content-secondary">Your garage at a glance.</p>
        </div>
        <Button onClick={() => setWalkInOpen(true)} className="rounded-xl">
          <PlusCircle className="h-4 w-4" /> Walk-in booking
        </Button>
      </div>

      {/* Pending alert banner */}
      {(d?.pendingRequests ?? 0) > 0 && (
        <Link to="/garage/bookings" className="mt-4 block">
          <div className="flex items-center gap-3 rounded-card border border-primary/30 bg-accent-light p-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-primary-deep">You have {d.pendingRequests} pending request{d.pendingRequests > 1 ? 's' : ''} awaiting action.</p>
            <ChevronRight className="ml-auto h-4 w-4 text-primary" />
          </div>
        </Link>
      )}

      {/* KPI + wallet row */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dash.isLoading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-secondary">Today’s revenue</span>
                <span className={cn('flex items-center gap-0.5 text-xs font-medium', delta >= 0 ? 'text-primary' : 'text-danger')}>
                  {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {currency(Math.abs(delta))}
                </span>
              </div>
              <p className="tabular mt-1 text-2xl font-semibold text-content">{currency(d?.todayRevenue ?? 0)}</p>
              <div className="mt-1 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueSeries.length ? revenueSeries : [{ revenue: 0 }, { revenue: 0 }]}>
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Kpi icon={CalendarCheck} label="Bookings today" value={d?.todayBookings ?? 0} />
            <Kpi icon={Clock} label="Pending requests" value={d?.pendingRequests ?? 0} />
            <Kpi icon={Loader2} label="In progress" value={inProgress} />
          </>
        )}
      </div>

      {/* Wallet card (prominent) */}
      <Card className="mt-3 flex flex-col items-start justify-between gap-4 bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-control bg-white/15"><WalletIcon className="h-6 w-6" /></div>
          <div>
            <p className="text-sm opacity-90">Wallet balance</p>
            <p className="tabular text-3xl font-semibold">{wallet.isLoading ? '—' : currency(wallet.data?.balance ?? 0)}</p>
          </div>
        </div>
        <Link to="/garage/wallet"><Button variant="secondary" size="sm">Top up</Button></Link>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Kanban queue board */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-content">Queue board</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = (bookings.data || []).filter((b) => col.statuses.includes(b.status))
              return (
                <div key={col.key} className="rounded-card border border-hairline bg-surface/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-content">{col.title}</span>
                    <Badge className="bg-accent-light text-primary">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {bookings.isLoading ? <Skeleton className="h-16" /> : items.length === 0 ? (
                      <p className="py-4 text-center text-xs text-content-muted">Nothing here</p>
                    ) : items.slice(0, 8).map((b) => (
                      <Link key={b._id} to={`/garage/bookings/${b._id}`}>
                        <Card className="p-3 hover:border-strong">
                          <div className="flex items-center justify-between">
                            <span className="tabular text-xs font-semibold text-content">{b.bookingNumber}</span>
                            <Badge className={cn('text-[10px]', STATUS_META[b.status]?.cls)}>{STATUS_META[b.status]?.label}</Badge>
                          </div>
                          <p className="mt-1 truncate text-sm text-content-secondary">{b.services?.map((s) => s.nameAtBooking).join(', ')}</p>
                          <p className="mt-0.5 text-xs text-content-muted">{formatTime(b.startTime)} · {b.customerId?.name || 'Customer'}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 7-day revenue */}
          <h2 className="mb-3 mt-6 text-lg font-semibold text-content">Revenue — last 7 days</h2>
          <Card className="p-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Worker status + insights */}
        <div className="space-y-4">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-content">Workers</h2>
            <Card className="divide-y divide-hairline">
              {workers.isLoading ? <div className="p-4"><Skeleton className="h-6" /></div> : !workers.data?.length ? (
                <div className="p-4 text-sm text-content-muted">No workers yet. <Link to="/garage/workers" className="font-medium text-primary">Add one</Link></div>
              ) : workers.data.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', WORKER_DOT[w.status])} />
                    <span className="text-sm font-medium text-content">{w.name}</span>
                  </div>
                  <span className="text-xs text-content-muted capitalize">{w.status} · {w.todayJobs ?? 0} today</span>
                </div>
              ))}
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-content"><TrendingUp className="h-4 w-4 text-primary" /> Insight</h3>
            <p className="text-sm text-content-secondary">
              {(d?.availableWorkers ?? 0) === 0
                ? 'No workers available — set a worker to “available” to accept jobs.'
                : `${d.availableWorkers} worker${d.availableWorkers > 1 ? 's' : ''} available and ${d?.pendingRequests ?? 0} request${(d?.pendingRequests ?? 0) === 1 ? '' : 's'} waiting.`}
            </p>
          </Card>
        </div>
      </div>

      <Modal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="Create walk-in booking"
        footer={<><Button variant="secondary" className="rounded-xl" onClick={() => setWalkInOpen(false)}>Cancel</Button><Button className="rounded-xl px-6" loading={createWalkIn.isPending} onClick={submitWalkIn}>Save booking</Button></>}>
        <form className="space-y-4" onSubmit={submitWalkIn}>
          <Input label="Customer name" value={walkInForm.customerName} onChange={(e) => setWalkInForm((prev) => ({ ...prev, customerName: e.target.value }))} required />
          <Input label="Phone" value={walkInForm.customerPhone} onChange={(e) => setWalkInForm((prev) => ({ ...prev, customerPhone: e.target.value }))} />
          <Input label="Vehicle registration" value={walkInForm.vehicleRegistrationNumber} onChange={(e) => setWalkInForm((prev) => ({ ...prev, vehicleRegistrationNumber: e.target.value }))} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Vehicle brand" value={walkInForm.vehicleBrand} onChange={(e) => setWalkInForm((prev) => ({ ...prev, vehicleBrand: e.target.value }))} />
            <Input label="Vehicle model" value={walkInForm.vehicleModel} onChange={(e) => setWalkInForm((prev) => ({ ...prev, vehicleModel: e.target.value }))} />
          </div>
          <Input label="Vehicle type" value={walkInForm.vehicleType} onChange={(e) => setWalkInForm((prev) => ({ ...prev, vehicleType: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Booking date" type="date" value={walkInForm.bookingDate} onChange={(e) => setWalkInForm((prev) => ({ ...prev, bookingDate: e.target.value }))} required />
            <Input label="Estimated start" type="time" value={walkInForm.estimatedStartTime} onChange={(e) => setWalkInForm((prev) => ({ ...prev, estimatedStartTime: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-content">Services</label>
            <div className="flex flex-wrap gap-2">
              {services.isLoading ? <Skeleton className="h-10 w-24" /> : (services.data || []).map((service) => (
                <button key={service._id} type="button" onClick={() => toggleService(service._id)} className={cn('rounded-full border px-3 py-2 text-sm transition-colors', selectedServiceIds.includes(service._id) ? 'border-primary bg-primary/10 text-primary' : 'border-control bg-surface text-content-secondary')}>
                  {service.name}
                </button>
              ))}
            </div>
          </div>
          <Input label="Notes" value={walkInForm.notes} onChange={(e) => setWalkInForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </form>
      </Modal>
    </div>
  )
}

function Kpi({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-accent-light"><Icon className="h-5 w-5 text-primary" /></div>
        <div>
          <p className="tabular text-2xl font-semibold text-content">{value}</p>
          <p className="text-xs text-content-secondary">{label}</p>
        </div>
      </div>
    </Card>
  )
}
