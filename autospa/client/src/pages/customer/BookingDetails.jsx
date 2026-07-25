import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Phone, MessageCircle, Navigation, Download, KeyRound, Car as CarIcon, Star, XCircle, CreditCard } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { useBooking, useCancelBooking } from '../../hooks/useBookings.js'
import { useCreatePaymentOrder } from '../../hooks/usePayments.js'
import { useGarage } from '../../hooks/useGarages.js'
import { useCar } from '../../hooks/useCars.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { currency, formatDate, formatTime, STATUS_META, shouldShowOtp } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'

const TIMELINE = [
  { key: 'PENDING', label: 'Requested', desc: 'Waiting for the garage to accept' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Garage confirmed your booking' },
  { key: 'WORKER_ASSIGNED', label: 'Worker assigned', desc: 'A specialist is assigned' },
  { key: 'IN_PROGRESS', label: 'In progress', desc: 'Your car is being serviced' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Service finished' },
]
const ORDER = TIMELINE.map((t) => t.key)
const PAYMENT_OPTIONS = [
  { value: 'upi', label: 'UPI', desc: 'Pay with your UPI app' },
  { value: 'card', label: 'Debit/Credit card', desc: 'Secure card checkout' },
  { value: 'cash', label: 'Cash', desc: 'Pay at the garage' },
]

async function downloadInvoice(id, number) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const token = useAuthStore.getState().accessToken
  const res = await fetch(`${base}/bookings/${id}/invoice`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return toast.error('Could not download invoice')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${number}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export default function BookingDetails() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { data: booking, isLoading } = useBooking(bookingId)
  const { data: garage } = useGarage(booking?.garageId)
  const { data: car } = useCar(booking?.carId)
  const cancel = useCancelBooking()
  const createPaymentOrder = useCreatePaymentOrder()
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [paymentFeedback, setPaymentFeedback] = useState(null)

  if (isLoading) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>
  if (!booking) return <EmptyState title="Booking not found" action={<Link to="/customer/bookings"><Button>My bookings</Button></Link>} />

  const meta = STATUS_META[booking.status] || {}
  const currentIndex = ORDER.indexOf(booking.status)
  const isCancelled = ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(booking.status)
  const isActive = ['PENDING', 'ACCEPTED', 'WORKER_ASSIGNED'].includes(booking.status)
  const showOtp = shouldShowOtp(booking)
  const directions = garage ? `https://www.google.com/maps/dir/?api=1&destination=${garage.location.coordinates[1]},${garage.location.coordinates[0]}` : null
  const effectivePaymentStatus = paymentFeedback?.status || booking.paymentStatus

  const handlePayNow = async () => {
    try {
      const result = await createPaymentOrder.mutateAsync({ bookingId: booking._id, paymentMethod: selectedMethod })
      if (result?.paymentStatus === 'PAID') {
        setPaymentFeedback({ status: 'PAID', message: result.message || 'Payment completed' })
        toast.success(result.message || 'Payment completed')
        return
      }
      if (result?.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
      } else {
        toast.error('Could not start payment')
      }
    } catch (error) {
      toast.error(error?.message || 'Could not start payment')
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-content-secondary hover:text-content">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Status header */}
      {paymentFeedback?.message && (
        <Card className="mb-4 border-success/30 bg-success/10 p-4">
          <p className="font-medium text-success">{paymentFeedback.message}</p>
        </Card>
      )}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="tabular text-sm text-content-muted">{booking.bookingNumber}</p>
            <h1 className="text-xl font-semibold text-content">{garage?.name || 'Your booking'}</h1>
            <p className="mt-1 text-sm text-content-secondary">{formatDate(booking.startTime)} · {formatTime(booking.startTime)}–{formatTime(booking.endTime)}</p>
          </div>
          <Badge className={cn('text-sm', meta.cls)}>{meta.label}</Badge>
        </div>
      </Card>

      {/* OTP — governed by the OTP rule (ACCEPTED / WORKER_ASSIGNED only) */}
      {showOtp && (
        <Card className="mt-4 border-primary/30 bg-accent-light p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary-deep">Your service OTP</p>
              <p className="tabular text-3xl font-semibold tracking-widest text-primary">{booking.serviceOtp}</p>
              <p className="mt-1 text-xs text-content-secondary">Share this with the garage when your car arrives.</p>
            </div>
          </div>
        </Card>
      )}

      {isCancelled ? (
        <Card className="mt-4 flex items-center gap-3 p-5">
          <XCircle className="h-6 w-6 text-danger" />
          <p className="font-medium text-content">This booking was {meta.label?.toLowerCase()}.</p>
        </Card>
      ) : (
        /* Timeline */
        <Card className="mt-4 p-5">
          <ol className="relative space-y-6">
            {TIMELINE.map((step, i) => {
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <li key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                      done && 'bg-primary text-primary-foreground', active && 'bg-primary text-primary-foreground ring-4 ring-[var(--ring)]', !done && !active && 'bg-accent-light text-content-muted')}>
                      {i + 1}
                    </span>
                    {i < TIMELINE.length - 1 && <span className={cn('mt-1 h-8 w-0.5', done ? 'bg-primary' : 'bg-hairline')} />}
                  </div>
                  <div className="pt-1">
                    <p className={cn('font-medium', active || done ? 'text-content' : 'text-content-muted')}>{step.label}</p>
                    <p className="text-sm text-content-secondary">{step.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      {/* Car + services */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-content"><CarIcon className="h-4 w-4 text-primary" /> Vehicle</h3>
          {car ? <p className="text-content">{car.make} {car.model} · <span className="tabular">{car.licensePlate}</span></p> : <Skeleton className="h-5 w-32" />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 font-semibold text-content">Services</h3>
          <ul className="space-y-1 text-sm">
            {booking.services.map((s) => (
              <li key={s.serviceId} className="flex justify-between">
                <span className="text-content-secondary">{s.nameAtBooking}</span>
                <span className="tabular text-content">{currency(s.priceAtBooking)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-hairline pt-2 mt-2 text-content-secondary">
              <span>Subtotal</span><span className="tabular">{currency(booking.subtotalAmount || booking.totalAmount)}</span>
            </li>
            {booking.taxAmount !== undefined && (
              <li className="flex justify-between text-content-muted">
                <span>GST (18%)</span><span className="tabular">{currency(booking.taxAmount)}</span>
              </li>
            )}
            <li className="flex justify-between border-t border-hairline mt-1 pt-1 font-semibold text-content text-base">
              <span>Grand Total</span><span className="tabular">{currency(booking.totalAmount)}</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Garage contact */}
      {garage && (
        <Card className="mt-4 p-5">
          <h3 className="mb-3 font-semibold text-content">Garage contact</h3>
          <div className="flex flex-wrap gap-2">
            <a href={garage.phone ? `tel:${garage.phone}` : undefined}><Button variant="secondary" size="sm" disabled={!garage.phone}><Phone className="h-4 w-4" /> Call</Button></a>
            <a href={garage.phone ? `https://wa.me/${garage.phone.replace(/\D/g, '')}` : undefined} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm" disabled={!garage.phone}><MessageCircle className="h-4 w-4" /> WhatsApp</Button></a>
            <a href={directions} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm"><Navigation className="h-4 w-4" /> Directions</Button></a>
          </div>
        </Card>
      )}

      {/* After photos (completed) */}
      {booking.status === 'COMPLETED' && booking.afterImages?.length > 0 && (
        <Card className="mt-4 p-5">
          <h3 className="mb-3 font-semibold text-content">After service</h3>
          <div className="grid grid-cols-3 gap-2">
            {booking.afterImages.map((img, i) => (
              <div key={i} className="h-24 rounded-control" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            ))}
          </div>
        </Card>
      )}

      {booking.status === 'COMPLETED' && effectivePaymentStatus !== 'PAID' && (
        <Card className="mt-4 p-5">
          <h3 className="mb-3 font-semibold text-content">Choose payment method</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMethod(option.value)}
                className={cn(
                  'rounded-control border p-3 text-left transition',
                  selectedMethod === option.value ? 'border-primary bg-accent-light' : 'border-hairline hover:border-primary/40'
                )}
              >
                <p className="font-medium text-content">{option.label}</p>
                <p className="mt-1 text-sm text-content-secondary">{option.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {isActive && (
          <Button variant="danger" loading={cancel.isPending} onClick={() => window.confirm('Cancel this booking?') && cancel.mutate(booking._id)}>
            Cancel booking
          </Button>
        )}
        {booking.status === 'COMPLETED' && effectivePaymentStatus !== 'PAID' && (
          <Button loading={createPaymentOrder.isPending} onClick={handlePayNow}><CreditCard className="h-4 w-4" /> Pay now</Button>
        )}
        {booking.status === 'COMPLETED' && effectivePaymentStatus === 'PAID' && (
          <Button variant="secondary" onClick={() => downloadInvoice(booking._id, booking.bookingNumber)}><Download className="h-4 w-4" /> Download invoice</Button>
        )}
        {booking.status === 'COMPLETED' && (
          <Link to="/customer/reviews"><Button><Star className="h-4 w-4" /> Leave a review</Button></Link>
        )}
      </div>
    </div>
  )
}
