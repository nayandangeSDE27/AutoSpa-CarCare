import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { cn } from '../../lib/utils.js'
import { useMyGarage, useUpdateGarage } from '../../hooks/useOwner.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const AMENITIES = ['Waiting lounge', 'Free WiFi', 'Card accepted', 'Restroom', 'Refreshments', 'AC waiting', 'Pickup & drop', 'CCTV']

function defaultHours() {
  return DAYS.map((_, day) => ({ day, open: '09:00', close: '18:00', isClosed: day === 0 }))
}

export default function EditGarage() {
  const navigate = useNavigate()
  const { data: garage, isLoading } = useMyGarage()
  const update = useUpdateGarage()

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (garage && !form) {
      const byDay = new Map((garage.workingHours || []).map((w) => [w.day, w]))
      setForm({
        name: garage.name || '',
        description: garage.description || '',
        address: garage.address || '',
        serviceBays: garage.serviceBays || 1,
        slotDurationMinutes: garage.slotDurationMinutes || 30,
        amenities: garage.amenities || [],
        workingHours: DAYS.map((_, day) => byDay.get(day) || defaultHours()[day]),
      })
    }
  }, [garage, form])

  if (isLoading || !form) return <div className="mx-auto max-w-3xl"><Skeleton className="h-96" /></div>

  const setHour = (day, patch) => setForm((f) => ({ ...f, workingHours: f.workingHours.map((w) => (w.day === day ? { ...w, ...patch } : w)) }))
  const toggleAmenity = (a) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }))

  const save = () => {
    update.mutate({ id: garage._id, body: {
      name: form.name,
      description: form.description,
      address: form.address,
      serviceBays: Number(form.serviceBays),
      slotDurationMinutes: Number(form.slotDurationMinutes),
      amenities: form.amenities,
      workingHours: form.workingHours,
    } }, { onSuccess: () => navigate('/garage/profile') })
  }

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-content-secondary hover:text-content"><ArrowLeft className="h-4 w-4" /> Back</button>
      <h1 className="mb-5 text-2xl font-semibold text-content">Edit garage</h1>

      <Card><CardContent className="space-y-4">
        <h2 className="font-semibold text-content">Basic info</h2>
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-content">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-control border border-control bg-surface p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
        </div>
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Service bays" type="number" min={1} value={form.serviceBays} onChange={(e) => setForm({ ...form, serviceBays: e.target.value })} />
          <Input label="Slot duration (min)" type="number" min={5} step={5} value={form.slotDurationMinutes} onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })} />
        </div>
      </CardContent></Card>

      <Card className="mt-4"><CardContent>
        <h2 className="mb-3 font-semibold text-content">Working hours</h2>
        <div className="space-y-2">
          {form.workingHours.map((w) => (
            <div key={w.day} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm text-content">{DAYS[w.day]}</span>
              <button type="button" onClick={() => setHour(w.day, { isClosed: !w.isClosed })}
                className={cn('rounded-full px-3 py-1 text-xs font-medium', w.isClosed ? 'bg-danger/10 text-danger' : 'bg-accent-light text-primary')}>
                {w.isClosed ? 'Closed' : 'Open'}
              </button>
              {!w.isClosed && (
                <div className="flex items-center gap-2">
                  <input type="time" value={w.open} onChange={(e) => setHour(w.day, { open: e.target.value })} className="tabular rounded-control border border-control bg-surface px-2 py-1 text-sm" />
                  <span className="text-content-muted">–</span>
                  <input type="time" value={w.close} onChange={(e) => setHour(w.day, { close: e.target.value })} className="tabular rounded-control border border-control bg-surface px-2 py-1 text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Card className="mt-4"><CardContent>
        <h2 className="mb-3 font-semibold text-content">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button key={a} type="button" onClick={() => toggleAmenity(a)}
              className={cn('rounded-full border px-3 py-1.5 text-sm font-medium transition', form.amenities.includes(a) ? 'border-primary bg-accent-light text-primary' : 'border-control text-content-secondary hover:border-strong')}>
              {a}
            </button>
          ))}
        </div>
      </CardContent></Card>

      {/* Sticky save */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/90 p-3 backdrop-blur-md md:pl-64">
        <div className="mx-auto flex max-w-3xl justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/garage/profile')}>Cancel</Button>
          <Button loading={update.isPending} onClick={save}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
