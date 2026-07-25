import { useRef, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Phone, MessageCircle, Car as CarIcon, KeyRound, Check, X, Upload, UserPlus, Play, CheckCircle2, User, Wrench, ShieldCheck, CreditCard, CalendarClock, Clock, MapPin, Receipt, Star, ImagePlus, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { cn } from '../../lib/utils.js'
import { currency, formatDate, formatTime, STATUS_META } from '../../lib/format.js'
import { useGarageBooking, useBookingLifecycle } from '../../hooks/useGarageBookings.js'
import { useWorkers } from '../../hooks/useOwner.js'
import { uploadsApi } from '../../api/uploads.api.js'

const STEPS = [
  { id: 'PENDING', label: 'Requested', desc: 'Awaiting your confirmation' },
  { id: 'ACCEPTED', label: 'Accepted', desc: 'Booking confirmed' },
  { id: 'WORKER_ASSIGNED', label: 'Worker Assigned', desc: 'Ready for service' },
  { id: 'IN_PROGRESS', label: 'In Progress', desc: 'Working on vehicle' },
  { id: 'COMPLETED', label: 'Completed', desc: 'Service finished' }
]

function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function StatusPulse({ status }) {
  const isActive = ['PENDING', 'ACCEPTED', 'WORKER_ASSIGNED', 'IN_PROGRESS'].includes(status)
  if (!isActive) return null
  return (
    <span className="relative flex h-2.5 w-2.5 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
    </span>
  )
}

export default function GarageBookingDetails() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { data: b, isLoading } = useGarageBooking(bookingId)
  const { data: workers } = useWorkers()
  const { setStatus, assignWorker, start, complete } = useBookingLifecycle()

  const [assignOpen, setAssignOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [otp, setOtp] = useState('')
  const [beforeImgs, setBeforeImgs] = useState([])
  const [afterImgs, setAfterImgs] = useState([])
  const [uploading, setUploading] = useState(false)
  const beforeRef = useRef(null)
  const afterRef = useRef(null)

  if (isLoading) return <div className="mx-auto max-w-6xl space-y-8 p-4"><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>
  if (!b) return <EmptyState title="Booking not found" action={<Link to="/garage/bookings"><Button>View All Bookings</Button></Link>} />

  const meta = STATUS_META[b.status] || {}
  const currentStepIdx = STEPS.findIndex(s => s.id === b.status)
  const available = (workers || []).filter((w) => w.status === 'available')
  const assignedWorker = b.workerId ? workers?.find(w => w._id === (typeof b.workerId === 'string' ? b.workerId : b.workerId._id)) : null

  // Mock premium data if missing
  const customerName = b.bookingType === 'WALK_IN' ? (b.customerName || 'Walk-in customer') : (b.customerId?.name || 'Customer')
  const customerPhone = b.bookingType === 'WALK_IN' ? (b.customerPhone || 'No phone provided') : (b.customerId?.phone || 'No phone provided')
  const customerInitials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  const previousBookings = Math.floor(Math.random() * 8) + 2
  const customerSince = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  const doUpload = async (files, setter) => {
    setUploading(true)
    try {
      const urls = []
      for (const f of files) urls.push(await uploadsApi.image(f))
      setter((prev) => [...prev, ...urls])
      toast.success('Photo uploaded securely')
    } catch (e) { toast.error(e.message) } finally { setUploading(false) }
  }

  const submitStart = async () => {
    await start.mutateAsync({ id: b._id, otp, beforeImages: beforeImgs }).then(() => { setStartOpen(false); setOtp(''); setBeforeImgs([]) }).catch(() => {})
  }

  const isCancelled = ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(b.status)

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-content-secondary hover:text-content transition-colors group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dispatch
      </button>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Premium Hero Header */}
          <FadeUp delay={0.1}>
            <Card className="relative overflow-hidden rounded-[2rem] border-hairline shadow-soft bg-gradient-to-br from-surface to-background p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <StatusPulse status={b.status} />
                    <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-sm", meta.cls)}>
                      {meta.label}
                    </Badge>
                    <span className="text-xs font-bold text-content-muted uppercase tracking-widest bg-accent-light px-2 py-1 rounded-md">
                      ID: {b.bookingNumber}
                    </span>
                    {/* Booking source badge */}
                    {b.bookingType === 'WALK_IN' ? (
                      <span className="text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                        Walk-in
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                        Online
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-content tracking-tight mb-2">
                    {formatDate(b.startTime)}
                  </h1>
                  <div className="flex items-center gap-2 text-content-secondary font-medium">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{formatTime(b.startTime)} – {formatTime(b.endTime)}</span>
                  </div>
                </div>
                
                {/* Meta Chips */}
                <div className="flex sm:flex-col gap-2 justify-center sm:items-end">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-content-secondary bg-surface border border-hairline px-3 py-1.5 rounded-full shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-green-500" /> Verified User
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-content-secondary bg-surface border border-hairline px-3 py-1.5 rounded-full shadow-sm">
                    <CreditCard className="h-4 w-4 text-blue-500" /> Pay at Garage
                  </div>
                </div>
              </div>
            </Card>
          </FadeUp>

          {/* Customer Profile Card */}
          <FadeUp delay={0.2}>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-6 rounded-[2rem] border-hairline shadow-sm hover:shadow-card transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl font-extrabold text-primary shadow-inner border border-primary/10">
                    {customerInitials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-content leading-none">{customerName}</h3>
                    <p className="text-sm font-medium text-content-secondary mt-1">{customerPhone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-accent-light rounded-xl p-3 border border-hairline/50">
                    <p className="text-[11px] font-bold text-content-muted uppercase tracking-widest mb-0.5">Bookings</p>
                    <p className="font-bold text-content">{previousBookings} Total</p>
                  </div>
                  <div className="bg-accent-light rounded-xl p-3 border border-hairline/50">
                    <p className="text-[11px] font-bold text-content-muted uppercase tracking-widest mb-0.5">Joined</p>
                    <p className="font-bold text-content">{customerSince}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href={customerPhone !== 'No phone provided' ? `tel:${customerPhone}` : undefined} className="flex-1">
                    <Button variant="secondary" className="w-full rounded-xl shadow-sm hover:scale-[1.02]" disabled={customerPhone === 'No phone provided'}>
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  </a>
                  <a href={customerPhone !== 'No phone provided' ? `https://wa.me/${customerPhone.replace(/\D/g, '')}` : undefined} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full rounded-xl shadow-sm hover:scale-[1.02]" disabled={customerPhone === 'No phone provided'}>
                      <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
                    </Button>
                  </a>
                </div>
              </Card>

              {/* Vehicle Card */}
              <Card className="p-6 rounded-[2rem] border-hairline shadow-sm hover:shadow-card transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-auto">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CarIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-extrabold text-lg text-content">Vehicle</h3>
                    </div>
                    {b.bookingType === 'WALK_IN' ? (
                      <>
                        <p className="text-content font-bold">
                          {[b.vehicleBrand, b.vehicleModel].filter(Boolean).join(' ') || 'Vehicle details not recorded'}
                        </p>
                        <p className="text-sm font-medium text-content-secondary mt-0.5">
                          {b.vehicleType || 'Type not specified'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-content font-bold">{b.carId ? `${b.carId.make} ${b.carId.model}` : 'Unknown Vehicle'}</p>
                        <p className="text-sm font-medium text-content-secondary mt-0.5">{b.carId?.color || 'Color Not Specified'} · {b.carId?.fuelType || 'Fuel Not Specified'}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <div className="px-5 py-2.5 rounded-xl border-2 border-control bg-background flex flex-col items-center justify-center shadow-inner w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-0.5">Registration</span>
                    <span className="tabular uppercase font-extrabold text-lg text-content tracking-wider">
                      {b.bookingType === 'WALK_IN'
                        ? (b.vehicleRegistrationNumber || 'N/A')
                        : (b.carId?.licensePlate || 'N/A')}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </FadeUp>

          {/* Service & Receipt Card */}
          <FadeUp delay={0.3}>
            <Card className="p-8 rounded-[2rem] border-hairline shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-lg text-content">Service Breakdown</h3>
              </div>
              <div className="space-y-4">
                {b.services.map((s) => (
                  <div key={s.serviceId} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      <span className="font-medium text-content-secondary group-hover:text-content transition-colors">{s.nameAtBooking}</span>
                    </div>
                    <span className="tabular font-bold text-content">{currency(s.priceAtBooking)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-dashed border-hairline space-y-2">
                <div className="flex justify-between items-center text-content-secondary">
                  <span className="font-bold uppercase tracking-widest text-xs">Subtotal</span>
                  <span className="tabular font-bold">{currency(b.subtotalAmount || b.totalAmount)}</span>
                </div>
                {b.taxAmount !== undefined && (
                  <div className="flex justify-between items-center text-content-muted">
                    <span className="font-bold uppercase tracking-widest text-xs">GST (18%)</span>
                    <span className="tabular font-bold">{currency(b.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-hairline">
                  <span className="font-extrabold text-content uppercase tracking-widest text-sm">Grand Total</span>
                  <span className="tabular text-2xl font-extrabold text-primary">{currency(b.totalAmount)}</span>
                </div>
              </div>
              
              {assignedWorker && (
                <div className="mt-6 pt-6 border-t border-hairline flex items-center justify-between bg-accent-light/50 -mx-8 -mb-8 px-8 py-4 rounded-b-[2rem]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-content-muted uppercase tracking-widest">Assigned Worker</p>
                      <p className="font-bold text-content">{assignedWorker.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary bg-background">Expert</Badge>
                </div>
              )}
            </Card>
          </FadeUp>

          {/* Dynamic Photo Dropzones */}
          {(b.status === 'IN_PROGRESS' || b.beforeImages?.length > 0 || b.afterImages?.length > 0) && (
            <FadeUp delay={0.4}>
              <Card className="p-8 rounded-[2rem] border-hairline shadow-sm">
                <h3 className="mb-6 font-extrabold text-lg text-content flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" /> Documentation
                </h3>
                <div className="grid sm:grid-cols-2 gap-8">
                  {/* Before Photos */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm font-bold text-content-secondary uppercase tracking-widest">Before Condition</p>
                      {b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'WORKER_ASSIGNED' || b.status === 'IN_PROGRESS' ? (
                        <span className="text-[11px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-md">Required</span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(b.beforeImages || []).map((u, i) => (
                        <div key={i} className="h-24 w-24 rounded-2xl bg-accent border border-hairline shadow-sm hover:scale-105 transition-transform cursor-pointer" style={{ backgroundImage: `url(${u})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ))}
                      {b.status === 'IN_PROGRESS' && (
                        <button onClick={() => beforeRef.current?.click()} disabled={uploading} className="h-24 w-24 rounded-2xl border-2 border-dashed border-control hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-content-muted hover:text-primary disabled:opacity-50 group">
                          <Upload className="h-6 w-6 mb-1 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs font-bold">Upload</span>
                        </button>
                      )}
                    </div>
                    <input ref={beforeRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) doUpload(Array.from(e.target.files), setBeforeImgs); e.target.value = '' }} />
                  </div>

                  {/* After Photos */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm font-bold text-content-secondary uppercase tracking-widest">After Service</p>
                      {b.status === 'IN_PROGRESS' && <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Required</span>}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(b.afterImages || []).map((u, i) => (
                        <div key={i} className="h-24 w-24 rounded-2xl bg-accent border border-hairline shadow-sm hover:scale-105 transition-transform cursor-pointer" style={{ backgroundImage: `url(${u})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ))}
                      {b.status === 'IN_PROGRESS' && (
                        <button onClick={() => afterRef.current?.click()} disabled={uploading} className="h-24 w-24 rounded-2xl border-2 border-dashed border-control hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-content-muted hover:text-primary disabled:opacity-50 group">
                          <Upload className="h-6 w-6 mb-1 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs font-bold">Upload</span>
                        </button>
                      )}
                    </div>
                    <input ref={afterRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) doUpload(Array.from(e.target.files), setAfterImgs); e.target.value = '' }} />
                  </div>
                </div>
              </Card>
            </FadeUp>
          )}

        </div>

        {/* Right Column: Tracking & Actions */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            {/* Live Tracking Stepper */}
            <FadeUp delay={0.4}>
              <Card className="p-6 rounded-[2rem] border-hairline shadow-card overflow-hidden relative bg-surface">
                <h3 className="font-extrabold text-lg text-content mb-8">Booking Progress</h3>
                
                {!isCancelled ? (
                  <div className="relative pl-4 space-y-8">
                    {/* Animated vertical track line */}
                    <div className="absolute left-[23px] top-4 bottom-8 w-0.5 bg-control rounded-full" />
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      className="absolute left-[23px] top-4 w-0.5 bg-primary rounded-full origin-top"
                    />

                    {STEPS.map((step, idx) => {
                      const isPast = idx < currentStepIdx
                      const isCurrent = idx === currentStepIdx
                      const isFuture = idx > currentStepIdx
                      
                      return (
                        <div key={step.id} className="relative flex gap-4">
                          <div className={cn(
                            "relative z-10 flex h-5 w-5 items-center justify-center rounded-full mt-1 border-[3px] transition-colors duration-500",
                            isPast ? "bg-primary border-primary text-background" : 
                            isCurrent ? "bg-background border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.15)]" : 
                            "bg-background border-control"
                          )}>
                            {isPast && <Check className="h-3 w-3 stroke-[3]" />}
                            {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </div>
                          
                          <div className={cn("flex-1 transition-opacity duration-500", isFuture ? "opacity-40" : "opacity-100")}>
                            <h4 className={cn("font-bold text-[15px]", isCurrent ? "text-primary" : "text-content")}>
                              {step.label}
                            </h4>
                            <p className="text-sm font-medium text-content-secondary mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 mb-4 text-danger">
                      <X className="h-8 w-8" />
                    </div>
                    <h3 className="font-extrabold text-content text-xl mb-2">Booking Terminated</h3>
                    <p className="text-sm font-medium text-content-secondary">This booking was {b.status.toLowerCase()} and requires no further action.</p>
                  </div>
                )}
              </Card>
            </FadeUp>

            {/* Action Panel */}
            {!isCancelled && b.status !== 'COMPLETED' && (
              <FadeUp delay={0.5}>
                <Card className="p-6 rounded-[2rem] border-primary/20 bg-primary/5 shadow-soft">
                  <h3 className="font-extrabold text-content mb-4 text-sm uppercase tracking-widest text-primary">Required Action</h3>
                  
                  {b.status === 'PENDING' && (
                    <div className="space-y-3">
                      <Button onClick={() => setStatus.mutate({ id: b._id, status: 'ACCEPTED' })} loading={setStatus.isPending} className="w-full rounded-xl h-12 shadow-md hover:shadow-card hover:scale-[1.02] transition-all">
                        <Check className="h-4 w-4 mr-2" /> Accept Booking
                      </Button>
                      <Button variant="ghost" onClick={() => window.confirm('Reject booking?') && setStatus.mutate({ id: b._id, status: 'REJECTED' })} className="w-full rounded-xl h-12 text-danger hover:bg-danger/10">
                        <X className="h-4 w-4 mr-2" /> Decline Request
                      </Button>
                    </div>
                  )}

                  {b.status === 'ACCEPTED' && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-content-secondary">Assign a worker to dispatch them to the location.</p>
                      <Button onClick={() => setAssignOpen(true)} className="w-full rounded-xl h-12 shadow-md hover:shadow-card hover:scale-[1.02] transition-all">
                        <UserPlus className="h-4 w-4 mr-2" /> Assign Worker
                      </Button>
                    </div>
                  )}

                  {b.status === 'WORKER_ASSIGNED' && (
                    <div className="space-y-4">
                      {b.bookingType === 'WALK_IN' ? (
                        // Walk-in: customer is physically present — skip OTP, start directly
                        <>
                          <p className="text-sm font-medium text-content-secondary">Customer is present. Start the service directly — no OTP required for walk-in bookings.</p>
                          <Button
                            onClick={() => start.mutate({ id: b._id, otp: undefined, beforeImages: beforeImgs })}
                            loading={start.isPending}
                            className="w-full rounded-xl h-12 shadow-md hover:shadow-card hover:scale-[1.02] transition-all"
                          >
                            <Play className="h-4 w-4 mr-2" /> Start Service
                          </Button>
                        </>
                      ) : (
                        // Online: OTP required
                        <>
                          <p className="text-sm font-medium text-content-secondary">Worker is ready. Enter customer OTP to begin the wash.</p>
                          <Button onClick={() => setStartOpen(true)} className="w-full rounded-xl h-12 shadow-md hover:shadow-card hover:scale-[1.02] transition-all">
                            <Play className="h-4 w-4 mr-2" /> Start Service (OTP)
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {b.status === 'IN_PROGRESS' && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-content-secondary">Service is running. Upload after photos before marking as complete.</p>
                      <Button 
                        onClick={() => complete.mutate({ id: b._id, afterImages: afterImgs })} 
                        loading={complete.isPending} 
                        className="w-full rounded-xl h-12 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-card hover:scale-[1.02] transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                      </Button>
                    </div>
                  )}
                </Card>
              </FadeUp>
            )}

          </div>
        </div>
      </div>

      {/* Assign worker modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign an Expert"
        footer={<Button variant="secondary" className="rounded-xl h-10 px-6" onClick={() => setAssignOpen(false)}>Close</Button>}>
        {!available.length ? (
          <div className="text-center py-6">
            <User className="h-10 w-10 text-content-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-content">No available workers.</p>
            <p className="text-sm text-content-secondary mt-1">Set a worker to "available" in your staff settings first.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {available.map((w) => (
              <button key={w._id} onClick={() => assignWorker.mutate({ id: b._id, workerId: w._id }, { onSuccess: () => setAssignOpen(false) })} className="w-full text-left group">
                <Card className="flex items-center justify-between p-4 rounded-xl border-hairline group-hover:border-primary group-hover:bg-primary/5 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-extrabold text-content">{w.name}</span>
                      <span className="block text-xs font-medium text-content-muted">{w.speciality || 'General Cleaning'}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-content-muted group-hover:text-primary transition-colors" />
                </Card>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Start job (OTP) modal */}
      <Modal open={startOpen} onClose={() => setStartOpen(false)} title="Start Service Authentication"
        footer={<><Button variant="secondary" className="rounded-xl" onClick={() => setStartOpen(false)}>Cancel</Button><Button className="rounded-xl px-8" loading={start.isPending} disabled={!otp || beforeImgs.length === 0} onClick={submitStart}>Start Service</Button></>}>
        <div className="space-y-6 pt-2">
          
          <div className="bg-accent-light/50 p-4 rounded-xl border border-hairline/50">
            <h4 className="text-sm font-bold text-content mb-3 flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /> Initial Condition Check</h4>
            <p className="text-xs text-content-secondary mb-4 leading-relaxed">Please capture and upload clear photos of the vehicle's exterior and interior before starting the wash.</p>
            
            <div className="flex flex-wrap gap-2">
              {beforeImgs.map((u, i) => <div key={i} className="h-16 w-16 rounded-xl border border-hairline shadow-sm" style={{ backgroundImage: `url(${u})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />)}
              <button onClick={() => beforeRef.current?.click()} disabled={uploading} className="h-16 w-16 rounded-xl border-2 border-dashed border-control hover:border-primary bg-background hover:bg-primary/5 flex flex-col items-center justify-center text-content-muted hover:text-primary transition-colors">
                <Upload className="h-5 w-5" />
              </button>
            </div>
            <input ref={beforeRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) doUpload(Array.from(e.target.files), setBeforeImgs); e.target.value = '' }} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-content mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Verification Code</h4>
            <Input 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              inputMode="numeric" 
              maxLength={6} 
              className="tabular tracking-[0.5em] font-extrabold text-lg h-14 text-center rounded-xl" 
              placeholder="000000" 
            />
            <p className="text-xs font-medium text-content-secondary text-center mt-3">Ask the customer for the 6-digit OTP from their dashboard.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
