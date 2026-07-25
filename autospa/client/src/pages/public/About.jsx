import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  Clock,
  Zap,
  Users,
  CreditCard,
  Star,
  Eye,
  MessageSquare,
  Building2,
  Wrench,
  Sparkles,
  Award,
  Flame,
  UserCheck,
  TrendingUp,
  Compass,
  ThumbsUp,
  Sliders,
  ShieldCheck,
  UsersRound,
  Heart,
  ChevronRight,
  HeartHandshake,
  Activity,
  UserPlus,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Send,
} from 'lucide-react'

import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'

/* ═══════════════════════════ DATA ════════════════════════════ */

const CUSTOMER_PROBLEMS = [
  { text: 'Finding trusted garages' },
  { text: 'No transparent pricing' },
  { text: 'Long waiting times' },
  { text: 'Manual booking' },
  { text: 'No service history' },
  { text: 'No booking tracking' },
]

const GARAGE_PROBLEMS = [
  { text: 'Manual operations' },
  { text: 'No digital presence' },
  { text: 'Poor customer management' },
  { text: 'No business analytics' },
  { text: 'Scheduling problems' },
  { text: 'Inventory challenges' },
]

const SOLUTIONS = [
  {
    icon: Compass,
    title: 'Discover Garages',
    desc: 'Search verified garages nearby with comprehensive details and verified reviews.',
  },
  {
    icon: CalendarCheck,
    title: 'Book Instantly',
    desc: 'Book services in minutes with direct visibility into slot availability.',
  },
  {
    icon: Sliders,
    title: 'Manage Everything',
    desc: 'Track active bookings and monitor comprehensive digital service history records.',
  },
]

const WHY_CHOOSE = [
  { icon: Shield, title: 'Verified Garages', desc: 'Garages are thoroughly vetted, background checked and approved before onboarding.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'See upfront pricing for all services with zero hidden convenience fees.' },
  { icon: MessageSquare, title: 'Real Customer Reviews', desc: 'View authentic ratings and feedback published by verified car owners.' },
  { icon: Clock, title: 'Real-time Booking Updates', desc: 'Receive status updates and tracking details from check-in to completion.' },
  { icon: UserCheck, title: 'Professional Service Providers', desc: 'Connect with experienced mechanics and specialized detailing shops.' },
  { icon: CreditCard, title: 'Secure Payments', desc: 'Make payments via card, UPI, or digital wallets safely.' },
  { icon: Zap, title: 'Modern Booking Experience', desc: 'Seamlessly schedule service slots from any device in under a minute.' },
  { icon: HeartHandshake, title: 'Dedicated Customer Support', desc: 'Access round-the-clock help for bookings, cancellations, and disputes.' },
]

const WHO_WE_SERVE = [
  {
    title: 'Customers',
    icon: Users,
    points: ['Find trusted garages', 'Book online', 'Track bookings', 'Maintain vehicles'],
  },
  {
    title: 'Garage Owners',
    icon: Building2,
    points: ['Manage services', 'Manage workers', 'Grow business', 'Track analytics'],
  },
  {
    title: 'Administrators',
    icon: ShieldCheck,
    points: ['Verify garages', 'Manage users', 'Monitor bookings', 'Maintain quality'],
  },
]

const CORE_VALUES = [
  { icon: Shield, title: 'Trust', desc: 'We maintain strict standards to ensure every partner garage is completely reliable.' },
  { icon: Eye, title: 'Transparency', desc: 'We guarantee clear upfront pricing and real customer reviews with zero bias.' },
  { icon: Sparkles, title: 'Innovation', desc: 'We leverage modern technology to streamline scheduling, tracking, and management.' },
  { icon: Award, title: 'Quality', desc: 'We partner with qualified specialists who treat every vehicle with extreme care.' },
  { icon: Heart, title: 'Customer First', desc: 'We design every booking flow and support system around user convenience.' },
  { icon: ThumbsUp, title: 'Reliability', desc: 'We deliver consistent service confirmation and booking management daily.' },
]

const STATS = [
  { value: 500, suffix: '+', label: 'Verified Garages', decimals: 0 },
  { value: 20000, suffix: '+', label: 'Customers', decimals: 0 },
  { value: 50000, suffix: '+', label: 'Bookings', decimals: 0 },
  { value: 4.9, suffix: '', label: 'Average Rating', decimals: 1 },
]

const ROADMAP = [
  { version: 'Version 1', title: 'Marketplace Platform', desc: 'Launch core booking engine, verified garage listings, customer dashboards, and review modules.' },
  { version: 'Version 2', title: 'Membership & Subscriptions', desc: 'Introduce subscription plans, partner discounts, coupon modules, and periodic maintenance packages.' },
  { version: 'Version 3', title: 'Home Car Wash', desc: 'Roll out mobile car washing service options delivered directly to customer locations.' },
  { version: 'Version 4', title: 'AI Recommendations', desc: 'Deploy automated maintenance scheduling alerts and smart search matching engines.' },
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

/* ── Count Up Hook ── */
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

/* ═══════════════════════════ SVG Ecosystem Illustration ════════════════════════════ */

function EcosystemSVG() {
  return (
    <svg viewBox="0 0 440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <ellipse cx="220" cy="275" rx="160" ry="16" fill="var(--border-hairline)" opacity="0.5" />
      {/* Garage building outline block */}
      <path d="M50 260 V160 L140 100 L230 160 V260 Z" fill="var(--accent-light)" opacity="0.6" />
      <path d="M60 260 V170 L140 115 L220 170 V260 Z" fill="var(--surface)" opacity="0.8" />
      <rect x="90" y="180" width="100" height="80" rx="4" fill="var(--accent-light)" opacity="0.8" />
      <line x1="140" y1="180" x2="140" y2="260" stroke="var(--border-strong)" strokeWidth="2" />
      {/* Luxury car representation */}
      <path
        d="M210 230 Q210 205 238 195 L278 174 Q291 165 313 162 L375 162 Q397 165 410 174 L450 195 Q478 205 478 230 L478 244 Q478 253 468 253 L220 253 Z"
        fill="var(--primary)" opacity="0.9"
        transform="scale(0.75) translate(40, 50)"
      />
      {/* Mechanic figure representation */}
      <circle cx="340" cy="110" r="22" fill="var(--accent-mid)" opacity="0.9" />
      <path d="M305 170 C305 145 320 135 340 135 C360 135 375 145 375 170 V200 H305 Z" fill="var(--primary-hover)" opacity="0.8" />
      {/* Connection lines */}
      <path d="M140 180 Q220 120 318 160" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      <path d="M220 240 Q180 200 140 230" stroke="var(--accent-mid)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
      {/* Sparkles */}
      <circle cx="280" cy="120" r="4" fill="var(--primary)" opacity="0.6" />
      <circle cx="100" cy="80" r="3" fill="var(--accent-mid)" opacity="0.7" />
    </svg>
  )
}

/* ═══════════════════════════ PAGE COMPONENT ════════════════════════════ */

export default function About() {
  return (
    <>
      <style>{`
        @keyframes ab-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes ab-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(0.95); }
          66% { transform: translate(15px, -25px) scale(1.08); }
        }
        @keyframes ab-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes ab-shape-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(8deg); }
        }
        @keyframes ab-shape-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-6deg); }
        }
        .ab-blob-1 { animation: ab-blob-1 18s ease-in-out infinite; }
        .ab-blob-2 { animation: ab-blob-2 22s ease-in-out infinite; }
        .ab-float { animation: ab-float 4s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(168deg, var(--bg) 0%, var(--surface) 45%, var(--accent-light) 100%)' }}
      >
        <div
          className="ab-blob-1 pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, var(--accent-mid) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="ab-blob-2 pointer-events-none absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent-header) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-mid bg-accent-light px-4 py-1.5 text-xs font-semibold text-primary-deep">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  About AutoSpa
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-content"
              >
                Driving the Future of{' '}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Professional Car Care
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-5 text-base sm:text-[17px] leading-relaxed text-content-secondary"
              >
                AutoSpa is a trusted marketplace that connects customers with verified garages, making car care easier, faster and more transparent.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-3 mt-8"
              >
                <Link to="/customer/garages">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="gap-2 rounded-xl">
                      Book a Service <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/register/garage">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="secondary" size="lg" className="gap-2 rounded-xl">
                      Register Your Garage
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="relative w-full max-w-[420px] ab-float">
                <div
                  className="rounded-3xl p-8"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-light) 0%, rgba(255,255,255,0.6) 100%)',
                    border: '1px solid var(--border-hairline)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 64px rgba(15,138,109,0.12), var(--shadow-card)',
                  }}
                >
                  <EcosystemSVG />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 2. OUR STORY ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="max-w-xl">
                <SectionLabel>Our Story</SectionLabel>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-content">
                  Why AutoSpa Exists
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-content-secondary">
                  <p>
                    Finding a reliable garage often means calling multiple places, comparing prices manually and waiting in long queues. There is a clear lack of transparency in pricing, booking, and tracking.
                  </p>
                  <p>
                    Garage owners also struggle with manual bookings, customer management and growing their business online. They lack the digital tools needed to run an optimized modern garage.
                  </p>
                  <p>
                    AutoSpa was built to simplify this entire experience through one modern digital platform that brings trust, simplicity, and ease of use to car care.
                  </p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="relative rounded-2xl border border-hairline bg-background p-8 flex items-center justify-center min-h-[300px]">
                <div className="absolute inset-0 opacity-10 bg-grid" />
                <div className="relative text-center max-w-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mx-auto">
                    <HeartHandshake className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-content">Connecting the Ecosystem</h3>
                  <p className="text-[13px] text-content-secondary leading-relaxed">
                    By providing structured tools for both vehicle owners and service providers, we build a seamless, reliable bridge of trust.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3. THE PROBLEM ═══════════════════ */}
      <section className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel>The Problem</SectionLabel>
              <SectionHeading>The Fragmented State of Car Care</SectionHeading>
              <SectionDesc>
                Both vehicle owners and garage operators struggle with inefficiencies every day.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Customers side */}
            <FadeUp delay={0.05}>
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-content flex items-center gap-2 px-2">
                  <Users className="h-5 w-5 text-primary" /> Customers Face
                </h3>
                <div className="grid gap-3">
                  {CUSTOMER_PROBLEMS.map((prob) => (
                    <motion.div
                      key={prob.text}
                      whileHover={{ scale: 1.015 }}
                      className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-4 shadow-soft"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm font-semibold text-content">{prob.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Garage Owners side */}
            <FadeUp delay={0.1}>
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-content flex items-center gap-2 px-2">
                  <Building2 className="h-5 w-5 text-primary" /> Garage Owners Face
                </h3>
                <div className="grid gap-3">
                  {GARAGE_PROBLEMS.map((prob) => (
                    <motion.div
                      key={prob.text}
                      whileHover={{ scale: 1.015 }}
                      className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-4 shadow-soft"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm font-semibold text-content">{prob.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 4. OUR SOLUTION ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel>Our Solution</SectionLabel>
              <SectionHeading>One Platform. Every Car Care Need.</SectionHeading>
              <SectionDesc>
                AutoSpa integrates booking, tracking, and management into a unified startup platform.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {SOLUTIONS.map((sol, i) => {
              const Icon = sol.icon
              return (
                <FadeUp key={sol.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="rounded-2xl border border-hairline bg-background p-6 sm:p-7 transition-shadow hover:shadow-card text-center"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-light mx-auto mb-5">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-[16px] font-bold text-content">{sol.title}</h3>
                    <p className="mt-2 text-[13px] text-content-secondary leading-relaxed">{sol.desc}</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5. MISSION & VISION ═══════════════════ */}
      <section className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <FadeUp>
              <div
                className="rounded-2xl border border-hairline bg-surface p-7 sm:p-8 flex flex-col h-full"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center mb-4">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-content">Our Mission</h3>
                <p className="mt-3 text-[14px] text-content-secondary leading-relaxed flex-1">
                  To simplify vehicle maintenance by connecting customers with trusted garages through modern technology.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div
                className="rounded-2xl border border-hairline bg-surface p-7 sm:p-8 flex flex-col h-full"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-content">Our Vision</h3>
                <p className="mt-3 text-[14px] text-content-secondary leading-relaxed flex-1">
                  To become the most trusted digital marketplace for professional car care.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 6. WHY CHOOSE AUTOSPA ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Why Choose AutoSpa</SectionLabel>
              <SectionHeading>Built for Trust & Convenience</SectionHeading>
              <SectionDesc>
                We vet every service provider so that you can book with complete peace of mind.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_CHOOSE.map((item, i) => {
              const Icon = item.icon
              return (
                <FadeUp key={item.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="group rounded-2xl border border-hairline bg-background p-6 transition-shadow hover:shadow-card h-full"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-light mb-4 transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-[14px] font-bold text-content">{item.title}</h3>
                    <p className="mt-2 text-[12px] text-content-secondary leading-relaxed">{item.desc}</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 7. WHO WE SERVE ═══════════════════ */}
      <section className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Who We Serve</SectionLabel>
              <SectionHeading>Designed for the Entire Ecosystem</SectionHeading>
              <SectionDesc>
                Specific tools and advantages mapped to every role on our marketplace.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {WHO_WE_SERVE.map((role, i) => {
              const Icon = role.icon
              return (
                <FadeUp key={role.title} delay={i * 0.1}>
                  <div
                    className="rounded-2xl border border-hairline bg-surface p-6 sm:p-7 flex flex-col h-full"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-light mb-5">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-content mb-4">{role.title}</h3>
                    <ul className="space-y-3 flex-1">
                      {role.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-2.5 text-[13px] text-content-secondary">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 8. CORE VALUES ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Core Values</SectionLabel>
              <SectionHeading>What Drives Us Forward</SectionHeading>
              <SectionDesc>
                These guiding principles dictate every engineering and product decision we make.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_VALUES.map((val, i) => {
              const Icon = val.icon
              return (
                <FadeUp key={val.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="rounded-2xl border border-hairline bg-background p-6 transition-shadow hover:shadow-card"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-light mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-[15px] font-bold text-content">{val.title}</h3>
                    <p className="mt-2 text-[12px] text-content-secondary leading-relaxed">{val.desc}</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 9. STATISTICS ═══════════════════ */}
      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 10. PRODUCT ROADMAP ═══════════════════ */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel>Roadmap</SectionLabel>
              <SectionHeading>Product Roadmap</SectionHeading>
              <SectionDesc>
                Our growth strategy and upcoming features designed to expand AutoSpa's ecosystem.
              </SectionDesc>
            </div>
          </FadeUp>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[2px] bg-hairline" />

            <div className="space-y-8">
              {ROADMAP.map((item, i) => (
                <FadeUp key={item.version} delay={i * 0.1}>
                  <div className="relative pl-16 sm:pl-20">
                    <div className="absolute left-0 top-1 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-accent-light border border-hairline flex items-center justify-center font-bold text-primary text-xs sm:text-sm">
                      {item.version.split(' ')[1]}
                    </div>
                    <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6 transition-all hover:shadow-card">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {item.version}
                      </span>
                      <h3 className="text-[16px] font-bold text-content mt-1">{item.title}</h3>
                      <p className="mt-2 text-[13px] text-content-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 11. CTA ═══════════════════ */}
      <FadeUp>
        <section className="mx-4 sm:mx-8 mb-20 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #065f46 0%, var(--primary) 50%, var(--primary-hover) 100%)' }} />

          <div className="absolute top-8 left-[10%] w-20 h-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'ab-shape-1 7s ease-in-out infinite' }} />
          <div className="absolute bottom-12 right-[15%] w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'ab-shape-2 9s ease-in-out infinite' }} />

          <div className="relative mx-auto max-w-4xl px-8 py-16 sm:py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-tight"
            >
              Ready to Experience Better Car Care?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-[17px] text-emerald-100/80 max-w-lg mx-auto"
            >
              Book a verified garage or join AutoSpa as a partner to grow your business online.
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
                    <Building2 className="h-4 w-4" /> Become a Garage Partner
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
