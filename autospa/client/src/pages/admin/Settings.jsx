import { useState } from 'react'
import { Percent, Settings as Cog, ScrollText } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { useAdminSettings, useUpdateSettings, useAdminReports } from '../../hooks/useAdmin.js'
import { currency } from '../../lib/format.js'

export default function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings()
  const reports = useAdminReports()
  const update = useUpdateSettings()
  const [open, setOpen] = useState(false)
  const [pct, setPct] = useState('')

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-64" /></div>

  const rate = settings?.commissionRate ?? 0.1
  const gross = reports.data?.revenue?.totalRevenue ?? 0
  const newPct = Number(pct)
  const projected = Number.isFinite(newPct) ? Math.round(gross * (newPct / 100) * 100) / 100 : 0

  const openEdit = () => { setPct(String(Math.round(rate * 100))); setOpen(true) }
  const save = async () => {
    const val = Number(pct) / 100
    if (!(val >= 0 && val <= 1)) return
    await update.mutateAsync({ commissionRate: val }).then(() => setOpen(false)).catch(() => {})
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Settings</h1>
      <p className="mb-6 text-content-secondary">Platform configuration.</p>

      {/* Commission rate (large) */}
      <Card className="mb-4"><CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-content"><Percent className="h-4 w-4 text-primary" /> Commission rate</h2>
            <p className="text-sm text-content-secondary">Applied to every completed & paid booking.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={openEdit}>Edit</Button>
        </div>
        <p className="tabular mt-3 text-5xl font-semibold text-primary">{Math.round(rate * 100)}%</p>
        <p className="mt-1 text-sm text-content-muted">≈ {currency(Math.round(gross * rate * 100) / 100)} earned on {currency(gross)} gross to date.</p>
      </CardContent></Card>

      {/* Platform config (stubbed where backend has no field) */}
      <Card className="mb-4"><CardContent>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-content"><Cog className="h-4 w-4 text-primary" /> Platform config</h2>
        <ul className="space-y-2 text-sm">
          <Row label="Service categories" value="wash · detail · interior · polish" />
          <Row label="Cities" value="Derived from garage addresses" />
          <Row label="Min wallet limit" value={currency(settings?.minWalletLimit ?? 0)} />
        </ul>
        <p className="mt-3 text-xs text-content-muted">Only commission rate is backend-persisted today; other config is illustrative until endpoints exist.</p>
      </CardContent></Card>

      {/* Audit log (stub) */}
      <Card><CardContent>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-content"><ScrollText className="h-4 w-4 text-primary" /> Audit log</h2>
        <p className="text-sm text-content-muted">No audit-log endpoint yet — this will list admin actions (approvals, blocks, settings changes) once the backend records them.</p>
      </CardContent></Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Change commission rate"
        footer={<><Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" loading={update.isPending} onClick={save}>Confirm change</Button></>}>
        <div className="space-y-3">
          <Input label="Commission rate (%)" type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} />
          <div className="rounded-control bg-accent-light p-3 text-sm text-primary-deep">
            Projected commission on current gross ({currency(gross)}): <span className="tabular font-semibold">{currency(projected)}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const Row = ({ label, value }) => (
  <li className="flex items-center justify-between border-b border-hairline py-2 last:border-0"><span className="text-content-secondary">{label}</span><span className="font-medium text-content">{value}</span></li>
)
