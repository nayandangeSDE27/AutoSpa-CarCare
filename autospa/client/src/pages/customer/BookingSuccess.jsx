import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle2, Copy, Calendar, Clock, Sparkles } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { currency, formatDate, formatTime } from '../../lib/format.js'

function gcalLink(booking) {
  const start = new Date(booking.startTime)
  const end = new Date(booking.endTime)
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `AutoSpa booking ${booking.bookingNumber}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Booking ${booking.bookingNumber}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const NEXT = ['Garage reviews & accepts your booking', 'You receive a service OTP', 'Show the OTP when your car arrives', 'Pay after the service is completed']

export default function BookingSuccess() {
  const { state } = useLocation()
  const booking = state?.booking
  const [copied, setCopied] = useState(false)

  if (!booking) return <Navigate to="/customer/bookings" replace />

  const copy = () => {
    navigator.clipboard?.writeText(booking.bookingNumber)
    setCopied(true)
    toast.success('Booking number copied')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-lg py-6 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
        <CheckCircle2 className="h-9 w-9 text-primary" />
      </motion.div>
      <h1 className="text-2xl font-semibold text-content">Booking confirmed!</h1>
      <p className="mt-1 text-content-secondary">Your slot is reserved. Pay after the service.</p>

      <Card className="mt-6 p-5 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-content-muted">Booking number</p>
            <p className="tabular text-lg font-semibold text-content">{booking.bookingNumber}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={copy}><Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}</Button>
        </div>
        <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
          <div className="flex items-center gap-2 text-content-secondary"><Calendar className="h-4 w-4" /> {formatDate(booking.startTime)}</div>
          <div className="flex items-center gap-2 text-content-secondary"><Clock className="h-4 w-4" /> {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</div>
          <div className="flex justify-between pt-1 font-semibold text-content"><span>Total</span><span className="tabular">{currency(booking.totalAmount)}</span></div>
        </div>
      </Card>

      <Card className="mt-4 p-5 text-left">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-content"><Sparkles className="h-4 w-4 text-primary" /> What happens next</h3>
        <ol className="space-y-2">
          {NEXT.map((t, i) => (
            <li key={t} className="flex gap-3 text-sm text-content-secondary">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-primary">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={gcalLink(booking)} target="_blank" rel="noreferrer" className="flex-1">
          <Button variant="secondary" className="w-full"><Calendar className="h-4 w-4" /> Add to Calendar</Button>
        </a>
        <Link to={`/customer/bookings/${booking._id}`} className="flex-1"><Button className="w-full">View details</Button></Link>
      </div>
      <Link to="/customer/dashboard" className="mt-3 inline-block text-sm font-medium text-primary">Back to dashboard</Link>
    </div>
  )
}
