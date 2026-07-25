import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarClock, Bell, ShieldCheck } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { cn } from '../../lib/utils.js'
import { useAuthStore } from '../../stores/auth.store.js'

import { useMyGarage, useUpdateGarage } from '../../hooks/useOwner.js'

const KEY = 'autospa-garage-settings'
const DEFAULTS = { advanceWindowDays: 14, slotBufferMins: 0, newBookingAlerts: true, reviewAlerts: true, payoutAlerts: true }

function Toggle({ on, onClick }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className={cn('relative h-6 w-11 rounded-full transition-colors', on ? 'bg-primary' : 'bg-control')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}

export default function Settings() {
  const logout = useAuthStore((s) => s.logout)
  const [s, setS] = useState(DEFAULTS)
  
  const { data: garage } = useMyGarage()
  const updateGarage = useUpdateGarage()

  useEffect(() => { try { setS({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }) } catch { /* ignore */ } }, [])
  const save = (next) => { localStorage.setItem(KEY, JSON.stringify(next)); setS(next); toast.success('Saved', { id: 'gs' }) }
  const toggle = (k) => save({ ...s, [k]: !s[k] })
  const setNum = (k, v) => save({ ...s, [k]: Number(v) })
  
  const handleAutoAcceptToggle = async () => {
    if (!garage) return
    const nextState = !garage.autoAcceptBookings
    // Optimistic toast or loading state handled by useUpdateGarage's toast on success.
    await updateGarage.mutateAsync({ id: garage._id, body: { autoAcceptBookings: nextState } }).catch(() => null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Settings</h1>
      <p className="mb-6 text-content-secondary">Booking configuration and preferences (saved on this device).</p>

      <div className="space-y-4">
        <Card><CardContent>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-content"><CalendarClock className="h-4 w-4 text-primary" /> Booking config</h2>
          <div className="divide-y divide-hairline">
            <Row label="Auto-accept bookings" desc="Skip manual approval for new requests">
              <Toggle on={Boolean(garage?.autoAcceptBookings)} onClick={handleAutoAcceptToggle} />
            </Row>
            <div className="flex items-center justify-between py-3">
              <div><p className="font-medium text-content">Advance window (days)</p><p className="text-sm text-content-secondary">How far ahead customers can book</p></div>
              <Input className="w-24" type="number" value={s.advanceWindowDays} onChange={(e) => setNum('advanceWindowDays', e.target.value)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="font-medium text-content">Slot buffer (mins)</p><p className="text-sm text-content-secondary">Gap between consecutive jobs</p></div>
              <Input className="w-24" type="number" value={s.slotBufferMins} onChange={(e) => setNum('slotBufferMins', e.target.value)} />
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-content"><Bell className="h-4 w-4 text-primary" /> Notifications</h2>
          <div className="divide-y divide-hairline">
            <Row label="New booking alerts"><Toggle on={s.newBookingAlerts} onClick={() => toggle('newBookingAlerts')} /></Row>
            <Row label="Review alerts"><Toggle on={s.reviewAlerts} onClick={() => toggle('reviewAlerts')} /></Row>
            <Row label="Payout alerts"><Toggle on={s.payoutAlerts} onClick={() => toggle('payoutAlerts')} /></Row>
          </div>
        </CardContent></Card>

        <Card><CardContent>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-content"><ShieldCheck className="h-4 w-4 text-primary" /> Account</h2>
          <Button variant="danger" onClick={logout}>Log out</Button>
        </CardContent></Card>
      </div>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div><p className="font-medium text-content">{label}</p>{desc && <p className="text-sm text-content-secondary">{desc}</p>}</div>
      {children}
    </div>
  )
}
