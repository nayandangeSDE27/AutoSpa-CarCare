import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Store, MapPin, LocateFixed } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useCreateGarage } from '../../hooks/useOwner.js'
import { useAuthStore } from '../../stores/auth.store.js'

// Sensible default: open Mon–Sat 09:00–18:00, closed Sunday. Refine later in Edit Garage.
const defaultHours = Array.from({ length: 7 }, (_, day) => ({ day, open: '09:00', close: '18:00', isClosed: day === 0 }))

export default function GarageOnboarding() {
  const navigate = useNavigate()
  const create = useCreateGarage()
  const logout = useAuthStore((s) => s.logout)
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '', serviceBays: 2, slotDurationMinutes: 30 })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not available')
    navigator.geolocation.getCurrentPosition(
      (pos) => { set('lat', pos.coords.latitude.toFixed(6)); set('lng', pos.coords.longitude.toFixed(6)); toast.success('Location captured') },
      () => toast.error('Could not get your location')
    )
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Garage name is required'
    const lat = Number(form.lat)
    const lng = Number(form.lng)
    if (!form.lat || lat < -90 || lat > 90) e.lat = 'Latitude between -90 and 90'
    if (!form.lng || lng < -180 || lng > 180) e.lng = 'Longitude between -180 and 180'
    if (Number(form.serviceBays) < 1) e.serviceBays = 'At least 1 bay'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    create.mutate(
      {
        name: form.name.trim(),
        address: form.address.trim(),
        location: { lat: Number(form.lat), lng: Number(form.lng) },
        serviceBays: Number(form.serviceBays),
        slotDurationMinutes: Number(form.slotDurationMinutes),
        workingHours: defaultHours,
      },
      { onSuccess: () => navigate('/garage/dashboard', { replace: true }) }
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-9 w-auto" />
          <button onClick={logout} className="text-sm font-medium text-content-secondary hover:text-content">Log out</button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-control bg-accent-light"><Store className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-content">Set up your garage</h1>
            <p className="text-content-secondary">One quick step before you can take bookings.</p>
          </div>
        </div>

        <Card><CardContent className="space-y-4">
          <Input label="Garage name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="e.g. Sparkle Auto Spa" />
          <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, area, city" leftIcon={<MapPin className="h-4 w-4" />} />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-content">Location</span>
              <button type="button" onClick={useMyLocation} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <LocateFixed className="h-3.5 w-3.5" /> Use my location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude" type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} error={errors.lat} placeholder="12.9716" />
              <Input label="Longitude" type="number" step="any" value={form.lng} onChange={(e) => set('lng', e.target.value)} error={errors.lng} placeholder="77.5946" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Service bays" type="number" min={1} value={form.serviceBays} onChange={(e) => set('serviceBays', e.target.value)} error={errors.serviceBays} />
            <Input label="Slot duration (min)" type="number" min={5} step={5} value={form.slotDurationMinutes} onChange={(e) => set('slotDurationMinutes', e.target.value)} />
          </div>

          <p className="text-xs text-content-muted">Opens Mon–Sat 9am–6pm by default — you can fine-tune hours, amenities and photos later in Profile → Edit.</p>

          <Button className="w-full" loading={create.isPending} onClick={submit}>Create garage & continue</Button>
          <p className="text-center text-xs text-content-muted">Your garage starts as “pending verification”; an admin approves it before it’s shown to customers.</p>
        </CardContent></Card>
      </div>
    </div>
  )
}
