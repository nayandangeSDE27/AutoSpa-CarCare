import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts'
import { IndianRupee, CalendarCheck, Star, Percent, TrendingUp, TrendingDown } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { cn } from '../../lib/utils.js'
import { currency } from '../../lib/format.js'
import { useGarageAnalytics, useMyGarage } from '../../hooks/useOwner.js'
import { useGarageBookings } from '../../hooks/useGarageBookings.js'
import { useGarageReviews } from '../../hooks/useReviews.js'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 – 19:00

export default function Analytics() {
  const analytics = useGarageAnalytics()
  const { data: garage } = useMyGarage()
  const bookings = useGarageBookings()
  const reviews = useGarageReviews(garage?._id)
  const [range, setRange] = useState(30)

  const a = analytics.data
  const revenue = useMemo(() => (a?.revenueOverTime || []).slice(-range).map((r) => ({ ...r, d: r.date.slice(5) })), [a, range])
  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0)
  const totalCommission = revenue.reduce((s, r) => s + (r.commission || 0), 0)
  const half = Math.floor(revenue.length / 2) || 1
  const recent = revenue.slice(-half).reduce((s, r) => s + r.revenue, 0)
  const prior = revenue.slice(0, half).reduce((s, r) => s + r.revenue, 0)
  const pct = prior ? Math.round(((recent - prior) / prior) * 100) : 0

  // Peak-hours heatmap from booking start times (UTC).
  const heat = useMemo(() => {
    const m = DAYS.map(() => HOURS.map(() => 0))
    let max = 0
    for (const b of bookings.data || []) {
      const dt = new Date(b.startTime)
      const day = dt.getUTCDay()
      const h = dt.getUTCHours()
      const hi = HOURS.indexOf(h)
      if (hi >= 0) { m[day][hi] += 1; max = Math.max(max, m[day][hi]) }
    }
    return { m, max }
  }, [bookings.data])

  // New vs returning from customer booking counts.
  const nvr = useMemo(() => {
    const counts = {}
    for (const b of bookings.data || []) counts[b.customerId?._id || b.customerId] = (counts[b.customerId?._id || b.customerId] || 0) + 1
    const values = Object.values(counts)
    return [
      { name: 'New', value: values.filter((v) => v === 1).length },
      { name: 'Returning', value: values.filter((v) => v > 1).length },
    ]
  }, [bookings.data])

  // Rating trend (avg per day).
  const ratingTrend = useMemo(() => {
    const byDay = {}
    for (const r of reviews.data || []) {
      const d = new Date(r.createdAt).toISOString().slice(5, 10)
      ;(byDay[d] ||= []).push(r.rating)
    }
    return Object.entries(byDay).map(([d, arr]) => ({ d, rating: Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10 }))
  }, [reviews.data])

  if (analytics.isLoading) return <div className="mx-auto max-w-6xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-content">Analytics</h1><p className="text-content-secondary">Insights for your garage.</p></div>
        <div className="flex gap-1 rounded-control border border-control p-1">
          {[7, 30, 90].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={cn('rounded px-3 py-1 text-sm font-medium', range === r ? 'bg-primary text-primary-foreground' : 'text-content-secondary')}>{r}d</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={IndianRupee} label="Revenue" value={currency(totalRevenue)} delta={pct} />
        <Kpi icon={CalendarCheck} label="Bookings" value={(bookings.data || []).length} />
        <Kpi icon={Star} label="Avg rating" value={(garage?.rating || 0).toFixed(1)} />
        <Kpi icon={Percent} label="Commission" value={currency(totalCommission)} />
      </div>

      {/* Revenue area */}
      <Card className="mt-4"><CardContent>
        <h3 className="mb-3 font-semibold text-content">Revenue over time</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#rv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Service breakdown */}
        <Card><CardContent>
          <h3 className="mb-3 font-semibold text-content">Top services</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a?.topServices || []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="service" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        {/* New vs returning */}
        <Card><CardContent>
          <h3 className="mb-3 font-semibold text-content">New vs returning</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={nvr} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--accent-mid)" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" /> New ({nvr[0].value})</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-accent-mid" /> Returning ({nvr[1].value})</span>
          </div>
        </CardContent></Card>
      </div>

      {/* Peak-hours heatmap (signature) */}
      <Card className="mt-4"><CardContent>
        <h3 className="mb-3 font-semibold text-content">Peak hours</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="mb-1 flex pl-10 text-[10px] text-content-muted">
              {HOURS.map((h) => <div key={h} className="tabular flex-1 text-center">{h}</div>)}
            </div>
            {DAYS.map((day, di) => (
              <div key={day} className="mb-1 flex items-center">
                <div className="w-10 text-xs text-content-secondary">{day}</div>
                {HOURS.map((h, hi) => {
                  const v = heat.m[di][hi]
                  const alpha = heat.max ? 0.12 + (v / heat.max) * 0.88 : 0.08
                  return <div key={h} title={`${day} ${h}:00 — ${v} booking(s)`} className="mx-0.5 h-6 flex-1 rounded" style={{ background: v ? `rgba(15,138,109,${alpha})` : 'var(--accent-light)' }} />
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-content-muted">Darker = busier. Based on booking start times.</p>
      </CardContent></Card>

      {/* Rating trend */}
      <Card className="mt-4"><CardContent>
        <h3 className="mb-3 font-semibold text-content">Rating trend</h3>
        {ratingTrend.length === 0 ? <p className="text-sm text-content-muted">No reviews yet.</p> : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend}>
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                <Line type="monotone" dataKey="rating" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent></Card>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, delta }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-accent-light"><Icon className="h-5 w-5 text-primary" /></div>
        {typeof delta === 'number' && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', delta >= 0 ? 'text-primary' : 'text-danger')}>
            {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="tabular mt-2 text-2xl font-semibold text-content">{value}</p>
      <p className="text-xs text-content-secondary">{label}</p>
    </Card>
  )
}
