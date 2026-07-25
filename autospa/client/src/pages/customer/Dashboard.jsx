import { Link } from 'react-router-dom'
import { CalendarCheck, Car, Store, CheckCircle2, KeyRound, Plus, ChevronRight, ArrowRight, Droplets, Sparkles, Shield, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { useCustomerDashboard } from '../../hooks/useMe.js'
import { useCars } from '../../hooks/useCars.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { formatDate, formatTime, STATUS_META, shouldShowOtp, currency } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// Fade up animation helper
function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Compact Premium Stat Card
function PremiumStatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-[1.5rem] border border-hairline bg-surface p-5 shadow-sm transition-all hover:shadow-card">
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40", colorClass)} />
      <div className="relative flex flex-col gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-inner", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-3xl font-extrabold text-content tracking-tight">{value}</p>
          <p className="text-[13px] font-semibold text-content-secondary mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useCustomerDashboard()
  const { data: carsData } = useCars()

  const first = user?.name?.split(' ')[0] || 'there'
  const stats = data?.stats
  const next = data?.nextBooking
  const recent = data?.recentBookings || []
  
  // Get first car for vehicle summary
  const primaryCar = carsData?.[0]

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      
      {/* Hero Section */}
      <FadeUp delay={0.1}>
        <div className="relative overflow-hidden rounded-[2rem] border border-hairline bg-surface shadow-soft p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-light/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-content tracking-tight">
                {greeting()}, {first}.
              </h1>
              <p className="mt-3 text-lg font-medium text-content-secondary leading-relaxed">
                {next 
                  ? `Your next booking is ${formatDate(next.startTime)} at ${formatTime(next.startTime)}.`
                  : "Your car deserves some care today. Let's keep it looking its best."
                }
              </p>
              
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/customer/garages" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="rounded-xl shadow-md gap-2">
                      <Store className="h-4 w-4" /> Book a Service
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/customer/bookings" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="secondary" size="lg" className="rounded-xl bg-background shadow-sm border border-hairline hover:bg-accent-light transition-colors gap-2">
                      <CalendarCheck className="h-4 w-4" /> View Bookings
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
            
            {/* Contextual Graphic */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/10 to-accent-light/20 border border-white shadow-inner">
              {next ? <CalendarCheck className="w-14 h-14 text-primary" /> : <Sparkles className="w-14 h-14 text-primary" />}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Booking State & Vehicle Summary Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Next Booking or Empty State (Spans 2 cols) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Skeleton className="h-[280px] rounded-[2rem]" />
          ) : next ? (
            <FadeUp delay={0.2} className="h-full">
              <h2 className="mb-4 text-lg font-bold text-content">Upcoming Service</h2>
              <BoardingPass booking={next} />
            </FadeUp>
          ) : (
            <FadeUp delay={0.2} className="h-full">
              <h2 className="mb-4 text-lg font-bold text-content">Upcoming Service</h2>
              <div className="flex flex-col items-center justify-center text-center p-10 rounded-[2rem] border border-dashed border-control bg-surface h-[280px]">
                <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-content mb-2">No upcoming bookings</h3>
                <p className="text-sm font-medium text-content-secondary mb-6 max-w-sm">
                  Book your next wash and keep your vehicle looking its best.
                </p>
                <div className="flex gap-3">
                  <Link to="/customer/garages">
                    <Button size="sm" className="rounded-xl">Find Nearby Garages</Button>
                  </Link>
                  <Link to="/services">
                    <Button size="sm" variant="secondary" className="rounded-xl border border-hairline">Browse Services</Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          )}
        </div>

        {/* Vehicle Summary Card */}
        <div className="lg:col-span-1">
          <FadeUp delay={0.3} className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-content">My Vehicle</h2>
              <Link to="/customer/cars" className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </div>
            
            {primaryCar ? (
              <motion.div whileHover={{ y: -4 }} className="relative h-[280px] rounded-[2rem] border border-hairline bg-surface p-6 shadow-sm hover:shadow-card transition-all flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-xl bg-accent-light flex items-center justify-center">
                      <Car className="h-7 w-7 text-primary" />
                    </div>
                    <Badge variant="secondary" className="font-semibold px-3 py-1 bg-background border-hairline shadow-sm">
                      {primaryCar.fuelType || 'Petrol'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-content">{primaryCar.make}</h3>
                  <p className="text-base font-semibold text-content-secondary mt-1">{primaryCar.model} {primaryCar.year ? `(${primaryCar.year})` : ''}</p>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <div className="tabular uppercase px-3 py-1.5 rounded-lg border-2 border-control bg-background text-[13px] font-bold text-content shadow-sm">
                      {primaryCar.licensePlate}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: primaryCar.color?.toLowerCase() === 'white' ? '#f8f9fa' : primaryCar.color?.toLowerCase() || 'gray' }} />
                    </div>
                  </div>
                </div>
                
                <Link to={`/customer/cars/${primaryCar._id}`} className="mt-4 block w-full">
                  <Button variant="secondary" className="w-full justify-between rounded-xl bg-background border border-hairline hover:bg-accent-light">
                    Manage Vehicle <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 rounded-[2rem] border border-dashed border-control bg-surface h-[280px]">
                <Car className="h-10 w-10 text-content-muted mb-3" />
                <p className="text-sm font-medium text-content-secondary mb-4">No vehicles added yet.</p>
                <Link to="/customer/cars/new">
                  <Button size="sm" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Car</Button>
                </Link>
              </div>
            )}
          </FadeUp>
        </div>
      </div>

      {/* Quick stats */}
      <FadeUp delay={0.4}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isLoading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-[1.5rem]" />) : (
            <>
              <PremiumStatCard icon={CalendarCheck} label="Total Bookings" value={stats?.totalBookings ?? 0} colorClass="from-blue-500 to-blue-600" />
              <PremiumStatCard icon={CheckCircle2} label="Completed" value={stats?.completed ?? 0} colorClass="from-green-500 to-green-600" />
              <PremiumStatCard icon={Clock} label="Upcoming" value={stats?.upcoming ?? 0} colorClass="from-orange-500 to-orange-600" />
              <PremiumStatCard icon={Car} label="My Cars" value={stats?.cars ?? 0} colorClass="from-purple-500 to-purple-600" />
            </>
          )}
        </div>
      </FadeUp>

      {/* Quick actions (Large Cards) */}
      <FadeUp delay={0.5}>
        <h2 className="mb-4 text-lg font-bold text-content mt-8">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickAction to="/customer/garages" icon={Store} label="Book Service" desc="Find nearby garages and schedule." />
          <QuickAction to="/customer/cars/new" icon={Plus} label="Add Car" desc="Manage vehicles for faster booking." />
          <QuickAction to="/customer/bookings" icon={CalendarCheck} label="My Bookings" desc="Track every service in real time." />
        </div>
      </FadeUp>

      {/* Recent bookings */}
      <FadeUp delay={0.6}>
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-content">Recent Bookings</h2>
            <Link to="/customer/bookings" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem]" />)}</div>
          ) : !recent.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-control bg-surface p-8 text-center text-sm font-medium text-content-secondary">
              No recent bookings found.
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => {
                const meta = STATUS_META[b.status] || {}
                return (
                  <motion.div key={b._id} whileHover={{ y: -2 }} className="group">
                    <Link to={`/customer/bookings/${b._id}`}>
                      <Card className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[1.5rem] hover:border-primary/40 hover:shadow-card transition-all">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light group-hover:bg-primary/10 transition-colors">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="tabular text-[15px] font-bold text-content">{b.bookingNumber}</p>
                            <p className="text-sm font-medium text-content-secondary mt-0.5">{formatDate(b.startTime)} <span className="mx-1">•</span> {currency(b.totalAmount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                          <Badge className={cn(meta.cls, "font-semibold px-3 py-1 shadow-sm")}>{meta.label}</Badge>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Details <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  )
}

function BoardingPass({ booking }) {
  const meta = STATUS_META[booking.status] || {}
  const showOtp = shouldShowOtp(booking)
  return (
    <Card className="overflow-hidden rounded-[2rem] border-hairline shadow-sm hover:shadow-card transition-shadow h-full flex flex-col">
      <div className="flex flex-col sm:flex-row flex-1">
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-content-muted">Active Ticket</span>
            <Badge className={cn(meta.cls, "font-semibold px-3 py-1 shadow-sm")}>{meta.label}</Badge>
          </div>
          <p className="tabular mt-1 text-3xl font-extrabold text-content tracking-tight">{booking.bookingNumber}</p>
          
          <div className="mt-8 grid grid-cols-2 gap-y-6 gap-x-4 text-[14px]">
            <div>
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Date</p>
              <p className="font-bold text-content">{formatDate(booking.startTime)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Time</p>
              <p className="tabular font-bold text-content">{formatTime(booking.startTime)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Services</p>
              <p className="font-bold text-content">{booking.services.map((s) => s.nameAtBooking).join(', ')}</p>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <Link to={`/customer/bookings/${booking._id}`} className="inline-block w-full sm:w-auto">
              <Button className="w-full rounded-xl shadow-md">View details</Button>
            </Link>
          </div>
        </div>

        {/* Perforated stub with the OTP */}
        <div className="relative flex w-full flex-col items-center justify-center gap-3 border-t sm:border-t-0 sm:border-l border-dashed border-control bg-accent-light/50 p-6 sm:w-64">
          <div className="absolute -top-3 left-1/2 sm:-left-3 sm:top-1/2 w-6 h-6 rounded-full bg-background border border-hairline -translate-x-1/2 sm:translate-x-0 sm:-translate-y-1/2 z-10" />
          <div className="absolute -bottom-3 left-1/2 sm:-left-3 sm:bottom-auto sm:top-1/4 w-6 h-6 rounded-full bg-background border border-hairline -translate-x-1/2 sm:translate-x-0 z-10 hidden sm:block" />
          <div className="absolute -bottom-3 left-1/2 sm:-left-3 sm:bottom-1/4 w-6 h-6 rounded-full bg-background border border-hairline -translate-x-1/2 sm:translate-x-0 z-10 hidden sm:block" />
          
          {showOtp ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-deep mb-1">Service OTP</p>
              <p className="tabular text-4xl font-extrabold tracking-widest text-primary mb-2">{booking.serviceOtp}</p>
              <p className="text-center text-[12px] font-medium text-content-secondary">Show this code on arrival</p>
            </motion.div>
          ) : (
            <div className="text-center max-w-[160px]">
              <div className="w-12 h-12 rounded-full bg-background border border-hairline flex items-center justify-center mx-auto mb-3">
                <KeyRound className="h-5 w-5 text-content-muted" />
              </div>
              <p className="text-center text-[13px] font-medium text-content-secondary leading-relaxed">
                OTP appears once the garage accepts your booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function QuickAction({ to, icon: Icon, label, desc }) {
  return (
    <Link to={to} className="block group">
      <motion.div whileHover={{ y: -4 }}>
        <Card className="flex flex-col p-6 rounded-[1.5rem] border-hairline shadow-sm group-hover:shadow-card group-hover:border-primary/30 transition-all h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <ArrowRight className="h-5 w-5 text-content-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-extrabold text-[16px] text-content mb-1">{label}</h3>
          <p className="text-[13px] font-medium text-content-secondary leading-relaxed">{desc}</p>
        </Card>
      </motion.div>
    </Link>
  )
}
