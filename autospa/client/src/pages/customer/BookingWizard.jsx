import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, Plus, Clock, Car as CarIcon, ArrowLeft } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Stepper } from '../../components/ui/Stepper.jsx'
import { cn } from '../../lib/utils.js'
import { currency, withGst, minutesToLabel, formatTime } from '../../lib/format.js'
import { useGarage, useGarageServices, useSlots } from '../../hooks/useGarages.js'
import { useCars, useCreateCar } from '../../hooks/useCars.js'
import { useCreateBooking } from '../../hooks/useBookings.js'

const STEPS = ['Services', 'Car', 'Date', 'Slot']
const todayStr = () => new Date().toISOString().slice(0, 10)

export default function BookingWizard() {
  const [params] = useSearchParams()
  const garageId = params.get('garageId')
  const navigate = useNavigate()

  const { data: garage, isLoading: gLoading } = useGarage(garageId)
  const { data: services } = useGarageServices(garageId)
  const { data: cars } = useCars()
  const createBooking = useCreateBooking()

  const [step, setStep] = useState(0)
  const [serviceIds, setServiceIds] = useState(params.get('serviceId') ? [params.get('serviceId')] : [])
  const [carId, setCarId] = useState(null)
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState(null)

  const { data: slotData, isLoading: slotsLoading } = useSlots(garageId, { date, serviceIds })

  const selected = useMemo(() => (services || []).filter((s) => serviceIds.includes(s._id)), [services, serviceIds])
  const subtotal = selected.reduce((sum, s) => sum + s.price, 0)
  const duration = selected.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totals = withGst(subtotal)

  if (!garageId) return <EmptyState title="Pick a garage first" action={<Link to="/customer/garages"><Button>Browse garages</Button></Link>} />
  if (gLoading) return <div className="mx-auto max-w-4xl"><Skeleton className="h-96" /></div>

  const toggleService = (id) => setServiceIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const canNext = [serviceIds.length > 0, Boolean(carId), Boolean(date), Boolean(startTime)][step]

  const confirm = async () => {
    try {
      const booking = await createBooking.mutateAsync({ garageId, carId, serviceIds, startTime })
      navigate('/customer/bookings/success', { state: { booking } })
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-content-secondary hover:text-content">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="mb-1 text-2xl font-semibold text-content">Book at {garage?.name}</h1>
      <p className="mb-6 text-content-secondary">Pay after your service is completed.</p>

      <div className="mb-6"><Stepper steps={STEPS} current={step} /></div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {/* STEP 1 — services (multi) */}
          {step === 0 && (
            <div className="space-y-3">
              {!services?.length ? <Skeleton className="h-24" /> : services.map((s) => {
                const on = serviceIds.includes(s._id)
                return (
                  <button key={s._id} type="button" onClick={() => toggleService(s._id)} className="block w-full text-left">
                    <Card className={cn('flex items-center justify-between p-4 transition', on && 'ring-2 ring-primary')}>
                      <div className="flex items-center gap-3">
                        <span className={cn('flex h-5 w-5 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-control')}>
                          {on && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <div>
                          <p className="font-medium text-content">{s.name}</p>
                          <p className="text-sm text-content-secondary">{minutesToLabel(s.durationMinutes)}</p>
                        </div>
                      </div>
                      <span className="tabular font-semibold text-content">{currency(s.price)}</span>
                    </Card>
                  </button>
                )
              })}
            </div>
          )}

          {/* STEP 2 — car (+ inline add) */}
          {step === 1 && <CarStep cars={cars} carId={carId} setCarId={setCarId} />}

          {/* STEP 3 — date */}
          {step === 2 && (
            <Card className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-content">Choose a date</label>
              <input type="date" min={todayStr()} value={date} onChange={(e) => { setDate(e.target.value); setStartTime(null) }}
                className="h-11 w-full rounded-control border border-control bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)] sm:w-64" />
              <p className="mt-3 text-sm text-content-secondary">Total service time: <span className="font-medium text-content">{minutesToLabel(duration)}</span></p>
            </Card>
          )}

          {/* STEP 4 — slot */}
          {step === 3 && (
            <Card className="p-5">
              <p className="mb-3 text-sm text-content-secondary">Available start times on {date} · booking length {minutesToLabel(slotData?.bookingLengthMinutes ?? duration)}</p>
              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : !slotData?.slots?.length ? (
                <EmptyState icon={Clock} title="No slots available" description="Try another date." />
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slotData.slots.map((slot) => {
                    const on = startTime === slot.startTime
                    const scarce = slot.availableBays < slotData.serviceBays
                    return (
                      <button key={slot.startTime} type="button" onClick={() => setStartTime(slot.startTime)}
                        className={cn('rounded-control border px-2 py-2 text-sm transition', on ? 'border-primary bg-accent-light text-primary' : 'border-control text-content hover:border-strong')}>
                        <span className="tabular font-medium">{formatTime(slot.startTime)}</span>
                        {scarce && <span className="block text-[10px] text-danger">only {slot.availableBays} left</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )}

          {/* nav */}
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 3 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button disabled={!startTime} loading={createBooking.isPending} onClick={confirm}>Confirm booking</Button>
            )}
          </div>
        </div>

        {/* Sticky live order summary */}
        <div>
          <Card className="sticky top-20 p-5">
            <h3 className="font-semibold text-content">Order summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              {selected.length ? selected.map((s) => (
                <div key={s._id} className="flex justify-between">
                  <span className="text-content-secondary">{s.name}</span>
                  <span className="tabular text-content">{currency(s.price)}</span>
                </div>
              )) : <p className="text-content-muted">No services selected yet.</p>}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-hairline pt-3 text-sm">
              <Row label="Subtotal" value={currency(totals.subtotal)} />
              <Row label="GST (18%)" value={currency(totals.gst)} muted />
              <div className="flex justify-between pt-1 text-base font-semibold text-content">
                <span>Total</span><span className="tabular">{currency(totals.total)}</span>
              </div>
              <p className="pt-1 text-xs text-content-muted">Pay after completion. GST shown for reference.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? 'text-content-muted' : 'text-content-secondary'}>{label}</span>
      <span className="tabular text-content">{value}</span>
    </div>
  )
}

function CarStep({ cars, carId, setCarId }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ make: '', model: '', licensePlate: '', color: 'White' })
  const create = useCreateCar()

  const submit = async () => {
    if (!form.make || !form.model || !form.licensePlate) return toast.error('Fill make, model and plate')
    const res = await create.mutateAsync(form).catch(() => null)
    if (res?.car) { setCarId(res.car._id); setAdding(false) }
  }

  return (
    <div className="space-y-3">
      {(cars || []).map((c) => {
        const on = carId === c._id
        return (
          <button key={c._id} type="button" onClick={() => setCarId(c._id)} className="block w-full text-left">
            <Card className={cn('flex items-center justify-between p-4 transition', on && 'ring-2 ring-primary')}>
              <div className="flex items-center gap-3">
                <CarIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-content">{c.make} {c.model}</p>
                  <p className="text-sm text-content-secondary tabular">{c.licensePlate}</p>
                </div>
              </div>
              {on && <Check className="h-5 w-5 text-primary" />}
            </Card>
          </button>
        )
      })}

    </div>
  )
}
