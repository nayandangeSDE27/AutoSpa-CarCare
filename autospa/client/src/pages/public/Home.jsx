import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
  MapPin,
  Car,
  Calendar,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  Shield,
  Clock,
  Droplets,
  Wrench,
  Zap,
  Users,
  Building2,
} from 'lucide-react'

import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'

/* ─────────────────── static data ─────────────────── */

const TRUST_BADGES = [
  { Icon: Shield, text: 'Verified Garages' },
  { Icon: Clock, text: 'Live Tracking' },
  { Icon: Zap, text: 'Instant Confirmation' },
]

const STATS = [
  { value: 4.9, suffix: '', prefix: '⭐ ', label: 'Average Rating', decimals: 1 },
  { value: 500, suffix: '+', prefix: '', label: 'Verified Garages', decimals: 0 },
  { value: 20000, suffix: '+', prefix: '', label: 'Bookings Completed', decimals: 0 },
  { value: 98, suffix: '%', prefix: '', label: 'On-Time Completion', decimals: 0 },
]

const FLOATING_ICONS = [
  { Icon: Droplets, size: 22, color: 'var(--primary)', x: '12%', y: '18%', delay: 0 },
  { Icon: Wrench, size: 20, color: 'var(--accent-mid)', x: '85%', y: '25%', delay: 0.5 },
  { Icon: Shield, size: 18, color: 'var(--primary)', x: '78%', y: '72%', delay: 1.0 },
  { Icon: Sparkles, size: 24, color: 'var(--accent-mid)', x: '8%', y: '75%', delay: 1.5 },
]

/* ─────────────────── hooks ─────────────────── */

function useCountUp(end, decimals = 0, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const hasRun = useRef(false)

  useEffect(() => {
    if (!inView || hasRun.current) return
    hasRun.current = true
    const start = 0
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased
      setCount(current)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, end, duration])

  const display = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString()

  return { ref, display }
}

/* ─────────────────── components ─────────────────── */

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

function StatCard({ stat, index }) {
  const { ref, display } = useCountUp(stat.value, stat.decimals)

  return (
    <FadeUp delay={index * 0.08}>
      <div ref={ref} className="text-center px-4 py-6">
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content tabular">
          {stat.prefix}{display}{stat.suffix}
        </p>
        <p className="mt-2 text-sm font-medium text-content-secondary">{stat.label}</p>
      </div>
    </FadeUp>
  )
}

/* ─────────────────── SVG Car ─────────────────── */

function CarIllustration() {
  return (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* car shadow */}
      <ellipse cx="200" cy="230" rx="140" ry="14" fill="var(--border-hairline)" opacity="0.6" />
      {/* car body */}
      <path
        d="M60 170 Q60 140 90 130 L130 105 Q145 95 170 92 L230 92 Q255 95 270 105 L310 130 Q340 140 340 170 L340 185 Q340 195 330 195 L70 195 Q60 195 60 185 Z"
        fill="var(--primary)"
        opacity="0.9"
      />
      {/* windshield */}
      <path
        d="M135 108 L155 92 Q158 90 165 90 L235 90 Q242 90 245 92 L265 108 Q268 110 262 110 L141 110 Q135 110 135 108 Z"
        fill="var(--accent-light)"
        opacity="0.8"
      />
      {/* roof */}
      <path
        d="M130 110 Q128 100 145 88 L160 82 Q170 78 200 78 Q230 78 240 82 L255 88 Q272 100 270 110 Z"
        fill="var(--primary-hover)"
        opacity="0.7"
      />
      {/* front window */}
      <path
        d="M140 108 L158 90 Q162 87 170 87 L198 87 L198 108 Z"
        fill="var(--accent-mid)"
        opacity="0.5"
      />
      {/* rear window */}
      <path
        d="M202 87 L230 87 Q238 87 242 90 L260 108 L202 108 Z"
        fill="var(--accent-mid)"
        opacity="0.5"
      />
      {/* bottom trim */}
      <rect x="75" y="185" width="250" height="8" rx="4" fill="var(--primary-hover)" opacity="0.6" />
      {/* front wheel */}
      <circle cx="125" cy="193" r="24" fill="var(--text-primary)" opacity="0.85" />
      <circle cx="125" cy="193" r="16" fill="var(--text-secondary)" opacity="0.4" />
      <circle cx="125" cy="193" r="8" fill="var(--text-primary)" opacity="0.6" />
      {/* rear wheel */}
      <circle cx="275" cy="193" r="24" fill="var(--text-primary)" opacity="0.85" />
      <circle cx="275" cy="193" r="16" fill="var(--text-secondary)" opacity="0.4" />
      <circle cx="275" cy="193" r="8" fill="var(--text-primary)" opacity="0.6" />
      {/* headlight */}
      <ellipse cx="340" cy="168" rx="6" ry="8" fill="var(--accent-mid)" opacity="0.9" />
      {/* tail light */}
      <ellipse cx="62" cy="168" rx="4" ry="6" fill="#ef4444" opacity="0.7" />
      {/* door line */}
      <line x1="200" y1="100" x2="200" y2="185" stroke="var(--primary-hover)" strokeWidth="1.5" opacity="0.4" />
      {/* sparkle accents */}
      <circle cx="170" cy="140" r="2" fill="white" opacity="0.6" />
      <circle cx="230" cy="135" r="1.5" fill="white" opacity="0.5" />
      <circle cx="190" cy="120" r="1.2" fill="white" opacity="0.4" />
    </svg>
  )
}

/* ═══════════════════════════ HOME PAGE ════════════════════════════ */

export default function Home() {
  /* ── mouse parallax ── */
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Parallax layers (illustration = 1x, icons = 1.5x)
  const carX = useTransform(springX, [-1, 1], [-8, 8])
  const carY = useTransform(springY, [-1, 1], [-5, 5])
  const iconX = useTransform(springX, [-1, 1], [-14, 14])
  const iconY = useTransform(springY, [-1, 1], [-10, 10])

  const handleMouseMove = useCallback((e) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mouseX.set((e.clientX - cx) / (rect.width / 2))
    mouseY.set((e.clientY - cy) / (rect.height / 2))
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <>
      {/* inject hero keyframes */}
      <style>{`
        @keyframes hero-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes hero-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(0.95); }
          66% { transform: translate(15px, -25px) scale(1.08); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes car-sway {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(15, 138, 109, 0.25); }
          50% { box-shadow: 0 0 0 10px rgba(15, 138, 109, 0); }
        }
        @keyframes bubble {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          20% { opacity: 0.6; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
        }
        .hero-blob-1 { animation: hero-blob-1 18s ease-in-out infinite; }
        .hero-blob-2 { animation: hero-blob-2 22s ease-in-out infinite; }
        .float-icon { animation: float-icon 3.5s ease-in-out infinite; }
        .car-sway { animation: car-sway 6s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(168deg, var(--bg) 0%, var(--surface) 45%, var(--accent-light) 100%)' }}
      >
        {/* Animated gradient blobs */}
        <div
          className="hero-blob-1 pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, var(--accent-mid) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="hero-blob-2 pointer-events-none absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, var(--accent-header) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        {/* Subtle floating circles */}
        <div className="pointer-events-none absolute top-1/4 left-[60%] w-3 h-3 rounded-full opacity-20" style={{ background: 'var(--primary)', animation: 'bubble 6s ease-in-out infinite' }} />
        <div className="pointer-events-none absolute top-[40%] left-[15%] w-2 h-2 rounded-full opacity-15" style={{ background: 'var(--accent-mid)', animation: 'bubble 8s ease-in-out 1s infinite' }} />
        <div className="pointer-events-none absolute top-[65%] left-[75%] w-4 h-4 rounded-full opacity-10" style={{ background: 'var(--primary)', animation: 'bubble 7s ease-in-out 2s infinite' }} />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── LEFT: Content ── */}
            <div className="max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-mid bg-accent-light px-4 py-1.5 text-xs font-semibold text-primary-deep">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Premium Car Care Platform
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-content"
              >
                Professional Car Care{' '}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Made Simple.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-5 text-base sm:text-[17px] leading-relaxed text-content-secondary max-w-md"
              >
                Book trusted washing, detailing, and garage services in seconds. Real-time bay tracking, live ETA, zero hassle.
              </motion.p>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-x-5 gap-y-2 mt-6"
              >
                {TRUST_BADGES.map(({ Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-[13px] font-medium text-content-secondary">
                    <Icon className="h-4 w-4 text-primary" /> {text}
                  </span>
                ))}
              </motion.div>

              {/* ── Search Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10"
              >
                <div
                  className="rounded-2xl border border-hairline bg-surface/70 backdrop-blur-xl p-3 sm:p-4 transition-shadow duration-300 hover:shadow-pop"
                  style={{ boxShadow: 'var(--shadow-card), 0 8px 40px rgba(15,138,109,0.08)' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { Icon: MapPin, placeholder: 'Your location', label: 'Location' },
                      { Icon: Car, placeholder: 'Service type', label: 'Service' },
                      { Icon: Calendar, placeholder: 'Pick a date', label: 'Date' },
                    ].map(({ Icon, placeholder, label }) => (
                      <div key={label} className="group relative">
                        <div className="flex items-center gap-2.5 rounded-xl border border-hairline bg-background px-3.5 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                          <Icon className="h-4 w-4 shrink-0 text-primary" />
                          <input
                            type="text"
                            placeholder={placeholder}
                            aria-label={label}
                            className="flex-1 bg-transparent text-sm text-content outline-none placeholder:text-content-muted"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Link to="/customer/garages" className="block rounded-xl focus-visible:outline-none">
                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full gap-2 h-11 text-sm font-semibold pulse-glow rounded-xl">
                          Search Garages <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT: Illustration ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center relative"
            >
              {/* Floating icons with parallax */}
              {FLOATING_ICONS.map(({ Icon, size, color, x, y, delay }, i) => (
                <motion.div
                  key={i}
                  className="absolute float-icon"
                  style={{
                    left: x,
                    top: y,
                    x: iconX,
                    y: iconY,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl backdrop-blur-sm"
                    style={{
                      width: size + 20,
                      height: size + 20,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-hairline)',
                      boxShadow: 'var(--shadow-soft)',
                    }}
                  >
                    <Icon style={{ width: size, height: size, color }} />
                  </div>
                </motion.div>
              ))}

              {/* Car illustration with parallax + sway */}
              <motion.div
                className="relative w-full max-w-[420px] car-sway"
                style={{ x: carX, y: carY }}
              >
                {/* Glassmorphism background card */}
                <div
                  className="rounded-3xl p-8 sm:p-10"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-light) 0%, rgba(255,255,255,0.6) 100%)',
                    border: '1px solid var(--border-hairline)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 64px rgba(15,138,109,0.12), var(--shadow-card)',
                  }}
                >
                  <CarIllustration />
                </div>

                {/* Floating badge — Booking confirmed */}
                <motion.div
                  initial={{ opacity: 0, x: -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -left-6 top-6 flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3"
                  style={{ boxShadow: 'var(--shadow-pop)' }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-content-muted">Booking confirmed</p>
                    <p className="text-sm font-bold text-content">Bay 2 · 10:30 AM</p>
                  </div>
                </motion.div>

                {/* Floating badge — ETA */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.95, duration: 0.5 }}
                  className="absolute -right-4 bottom-10 rounded-2xl border border-hairline bg-surface px-4 py-3"
                  style={{ boxShadow: 'var(--shadow-pop)' }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-content-muted">Ready in</p>
                  <p className="text-2xl font-extrabold text-primary">12 min</p>
                </motion.div>

                {/* Floating badge — Rating */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  className="absolute -right-2 top-4 flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-2"
                  style={{ boxShadow: 'var(--shadow-soft)' }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-content ml-0.5">4.9</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ STATISTICS ═══════ */}
      <section className="relative border-y border-hairline bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
