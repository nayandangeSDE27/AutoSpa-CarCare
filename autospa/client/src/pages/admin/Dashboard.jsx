import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Users, Store, CalendarCheck, IndianRupee, Percent, ShieldAlert, ChevronRight, Activity } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { cn } from '../../lib/utils.js'
import { currency, STATUS_META } from '../../lib/format.js'
import { useAdminDashboard, useAdminReports, useAdminAnalytics, useAdminGarages, useAdminBookings } from '../../hooks/useAdmin.js'

const cityOf = (addr) => (addr?.split(',').pop() || 'Unknown').trim()

export default function AdminDashboard() {
  const dash = useAdminDashboard()
  const reports = useAdminReports()
  const analytics = useAdminAnalytics()
  const garages = useAdminGarages()
  const recent = useAdminBookings({ limit: 6 })
  const [metric, setMetric] = useState('revenue')

  const d = dash.data
  const rev = reports.data?.revenue
  const series = (analytics.data?.revenueOverTime || []).map((r) => ({ ...r, d: r.date.slice(5) }))
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRev = series.find((s) => s.date === todayStr)
  const todayBookings = (analytics.data?.bookingsTrend || []).find((b) => b.date === todayStr)?.count ?? 0

  const cities = useMemo(() => {
    const m = {}
    for (const g of garages.data || []) m[cityOf(g.address)] = (m[cityOf(g.address)] || 0) + 1
    return Object.entries(m).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [garages.data])

  const byStatus = reports.data?.bookings?.byStatus || {}
  const totalBk = reports.data?.bookings?.total || 0
  const cancelled = (byStatus.CANCELLED || 0) + (byStatus.REJECTED || 0) + (byStatus.NO_SHOW || 0)
  const cancelRate = totalBk ? Math.round((cancelled / totalBk) * 100) : 0
  const completedRate = totalBk ? Math.round(((byStatus.COMPLETED || 0) / totalBk) * 100) : 0

  const KPIS = [
    { icon: Users, label: 'Total users', value: d?.totalUsers ?? 0 },
    { icon: Store, label: 'Total garages', value: d?.totalGarages ?? 0 },
    { icon: CalendarCheck, label: 'Bookings today', value: todayBookings },
    { icon: IndianRupee, label: 'Gross revenue', value: currency(rev?.totalRevenue ?? 0) },
    { icon: Percent, label: 'Commission today', value: currency(todayRev?.commission ?? 0) },
    { icon: ShieldAlert, label: 'Pending verifications', value: d?.pendingVerifications ?? 0 },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-content">Platform Dashboard</h1>
      <p className="text-content-secondary">Health and activity across AutoSpa.</p>

      {(d?.pendingVerifications ?? 0) > 0 && (
        <Link to="/admin/garages?status=PENDING" className="mt-4 block">
          <div className="flex items-center gap-3 rounded-card border border-primary/30 bg-accent-light p-4">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-primary-deep">{d.pendingVerifications} garage{d.pendingVerifications > 1 ? 's' : ''} awaiting verification.</p>
            <Button size="sm" className="ml-auto">Review now</Button>
          </div>
        </Link>
      )}

      {/* 6 KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {dash.isLoading || reports.isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
          KPIS.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-accent-light"><k.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="tabular text-2xl font-semibold text-content">{k.value}</p><p className="text-xs text-content-secondary">{k.label}</p></div>
              </div>
            </Card>
          ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          {/* Revenue chart with toggle */}
          <Card><CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-content">Revenue</h2>
              <div className="flex gap-1 rounded-control border border-control p-1">
                {['revenue', 'commission'].map((m) => (
                  <button key={m} onClick={() => setMetric(m)} className={cn('rounded px-3 py-1 text-xs font-medium capitalize', metric === m ? 'bg-primary text-primary-foreground' : 'text-content-secondary')}>{m === 'revenue' ? 'Gross' : 'Commission'}</button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                  <Area type="monotone" dataKey={metric} stroke="var(--primary)" strokeWidth={2} fill="url(#ar)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>

          {/* Top cities */}
          <Card><CardContent>
            <h2 className="mb-3 font-semibold text-content">Top cities (garages)</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cities}>
                  <XAxis dataKey="city" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </div>

        <div className="space-y-4">
          {/* Platform health */}
          <Card><CardContent>
            <h2 className="mb-3 font-semibold text-content">Platform health</h2>
            <Health label="Completion rate" value={`${completedRate}%`} good={completedRate >= 60} />
            <Health label="Cancellation rate" value={`${cancelRate}%`} good={cancelRate <= 20} invert />
            <Health label="Total bookings" value={totalBk} good />
          </CardContent></Card>

          {/* Activity feed */}
          <Card><CardContent>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-content"><Activity className="h-4 w-4 text-primary" /> Recent activity</h2>
            {recent.isLoading ? <Skeleton className="h-24" /> : !recent.data?.items?.length ? (
              <p className="text-sm text-content-muted">No recent bookings.</p>
            ) : (
              <ul className="space-y-3">
                {recent.data.items.map((b) => (
                  <li key={b._id} className="flex items-start gap-2 text-sm">
                    <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', STATUS_META[b.status]?.cls.includes('danger') ? 'bg-danger' : 'bg-primary')} />
                    <span className="text-content-secondary"><span className="tabular font-medium text-content">{b.bookingNumber}</span> · {b.customerId?.name || 'Customer'} at {b.garageId?.name || 'garage'} — {STATUS_META[b.status]?.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}

function Health({ label, value, good, invert }) {
  const color = good ? 'text-primary' : 'text-danger'
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2 last:border-0">
      <span className="text-sm text-content-secondary">{label}</span>
      <span className={cn('tabular text-sm font-semibold', color)}>{value}</span>
    </div>
  )
}
