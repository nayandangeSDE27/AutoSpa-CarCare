import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Download, AlertTriangle } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { currency } from '../../lib/format.js'
import { useAdminAnalytics, useAdminReports, useAdminGarages } from '../../hooks/useAdmin.js'

const cityOf = (a) => (a?.split(',').pop() || 'Unknown').trim()

export default function AdminReports() {
  const analytics = useAdminAnalytics()
  const reports = useAdminReports()
  const garages = useAdminGarages()

  const revenue = (analytics.data?.revenueOverTime || []).map((r) => ({ ...r, d: r.date.slice(5) }))
  const trend = (analytics.data?.bookingsTrend || []).map((r) => ({ ...r, d: r.date.slice(5) }))

  const byCity = useMemo(() => {
    const m = {}
    for (const g of garages.data || []) {
      const c = cityOf(g.address)
      m[c] = m[c] || { city: c, garages: 0, commission: 0 }
      m[c].garages += 1
      m[c].commission += g.commissionEarned || 0
    }
    return Object.values(m)
  }, [garages.data])

  const topGarages = useMemo(() => [...(garages.data || [])].sort((a, b) => b.commissionEarned - a.commissionEarned).slice(0, 5), [garages.data])
  const churnRisk = useMemo(() => (garages.data || []).filter((g) => g.verificationStatus === 'APPROVED' && g.totalBookings === 0), [garages.data])

  const usersByRole = reports.data?.users?.byRole || {}
  const growth = Object.entries(usersByRole).map(([role, count]) => ({ role, count }))

  if (analytics.isLoading || reports.isLoading) return <div className="mx-auto max-w-6xl"><Skeleton className="h-96" /></div>

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-content">Reports</h1><p className="text-content-secondary">Revenue, growth and garage performance.</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled title="Coming soon"><Download className="h-4 w-4" /> CSV</Button>
          <Button variant="secondary" size="sm" disabled title="Coming soon"><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </div>

      {/* Revenue gross vs commission */}
      <Card className="mb-4"><CardContent>
        <h2 className="mb-3 font-semibold text-content">Revenue — gross vs commission</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Gross" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="commission" name="Commission" stroke="var(--accent-mid)" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Commission by city */}
        <Card><CardContent>
          <h2 className="mb-3 font-semibold text-content">Commission by city</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCity}>
                <XAxis dataKey="city" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                <Bar dataKey="commission" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        {/* Booking volume trend */}
        <Card><CardContent>
          <h2 className="mb-3 font-semibold text-content">Booking volume</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-hairline)' }} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      {/* Garage performance */}
      <Card className="mt-4"><CardContent>
        <h2 className="mb-3 font-semibold text-content">Top garages by commission</h2>
        {!topGarages.length ? <p className="text-sm text-content-muted">No data.</p> : (
          <ul className="divide-y divide-hairline">
            {topGarages.map((g, i) => (
              <li key={g._id} className="flex items-center justify-between py-2">
                <span className="text-content"><span className="tabular mr-2 text-content-muted">{i + 1}.</span>{g.name}</span>
                <span className="tabular font-medium text-content">{currency(g.commissionEarned)}</span>
              </li>
            ))}
          </ul>
        )}
        {churnRisk.length > 0 && (
          <div className="mt-4 rounded-control bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-700"><AlertTriangle className="h-4 w-4" /> Churn risk — approved garages with no bookings</p>
            <div className="mt-2 flex flex-wrap gap-2">{churnRisk.map((g) => <Badge key={g._id} className="bg-amber-100 text-amber-700">{g.name}</Badge>)}</div>
          </div>
        )}
      </CardContent></Card>

      {/* Growth by role */}
      <Card className="mt-4"><CardContent>
        <h2 className="mb-3 font-semibold text-content">Users by role</h2>
        <div className="flex flex-wrap gap-6">
          {growth.map((r) => <div key={r.role}><p className="tabular text-2xl font-semibold text-content">{r.count}</p><p className="text-xs capitalize text-content-secondary">{r.role.replace('_', ' ')}s</p></div>)}
        </div>
      </CardContent></Card>
    </div>
  )
}
