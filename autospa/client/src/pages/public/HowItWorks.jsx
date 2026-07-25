import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Shield,
  Clock,
  Zap,
  Users,
  CreditCard,
  ChevronDown,
  Star,
  Eye,
  MessageSquare,
  UserPlus,
  Car,
  MapPin,
  CalendarCheck,
  ClipboardCheck,
  Radio,
  BadgeCheck,
  Building2,
  FileCheck,
  ShieldCheck,
  Wrench,
  UserCog,
  Handshake,
  CircleDollarSign,
  BarChart3,
  Settings,
  AlertTriangle,
  Activity,
  Sparkles,
  Send,
  ChevronsRight,
} from 'lucide-react'

import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'

/* ═══════════════════════════ DATA ════════════════════════════ */

const JOURNEY_CARDS = [
  { key: 'customer', icon: Car, label: 'Customer', desc: 'Book car care services from verified garages near you.' },
  { key: 'garage', icon: Building2, label: 'Garage Owner', desc: 'List your garage, manage bookings and grow revenue.' },
  { key: 'admin', icon: ShieldCheck, label: 'Administrator', desc: 'Monitor and manage the entire AutoSpa platform.' },
]

const CUSTOMER_STEPS = [
  { icon: UserPlus, title: 'Create Account', desc: 'Register with your email and verify your account. It takes less than 30 seconds to get started.' },
  { icon: Car, title: 'Add Your Vehicle', desc: 'Store vehicle information — make, model, year and registration — for faster booking in the future.' },
  { icon: MapPin, title: 'Find Nearby Garages', desc: 'Search by location, services offered, customer ratings and distance to find the perfect garage.' },
  { icon: ClipboardCheck, title: 'Choose Service', desc: 'Compare prices, estimated duration and real customer reviews across multiple garages.' },
  { icon: CalendarCheck, title: 'Book Your Slot', desc: 'Choose your preferred date, time slot and payment method. Confirm with a single tap.' },
  { icon: Handshake, title: 'Garage Accepts Booking', desc: 'The garage reviews and accepts your booking. You receive instant confirmation via notification.' },
  { icon: Radio, title: 'Track Progress', desc: 'Monitor every stage of your service in real time — from check-in to completion.' },
  { icon: Star, title: 'Complete & Review', desc: 'Complete payment and share your experience. Your review helps other customers choose better.' },
]

const GARAGE_STEPS = [
  { icon: UserPlus, title: 'Create Garage Account', desc: 'Register as a garage owner with your business email.' },
  { icon: Building2, title: 'Complete Business Profile', desc: 'Add garage name, address, operating hours and photos.' },
  { icon: FileCheck, title: 'Upload Verification Documents', desc: 'Submit business license, insurance and certifications.' },
  { icon: ShieldCheck, title: 'Admin Approval', desc: 'Our team verifies your documents and approves your garage.' },
  { icon: Wrench, title: 'Add Services', desc: 'List services you offer with pricing, duration and details.' },
  { icon: UserCog, title: 'Manage Workers', desc: 'Add your team members and assign roles and specializations.' },
  { icon: Handshake, title: 'Accept Bookings', desc: 'Review incoming booking requests and accept or reschedule.' },
  { icon: Users, title: 'Assign Worker', desc: 'Assign the right technician to each confirmed booking.' },
  { icon: CheckCircle, title: 'Complete Service', desc: 'Mark service as complete and update the customer in real time.' },
  { icon: CircleDollarSign, title: 'Receive Earnings', desc: 'Earnings are settled to your bank account on a regular cycle.' },
]

const ADMIN_STEPS = [
  { icon: BadgeCheck, title: 'Verify Garages', desc: 'Review and approve garage applications and documents.' },
  { icon: Users, title: 'Manage Users', desc: 'Oversee customer and garage owner accounts.' },
  { icon: ClipboardCheck, title: 'Monitor Bookings', desc: 'Track all active, completed and disputed bookings.' },
  { icon: AlertTriangle, title: 'Handle Reports', desc: 'Investigate and resolve complaints and disputes.' },
  { icon: BarChart3, title: 'Platform Analytics', desc: 'Monitor revenue, growth and performance metrics.' },
  { icon: Settings, title: 'Platform Settings', desc: 'Configure commissions, policies and system settings.' },
]

const BOOKING_FLOW = [
  { icon: Car, label: 'Customer', color: 'var(--primary)' },
  { icon: Send, label: 'Booking Created', color: '#2563eb' },
  { icon: Building2, label: 'Garage Receives', color: '#7c3aed' },
  { icon: Handshake, label: 'Garage Accepts', color: '#059669' },
  { icon: UserCog, label: 'Worker Assigned', color: '#d97706' },
  { icon: Wrench, label: 'Service Starts', color: '#0891b2' },
  { icon: CheckCircle, label: 'Service Completed', color: 'var(--primary)' },
  { icon: CreditCard, label: 'Payment', color: '#2563eb' },
  { icon: Star, label: 'Customer Review', color: '#d97706' },
]

const WHY_CHOOSE = [
  { icon: Shield, title: 'Verified Garages', desc: 'Every garage is background-checked, licensed, and rated by real customers.' },
  { icon: MessageSquare, title: 'Real Customer Reviews', desc: 'Genuine ratings from verified customers. No fake or incentivized reviews.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'See exact prices upfront. No hidden charges or surprises after service.' },
  { icon: Radio, title: 'Real-time Tracking', desc: 'Monitor every stage of your service from booking to completion.' },
  { icon: CreditCard, title: 'Secure Payments', desc: 'PCI-compliant payments with UPI, cards, wallets and pay-later options.' },
  { icon: Users, title: 'Professional Workers', desc: 'Trained technicians with certifications and years of experience.' },
]

const STATS = [
  { value: 500, suffix: '+', label: 'Verified Garages', decimals: 0 },
  { value: 20000, suffix: '+', label: 'Completed Bookings', decimals: 0 },
  { value: 15000, suffix: '+', label: 'Happy Customers', decimals: 0 },
  { value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
]

const FAQ_DATA = [
  { q: 'How do I book a service?', a: 'Search for garages near you, compare services and prices, pick your preferred time slot, and confirm your booking. The entire process takes under 60 seconds.' },
  { q: 'Can I cancel a booking?', a: 'Yes. Free cancellation is available up to 2 hours before the scheduled time. Cancellations within 2 hours may attract a small convenience fee.' },
  { q: 'How are garages verified?', a: 'Every garage goes through a rigorous process — we verify business licenses, insurance, staff certifications, equipment quality, and customer reviews. Garages are periodically re-evaluated.' },
  { q: 'Can I pay with cash?', a: 'We support UPI, credit/debit cards, digital wallets, and net banking. Cash payment is available at select garages — you will see the option during checkout if supported.' },
  { q: 'How do garage owners receive payments?', a: 'Earnings are settled to the garage owner\'s registered bank account on a weekly cycle. Detailed transaction reports are available on the garage dashboard.' },
]

/* ═══════════════════════════ HELPERS ════════════════════════════ */

function FadeUp({ children, delay = 0, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary">
      {children}
    </span>
  )
}

function SectionHeading({ children, className }) {
  return (
    <h2 className={cn('mt-3 text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-content', className)}>
      {children}
    </h2>
  )
}

function SectionDesc({ children }) {
  return (
    <p className="mt-4 text-base sm:text-[17px] leading-relaxed text-content-secondary max-w-2xl mx-auto">
      {children}
    </p>
  )
}

/* ── Animated counter ── */
function useCountUp(end, decimals = 0, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const hasRun = useRef(false)

  useEffect(() => {
    if (!inView || hasRun.current) return
    hasRun.current = true
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(end * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end, duration])

  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()
  return { ref, display }
}

function StatCard({ stat, index }) {
  const { ref, display } = useCountUp(stat.value, stat.decimals)
  return (
    <FadeUp delay={index * 0.08}>
      <div ref={ref} className="text-center px-4 py-8">
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content tabular">
          {display}{stat.suffix}
        </p>
        <p className="mt-2 text-sm font-medium text-content-secondary">{stat.label}</p>
      </div>
    </FadeUp>
  )
}

/* ── Vertical Timeline ── */
function TimelineSection({ id, label, heading, description, steps, accentColor = 'var(--primary)' }) {
  return (
    <section id={id} className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <FadeUp>
          <div className="text-center mb-16">
            <SectionLabel>{label}</SectionLabel>
            <SectionHeading>{heading}</SectionHeading>
            <SectionDesc>{description}</SectionDesc>
          </div>
        </FadeUp>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[2px] bg-hairline" />

          <div className="space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <FadeUp key={step.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="relative pl-16 sm:pl-20"
                  >
                    {/* Step number circle */}
                    <div
                      className="absolute left-0 top-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center z-10"
                      style={{ background: 'var(--accent-light)', border: '2px solid var(--border-hairline)' }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>

                    {/* Card */}
                    <div className="group rounded-2xl border border-hairline bg-surface p-5 sm:p-6 transition-all hover:shadow-card hover:border-control">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-accent-light text-[12px] font-extrabold text-primary">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[16px] font-bold text-content">{step.title}</h3>
                          <p className="mt-1.5 text-[13px] text-content-secondary leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════ PAGE ════════════════════════════ */

export default function HowItWorks() {
  const [activeJourney, setActiveJourney] = useState('customer')
  const [openFaq, setOpenFaq] = useState(null)

  const scrollTo = useCallback((id) => {
    setActiveJourney(id)
    const el = document.getElementById(`journey-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes hiw-blob-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes hiw-blob-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(0.95); }
          66% { transform: translate(18px, -25px) scale(1.08); }
        }
        @keyframes hiw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes hiw-shape-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(8deg); }
        }
        @keyframes hiw-shape-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-6deg); }
        }
        @keyframes hiw-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .hiw-blob-a { animation: hiw-blob-a 18s ease-in-out infinite; }
        .hiw-blob-b { animation: hiw-blob-b 22s ease-in-out infinite; }
        .hiw-float { animation: hiw-float 4s ease-in-out infinite; }
        .hiw-bounce { animation: hiw-bounce 2s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(168deg, var(--bg) 0%, var(--surface) 45%, var(--accent-light) 100%)' }}
      >
        <div
          className="hiw-blob-a pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, var(--accent-mid) 0%, transparent 70%)', filter: 'blur(65px)' }}
        />
        <div
          className="hiw-blob-b pointer-events-none absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent-header) 0%, transparent 70%)', filter: 'blur(55px)' }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-mid bg-accent-light px-4 py-1.5 text-xs font-semibold text-primary-deep">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Product Walkthrough
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-content"
              >
                How Auto
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Spa </span>
                Works
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-5 text-base sm:text-[17px] leading-relaxed text-content-secondary max-w-md"
              >
                Learn how customers, garage owners and administrators use AutoSpa to simplify car care.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-3 mt-8"
              >
                <a href="#choose-journey">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="gap-2 rounded-xl">
                      Explore the Journey <ArrowDown className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </a>
                <Link to="/customer/garages">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="secondary" size="lg" className="gap-2 rounded-xl">
                      Book a Service <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="relative w-full max-w-[420px]">
                {/* Main glass card */}
                <div
                  className="rounded-3xl p-8"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-light) 0%, rgba(255,255,255,0.6) 100%)',
                    border: '1px solid var(--border-hairline)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 64px rgba(15,138,109,0.12), var(--shadow-card)',
                  }}
                >
                  {/* Flow visualization */}
                  <div className="space-y-4">
                    {[
                      { icon: Car, text: 'Customer Books', bg: 'var(--accent-light)', clr: 'var(--primary)' },
                      { icon: Building2, text: 'Garage Accepts', bg: '#dbeafe', clr: '#2563eb' },
                      { icon: Wrench, text: 'Service Starts', bg: '#fef3c7', clr: '#d97706' },
                      { icon: CheckCircle, text: 'Completed', bg: '#d1fae5', clr: '#059669' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.bg }}>
                          <item.icon className="h-5 w-5" style={{ color: item.clr }} />
                        </div>
                        <div className="flex-1 h-10 rounded-xl bg-surface/80 border border-hairline flex items-center px-4">
                          <span className="text-[13px] font-semibold text-content">{item.text}</span>
                        </div>
                        {i < 3 && (
                          <div className="absolute right-[50%] translate-x-[50%]">
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -left-8 -bottom-4 rounded-2xl border border-hairline bg-surface px-4 py-3 hiw-float"
                  style={{ boxShadow: 'var(--shadow-pop)', animationDelay: '0s' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Avg. Completion</p>
                  <p className="text-xl font-extrabold text-primary mt-0.5">45 min</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35, duration: 0.5 }}
                  className="absolute -right-6 top-8 flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-2 hiw-float"
                  style={{ boxShadow: 'var(--shadow-soft)', animationDelay: '0.6s' }}
                >
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-content">98% On-time</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="hidden lg:flex flex-col items-center absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <span className="text-[11px] font-medium text-content-muted mb-2">Scroll to explore</span>
            <div className="hiw-bounce">
              <ArrowDown className="h-4 w-4 text-content-muted" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ 2. CHOOSE YOUR JOURNEY ═══════════════════ */}
      <section id="choose-journey" className="py-20 sm:py-28 bg-surface">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Choose Your Journey</SectionLabel>
              <SectionHeading>How Would You Like to Use AutoSpa?</SectionHeading>
              <SectionDesc>Select your role to explore the step-by-step process designed for you.</SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5">
            {JOURNEY_CARDS.map((card, i) => {
              const Icon = card.icon
              const isActive = activeJourney === card.key
              return (
                <FadeUp key={card.key} delay={i * 0.1}>
                  <motion.button
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    onClick={() => scrollTo(card.key)}
                    className={cn(
                      'w-full text-left rounded-2xl border-2 p-6 sm:p-7 transition-all',
                      isActive
                        ? 'border-primary bg-accent-light shadow-pop ring-1 ring-primary/20'
                        : 'border-hairline bg-surface hover:border-control hover:shadow-card'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all',
                        isActive ? 'bg-primary' : 'bg-accent-light'
                      )}
                    >
                      <Icon className={cn('h-7 w-7 transition-colors', isActive ? 'text-primary-foreground' : 'text-primary')} />
                    </div>
                    <h3 className="text-lg font-bold text-content">{card.label}</h3>
                    <p className="mt-2 text-[13px] text-content-secondary leading-relaxed">{card.desc}</p>
                    <div className={cn(
                      'mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                      isActive ? 'text-primary' : 'text-content-muted'
                    )}>
                      View Journey <ChevronsRight className="h-3.5 w-3.5" />
                    </div>
                  </motion.button>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3. CUSTOMER JOURNEY ═══════════════════ */}
      <div style={{ background: 'var(--bg)' }}>
        <TimelineSection
          id="journey-customer"
          label="Customer Journey"
          heading="Book a Service in Minutes"
          description="From creating your account to leaving a review — here is every step of the customer experience."
          steps={CUSTOMER_STEPS}
        />
      </div>

      {/* ═══════════════════ 4. GARAGE OWNER JOURNEY ═══════════════════ */}
      <div className="bg-surface">
        <TimelineSection
          id="journey-garage"
          label="Garage Owner Journey"
          heading="Grow Your Garage Business"
          description="List your garage on AutoSpa, manage bookings, assign workers and receive earnings — all from one dashboard."
          steps={GARAGE_STEPS}
        />
      </div>

      {/* ═══════════════════ 5. ADMINISTRATOR JOURNEY ═══════════════════ */}
      <section id="journey-admin" className="py-20 sm:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel>Administrator Journey</SectionLabel>
              <SectionHeading>Manage the Platform</SectionHeading>
              <SectionDesc>Administrators ensure quality, resolve disputes, and keep the platform running smoothly.</SectionDesc>
            </div>
          </FadeUp>

          {/* Horizontal timeline */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-[32px] left-[calc(8.33%+24px)] right-[calc(8.33%+24px)] h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--accent-header), var(--accent-mid), var(--primary), var(--accent-mid), var(--accent-header))', borderRadius: 2 }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-4">
              {ADMIN_STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <FadeUp key={step.title} delay={i * 0.08}>
                    <div className="flex flex-col items-center text-center relative">
                      <div
                        className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                          boxShadow: '0 4px 16px rgba(15,138,109,0.25)',
                        }}
                      >
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-[14px] font-bold text-content">{step.title}</h3>
                      <p className="mt-1.5 text-[12px] text-content-muted leading-relaxed max-w-[160px]">{step.desc}</p>
                    </div>
                  </FadeUp>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 6. BOOKING FLOW ═══════════════════ */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel><Activity className="h-3.5 w-3.5" /> Complete Flow</SectionLabel>
              <SectionHeading>The Complete Booking Journey</SectionHeading>
              <SectionDesc>Every booking follows this lifecycle — from the customer request to the final review.</SectionDesc>
            </div>
          </FadeUp>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:block">
            <div className="relative flex items-start justify-between">
              {/* Connecting line */}
              <div className="absolute top-[32px] left-[calc(5.55%+24px)] right-[calc(5.55%+24px)] h-[2px]"
                style={{ background: 'linear-gradient(90deg, var(--accent-header), var(--accent-mid), var(--primary), var(--accent-mid), var(--accent-header))', borderRadius: 2 }}
              />

              {BOOKING_FLOW.map((item, i) => {
                const Icon = item.icon
                return (
                  <FadeUp key={item.label} delay={i * 0.08} className="flex-1">
                    <div className="flex flex-col items-center text-center relative">
                      <motion.div
                        whileHover={{ scale: 1.1, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                          boxShadow: `0 6px 20px ${item.color}30`,
                        }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <h3 className="text-[13px] font-bold text-content max-w-[100px]">{item.label}</h3>
                    </div>
                  </FadeUp>
                )
              })}
            </div>
          </div>

          {/* Mobile/Tablet: vertical flow */}
          <div className="lg:hidden">
            <div className="relative pl-10">
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-hairline" />
              <div className="space-y-6">
                {BOOKING_FLOW.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <FadeUp key={item.label} delay={i * 0.06}>
                      <div className="relative flex items-center gap-4">
                        <div
                          className="absolute -left-10 w-10 h-10 rounded-xl flex items-center justify-center z-10"
                          style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`, boxShadow: `0 4px 12px ${item.color}25` }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 rounded-xl border border-hairline bg-surface p-4">
                          <h3 className="text-[14px] font-bold text-content">{item.label}</h3>
                        </div>
                      </div>
                    </FadeUp>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 7. WHY CHOOSE ═══════════════════ */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Why AutoSpa</SectionLabel>
              <SectionHeading>Built for Trust & Convenience</SectionHeading>
              <SectionDesc>Every feature is designed to make car care effortless, transparent, and reliable.</SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CHOOSE.map((item, i) => {
              const Icon = item.icon
              return (
                <FadeUp key={item.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="group rounded-2xl border border-hairline bg-surface p-6 sm:p-7 transition-shadow hover:shadow-card"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-light mb-5 transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-[16px] font-bold text-content">{item.title}</h3>
                    <p className="mt-2 text-[13px] text-content-secondary leading-relaxed">{item.desc}</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 8. STATISTICS ═══════════════════ */}
      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 9. FAQ ═══════════════════ */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>FAQ</SectionLabel>
              <SectionHeading>Frequently Asked Questions</SectionHeading>
              <SectionDesc>Everything you need to know about using AutoSpa.</SectionDesc>
            </div>
          </FadeUp>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className={cn(
                  'rounded-2xl border bg-surface transition-all',
                  openFaq === i ? 'border-primary/30 shadow-card' : 'border-hairline hover:border-control'
                )}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left group"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-[15px] font-semibold text-content pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                      <ChevronDown className={cn('h-5 w-5 transition-colors', openFaq === i ? 'text-primary' : 'text-content-muted group-hover:text-content')} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-0">
                          <p className="text-[14px] text-content-secondary leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 10. CTA ═══════════════════ */}
      <FadeUp>
        <section className="mx-4 sm:mx-8 mb-20 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #065f46 0%, var(--primary) 50%, var(--primary-hover) 100%)' }} />

          <div className="absolute top-8 left-[10%] w-20 h-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'hiw-shape-1 7s ease-in-out infinite' }} />
          <div className="absolute bottom-12 right-[15%] w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'hiw-shape-2 9s ease-in-out infinite' }} />
          <div className="absolute top-1/2 right-[8%] w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'hiw-shape-1 6s ease-in-out 1s infinite' }} />

          <div className="relative mx-auto max-w-4xl px-8 py-16 sm:py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-tight"
            >
              Ready to Experience{' '}<br className="hidden sm:block" />Better Car Care?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-[17px] text-emerald-100/80 max-w-lg mx-auto"
            >
              Join thousands of car owners and garage partners on India's most trusted car care marketplace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
            >
              <Link to="/customer/garages">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[15px] font-bold text-content hover:bg-gray-50 transition-colors">
                    Book a Service <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              </Link>
              <Link to="/register/garage">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/25 text-[15px] font-semibold text-white hover:bg-white/10 transition-colors">
                    <Building2 className="h-4 w-4" /> Register Your Garage
                  </button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      </FadeUp>
    </>
  )
}
