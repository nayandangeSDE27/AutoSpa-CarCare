import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
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
  CreditCard,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Award,
  Gauge,
  Battery,
  Wind,
  ClipboardCheck,
  Settings,
  CircleDot,
  Paintbrush,
  Flame,
  Eye,
  MessageSquare,
  BadgeCheck,
  Navigation,
  CalendarClock,
  ExternalLink,
} from 'lucide-react'

import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'

/* ═══════════════════════════ STATIC DATA ════════════════════════════ */

const CATEGORIES = [
  { icon: Droplets, name: 'Car Wash', desc: 'Exterior & interior wash packages', count: 24, color: 'var(--primary)', bg: 'var(--accent-light)' },
  { icon: Sparkles, name: 'Interior Cleaning', desc: 'Deep vacuum, dashboard & upholstery', count: 18, color: '#2563eb', bg: '#dbeafe' },
  { icon: Paintbrush, name: 'Exterior Detailing', desc: 'Paint correction & polishing', count: 15, color: '#7c3aed', bg: '#f3e8ff' },
  { icon: CircleDot, name: 'Wax Polish', desc: 'Long-lasting shine & protection', count: 12, color: '#d97706', bg: '#fef3c7' },
  { icon: Shield, name: 'Ceramic Coating', desc: '9H hardness nano coating', count: 8, color: 'var(--primary)', bg: 'var(--accent-light)' },
  { icon: Flame, name: 'Engine Cleaning', desc: 'Degrease & steam clean', count: 10, color: '#dc2626', bg: '#fee2e2' },
  { icon: Wrench, name: 'Oil Change', desc: 'Synthetic & mineral oil service', count: 20, color: '#0891b2', bg: '#cffafe' },
  { icon: Gauge, name: 'Tyre Care', desc: 'Rotation, balancing & alignment', count: 14, color: '#4f46e5', bg: '#e0e7ff' },
  { icon: Battery, name: 'Battery Service', desc: 'Testing, charging & replacement', count: 9, color: '#059669', bg: '#d1fae5' },
  { icon: Wind, name: 'AC Service', desc: 'Gas refill, filter & duct cleaning', count: 16, color: '#0284c7', bg: '#e0f2fe' },
  { icon: ClipboardCheck, name: 'Vehicle Inspection', desc: 'Multi-point safety check', count: 11, color: '#b45309', bg: '#fef3c7' },
  { icon: Settings, name: 'General Maintenance', desc: 'Brake, clutch & periodic service', count: 22, color: '#6b7280', bg: '#f3f4f6' },
]

const POPULAR_SERVICES = [
  {
    name: 'Premium Foam Wash',
    rating: 4.9,
    reviews: 2340,
    duration: '45 min',
    price: '₹499',
    desc: 'pH-neutral snow foam wash with microfiber hand dry and tyre dressing.',
    features: ['Snow foam pre-wash', 'Hand wash & dry', 'Tyre dressing', 'Dashboard wipe'],
    color: 'var(--primary)',
    bg: 'linear-gradient(135deg, var(--accent-light) 0%, #d1fae5 100%)',
    icon: Droplets,
  },
  {
    name: 'Steam Wash',
    rating: 4.8,
    reviews: 1820,
    duration: '1 hr',
    price: '₹799',
    desc: 'Chemical-free deep clean using high-pressure steam technology.',
    features: ['Chemical-free process', 'Sanitization included', 'Odour removal', 'Eco-friendly'],
    color: '#0891b2',
    bg: 'linear-gradient(135deg, #cffafe 0%, #e0f2fe 100%)',
    icon: Wind,
  },
  {
    name: 'Interior Deep Cleaning',
    rating: 4.9,
    reviews: 1560,
    duration: '2-3 hrs',
    price: '₹1,499',
    desc: 'Complete interior restoration — seats, carpet, headliner, and vents.',
    features: ['Seat shampooing', 'Carpet extraction', 'Vent cleaning', 'Leather conditioning'],
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
    icon: Sparkles,
  },
  {
    name: 'Wax Polish',
    rating: 4.7,
    reviews: 980,
    duration: '1.5 hrs',
    price: '₹999',
    desc: 'Carnauba wax application for mirror-like finish and UV protection.',
    features: ['Clay bar treatment', 'Machine polish', 'Carnauba wax coat', '3-month protection'],
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    icon: CircleDot,
  },
  {
    name: 'Ceramic Coating',
    rating: 4.9,
    reviews: 740,
    duration: '1-2 days',
    price: '₹7,999',
    desc: '9H hardness nano-ceramic coat for 2+ years of paint protection.',
    features: ['Paint decontamination', 'Surface correction', '9H ceramic layer', '2-year warranty'],
    color: 'var(--primary)',
    bg: 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent-header) 100%)',
    icon: Shield,
  },
  {
    name: 'Engine Wash',
    rating: 4.6,
    reviews: 620,
    duration: '1 hr',
    price: '₹699',
    desc: 'Safe engine bay cleaning with degreaser and protective dressing.',
    features: ['Degreasing spray', 'Steam rinse', 'Protective dressing', 'Hose protection'],
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    icon: Flame,
  },
  {
    name: 'Oil Change',
    rating: 4.8,
    reviews: 3100,
    duration: '30 min',
    price: '₹599',
    desc: 'Full synthetic or mineral oil change with filter replacement.',
    features: ['Oil drain & refill', 'Filter replacement', 'Level check', 'Multi-point inspection'],
    color: '#0891b2',
    bg: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
    icon: Wrench,
  },
  {
    name: 'AC Cleaning & Gas Refill',
    rating: 4.7,
    reviews: 890,
    duration: '1-1.5 hrs',
    price: '₹1,299',
    desc: 'Complete AC system service — evaporator foam wash, gas top-up, filter.',
    features: ['Evaporator cleaning', 'Gas pressure check', 'Cabin filter replace', 'Cooling test'],
    color: '#0284c7',
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    icon: Wind,
  },
]

/* ── Service Providers (Marketplace Section 5) ── */

const FEATURED_SERVICE = {
  name: 'Premium Foam Wash',
  rating: 4.8,
  totalBookings: '12,000+',
  avgDuration: '45 Minutes',
  desc: 'Professional foam wash with exterior cleaning, tire cleaning and hand drying. This service uses pH-neutral snow foam for a scratch-free, showroom-ready finish.',
  icon: Droplets,
}

const GARAGES = [
  {
    id: 1,
    name: 'Auto Shine Garage',
    verified: true,
    rating: 4.9,
    reviews: 425,
    distance: '1.2 km away',
    duration: '45 Minutes',
    price: '₹399',
    availability: 'Available Today',
    slot: '2:30 PM',
    highlights: ['Exterior Foam Wash', 'Tyre Cleaning', 'Glass Cleaning', 'Dashboard Wipe'],
    initials: 'AS',
    color: 'var(--primary)',
    coverGradient: 'linear-gradient(135deg, var(--accent-light) 0%, #d1fae5 100%)',
  },
  {
    id: 2,
    name: 'WashHub Premium',
    verified: true,
    rating: 4.8,
    reviews: 320,
    distance: '2.4 km away',
    duration: '50 Minutes',
    price: '₹349',
    availability: 'Available Today',
    slot: '4:00 PM',
    highlights: ['Snow Foam Wash', 'Underbody Rinse', 'Wax Spray Finish', 'Interior Vacuum'],
    initials: 'WH',
    color: '#2563eb',
    coverGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  },
  {
    id: 3,
    name: 'CarX Detailing Studio',
    verified: true,
    rating: 5.0,
    reviews: 190,
    distance: '3.1 km away',
    duration: '40 Minutes',
    price: '₹450',
    availability: 'Available Tomorrow',
    slot: '10:00 AM',
    highlights: ['Ceramic Foam Wash', 'Alloy Wheel Clean', 'Glass Polish', 'Air Freshener'],
    initials: 'CX',
    color: '#7c3aed',
    coverGradient: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
  },
  {
    id: 4,
    name: 'SparkleAuto Care',
    verified: true,
    rating: 4.7,
    reviews: 560,
    distance: '4.5 km away',
    duration: '55 Minutes',
    price: '₹375',
    availability: 'Available Today',
    slot: '5:15 PM',
    highlights: ['Eco Foam Wash', 'Door Jamb Clean', 'Tyre Shine', 'Dash Polish'],
    initials: 'SA',
    color: '#d97706',
    coverGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  },
]

const SORT_OPTIONS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_low', label: 'Lowest Price' },
  { key: 'rating', label: 'Highest Rated' },
  { key: 'nearest', label: 'Nearest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'today', label: 'Available Today' },
]

const WHY_CHOOSE = [
  { icon: Shield, title: 'Verified Garages', desc: 'Every garage is background-checked, licensed, and rated by real customers before listing.' },
  { icon: Users, title: 'Professional Staff', desc: 'Trained technicians with certifications and years of hands-on experience.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'See exact prices upfront — no hidden charges, no surprises after service.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Book any service in under 60 seconds with real-time slot availability.' },
  { icon: CreditCard, title: 'Secure Payments', desc: 'PCI-compliant payments with UPI, cards, wallets, and pay-later options.' },
  { icon: MessageSquare, title: 'Real Customer Reviews', desc: 'Genuine ratings from verified customers — no fake or incentivized reviews.' },
]

const BOOKING_STEPS = [
  { step: 1, title: 'Choose Service', desc: 'Browse our service catalog and pick what your car needs.' },
  { step: 2, title: 'Select Garage', desc: 'Compare nearby garages by rating, price, and availability.' },
  { step: 3, title: 'Choose Date', desc: 'Pick a convenient date and time slot from live availability.' },
  { step: 4, title: 'Confirm Booking', desc: 'Review details, apply coupons, and confirm with one tap.' },
  { step: 5, title: 'Service Completed', desc: 'Track progress in real-time and rate your experience.' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    initials: 'PS',
    rating: 5,
    review: 'Absolutely amazing service! My car looks brand new after the ceramic coating. The garage was professional and delivered on time.',
    service: 'Ceramic Coating',
    garage: 'SparkleAuto Detailing',
    color: 'var(--primary)',
  },
  {
    name: 'Rahul Mehta',
    initials: 'RM',
    rating: 5,
    review: 'Best car wash experience ever. The foam wash was thorough and the staff was incredibly polite. Will definitely use AutoSpa again.',
    service: 'Premium Foam Wash',
    garage: 'CleanDrive Studio',
    color: '#2563eb',
  },
  {
    name: 'Ananya Patel',
    initials: 'AP',
    rating: 4,
    review: 'Booked an AC service through AutoSpa. Super easy process, transparent pricing, and the technician was very knowledgeable.',
    service: 'AC Cleaning & Gas Refill',
    garage: 'CoolBreeze Auto Care',
    color: '#7c3aed',
  },
  {
    name: 'Vikram Singh',
    initials: 'VS',
    rating: 5,
    review: 'I have been using AutoSpa for 6 months now. The consistency in quality across different garages is impressive. Highly recommend!',
    service: 'Premium Wash Package',
    garage: 'AutoGlow Hub',
    color: '#d97706',
  },
  {
    name: 'Sneha Reddy',
    initials: 'SR',
    rating: 5,
    review: 'The interior deep cleaning transformed my car completely. Even the baby seat stains were gone! Outstanding attention to detail.',
    service: 'Interior Deep Cleaning',
    garage: 'PristineCar Works',
    color: '#059669',
  },
]

const FAQ_DATA = [
  {
    question: 'How long does a service take?',
    answer: 'Service duration varies by type and garage. A basic wash takes about 30-50 minutes, while premium detailing can take 4-5 hours. Ceramic coating may need 1-2 days. You\'ll see each garage\'s estimated duration before booking.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking for free up to 2 hours before the scheduled time. Cancellations made within 2 hours may attract a small convenience fee. You can cancel directly from your dashboard or the booking confirmation page.',
  },
  {
    question: 'Can I pay in cash?',
    answer: 'We support multiple payment methods including UPI, credit/debit cards, digital wallets, and net banking. Cash payment is available at select garages — you\'ll see the option during checkout if the garage supports it.',
  },
  {
    question: 'How are garages verified?',
    answer: 'Every garage on AutoSpa goes through a rigorous verification process. We check business licenses, insurance, staff certifications, equipment quality, and customer reviews. Garages are also periodically re-evaluated to maintain our quality standards.',
  },
  {
    question: 'Can I choose a specific garage?',
    answer: 'Absolutely! You can browse all garages near you, compare their ratings, pricing, and available time slots. You can also save your favorite garages for quick rebooking. Our recommendation engine also suggests the best match based on your car and service needs.',
  },
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

/* ═══════════════════════════ SVG CAR (Hero Right) ════════════════════════════ */

function LuxuryCarSVG() {
  return (
    <svg viewBox="0 0 440 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <ellipse cx="220" cy="245" rx="160" ry="16" fill="var(--border-hairline)" opacity="0.5" />
      <path
        d="M50 180 Q50 148 85 135 L135 108 Q152 96 180 92 L260 92 Q288 96 305 108 L355 135 Q390 148 390 180 L390 198 Q390 210 378 210 L62 210 Q50 210 50 198 Z"
        fill="var(--primary)" opacity="0.92"
      />
      <path
        d="M130 115 Q127 103 148 88 L168 80 Q180 75 220 75 Q260 75 272 80 L292 88 Q313 103 310 115 Z"
        fill="var(--primary-hover)" opacity="0.75"
      />
      <path
        d="M138 112 L162 92 Q166 88 175 88 L265 88 Q274 88 278 92 L302 112 Q306 115 298 115 L146 115 Q138 115 138 112 Z"
        fill="var(--accent-light)" opacity="0.75"
      />
      <path d="M145 113 L165 90 Q169 87 176 87 L218 87 L218 113 Z" fill="var(--accent-mid)" opacity="0.45" />
      <path d="M222 87 L264 87 Q271 87 275 90 L295 113 L222 113 Z" fill="var(--accent-mid)" opacity="0.45" />
      <rect x="68" y="200" width="304" height="9" rx="4.5" fill="var(--primary-hover)" opacity="0.55" />
      <circle cx="135" cy="208" r="28" fill="var(--text-primary)" opacity="0.85" />
      <circle cx="135" cy="208" r="19" fill="var(--text-secondary)" opacity="0.35" />
      <circle cx="135" cy="208" r="9" fill="var(--text-primary)" opacity="0.55" />
      <circle cx="135" cy="208" r="4" fill="var(--accent-mid)" opacity="0.6" />
      <circle cx="305" cy="208" r="28" fill="var(--text-primary)" opacity="0.85" />
      <circle cx="305" cy="208" r="19" fill="var(--text-secondary)" opacity="0.35" />
      <circle cx="305" cy="208" r="9" fill="var(--text-primary)" opacity="0.55" />
      <circle cx="305" cy="208" r="4" fill="var(--accent-mid)" opacity="0.6" />
      <ellipse cx="388" cy="176" rx="7" ry="10" fill="var(--accent-mid)" opacity="0.9" />
      <ellipse cx="388" cy="176" rx="4" ry="6" fill="white" opacity="0.4" />
      <ellipse cx="53" cy="176" rx="5" ry="8" fill="#ef4444" opacity="0.65" />
      <line x1="220" y1="105" x2="220" y2="200" stroke="var(--primary-hover)" strokeWidth="1.5" opacity="0.35" />
      <rect x="240" y="152" width="18" height="4" rx="2" fill="var(--accent-mid)" opacity="0.5" />
      <circle cx="180" cy="148" r="2.5" fill="white" opacity="0.55" />
      <circle cx="260" cy="142" r="2" fill="white" opacity="0.45" />
      <circle cx="200" cy="125" r="1.5" fill="white" opacity="0.35" />
      <circle cx="310" cy="165" r="1.8" fill="white" opacity="0.3" />
    </svg>
  )
}

/* ═══════════════════════════ PAGE COMPONENT ════════════════════════════ */

export default function Services() {
  /* ── Hero parallax ── */
  const heroRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springCfg = { damping: 25, stiffness: 150 }
  const sx = useSpring(mouseX, springCfg)
  const sy = useSpring(mouseY, springCfg)
  const carX = useTransform(sx, [-1, 1], [-10, 10])
  const carY = useTransform(sy, [-1, 1], [-6, 6])

  const onMouseMove = useCallback((e) => {
    const el = heroRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mouseX.set((e.clientX - (r.left + r.width / 2)) / (r.width / 2))
    mouseY.set((e.clientY - (r.top + r.height / 2)) / (r.height / 2))
  }, [mouseX, mouseY])

  const onMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  /* ── Testimonial carousel ── */
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  /* ── FAQ accordion ── */
  const [openFaq, setOpenFaq] = useState(null)

  /* ── Service Providers sort ── */
  const [activeSort, setActiveSort] = useState('recommended')

  const sortedGarages = [...GARAGES].sort((a, b) => {
    switch (activeSort) {
      case 'price_low':
        return parseInt(a.price.replace(/[₹,]/g, '')) - parseInt(b.price.replace(/[₹,]/g, ''))
      case 'rating':
        return b.rating - a.rating
      case 'nearest':
        return parseFloat(a.distance) - parseFloat(b.distance)
      case 'fastest':
        return parseInt(a.duration) - parseInt(b.duration)
      case 'today':
        return (a.availability.includes('Today') ? 0 : 1) - (b.availability.includes('Today') ? 0 : 1)
      default:
        return 0
    }
  })

  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes svc-blob-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(35px, -25px) scale(1.06); }
          66% { transform: translate(-22px, 18px) scale(0.94); }
        }
        @keyframes svc-blob-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-28px, 22px) scale(0.94); }
          66% { transform: translate(18px, -28px) scale(1.08); }
        }
        @keyframes svc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes svc-car-sway {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        @keyframes svc-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(15,138,109,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(15,138,109,0); }
        }
        @keyframes svc-shape-float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(8deg); }
        }
        @keyframes svc-shape-float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-6deg); }
        }
        @keyframes svc-shape-float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-25px) rotate(12deg) scale(1.1); }
        }
        .svc-blob-a { animation: svc-blob-a 18s ease-in-out infinite; }
        .svc-blob-b { animation: svc-blob-b 22s ease-in-out infinite; }
        .svc-float { animation: svc-float 4s ease-in-out infinite; }
        .svc-car-sway { animation: svc-car-sway 6s ease-in-out infinite; }
        .svc-pulse { animation: svc-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(168deg, var(--bg) 0%, var(--surface) 40%, var(--accent-light) 100%)' }}
      >
        <div
          className="svc-blob-a pointer-events-none absolute -top-36 -right-36 w-[520px] h-[520px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, var(--accent-mid) 0%, transparent 70%)', filter: 'blur(65px)' }}
        />
        <div
          className="svc-blob-b pointer-events-none absolute -bottom-28 -left-28 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent-header) 0%, transparent 70%)', filter: 'blur(55px)' }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-mid bg-accent-light px-4 py-1.5 text-xs font-semibold text-primary-deep">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  50+ Services Available
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-content"
              >
                Professional Car Care{' '}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Services
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
                className="mt-4 text-lg font-medium text-content-secondary"
              >
                Choose from trusted car care services provided by verified garages near you.
              </motion.p>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
                className="mt-2 text-[15px] leading-relaxed text-content-muted max-w-md"
              >
                Book premium services with transparent pricing, verified garages and real-time booking.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-3 mt-8"
              >
                <a href="#services-categories">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="gap-2 rounded-xl svc-pulse">
                      Browse Services <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </a>
                <Link to="/customer/garages">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="secondary" size="lg" className="gap-2 rounded-xl">
                      <MapPin className="h-4 w-4" /> Find Garages
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-wrap gap-x-5 gap-y-2 mt-8"
              >
                {[
                  { Icon: Shield, text: 'Verified Garages' },
                  { Icon: Eye, text: 'Transparent Pricing' },
                  { Icon: Zap, text: 'Real-time Booking' },
                ].map(({ Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-[13px] font-medium text-content-secondary">
                    <Icon className="h-4 w-4 text-primary" /> {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <motion.div className="relative w-full max-w-[440px] svc-car-sway" style={{ x: carX, y: carY }}>
                <div
                  className="rounded-3xl p-8 sm:p-10"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-light) 0%, rgba(255,255,255,0.6) 100%)',
                    border: '1px solid var(--border-hairline)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 24px 64px rgba(15,138,109,0.12), var(--shadow-card)',
                  }}
                >
                  <LuxuryCarSVG />
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -24, y: 12 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.55 }}
                  className="absolute -left-8 top-6 rounded-2xl border border-hairline bg-surface px-4 py-3 svc-float"
                  style={{ boxShadow: 'var(--shadow-pop)', animationDelay: '0s' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Services Booked</p>
                  <p className="text-2xl font-extrabold text-primary mt-0.5">2,400+</p>
                  <p className="text-[11px] text-content-muted">this month</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20, y: -12 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.55 }}
                  className="absolute -right-4 top-4 flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-2 svc-float"
                  style={{ boxShadow: 'var(--shadow-soft)', animationDelay: '0.5s' }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-content ml-0.5">4.9</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20, y: -8 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.05, duration: 0.5 }}
                  className="absolute -right-6 bottom-10 flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 svc-float"
                  style={{ boxShadow: 'var(--shadow-pop)', animationDelay: '1s' }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">Booking Confirmed</p>
                    <p className="text-sm font-bold text-content">Bay 3 · 2:00 PM</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 2. SEARCH BAR ═══════════════════ */}
      <section className="relative z-10 -mt-10 mb-8 px-5 sm:px-8">
        <FadeUp>
          <div className="mx-auto max-w-4xl">
            <div
              className="rounded-2xl border border-hairline bg-surface/80 backdrop-blur-xl p-4 sm:p-5 transition-shadow duration-300 hover:shadow-pop"
              style={{ boxShadow: '0 12px 48px rgba(15,138,109,0.12), var(--shadow-card)' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { Icon: MapPin, placeholder: 'Enter your location', label: 'Location' },
                  { Icon: Car, placeholder: 'Service category', label: 'Service' },
                  { Icon: Calendar, placeholder: 'Preferred date', label: 'Date' },
                ].map(({ Icon, placeholder, label }) => (
                  <div key={label} className="group relative">
                    <div className="flex items-center gap-2.5 rounded-xl border border-hairline bg-background px-4 py-3.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <Icon className="h-[18px] w-[18px] shrink-0 text-primary" />
                      <input
                        type="text"
                        placeholder={placeholder}
                        aria-label={label}
                        className="flex-1 bg-transparent text-sm text-content outline-none placeholder:text-content-muted"
                      />
                    </div>
                  </div>
                ))}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="w-full h-full min-h-[50px] gap-2 rounded-xl text-sm font-semibold">
                    <Search className="h-4 w-4" /> Search
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══════════════════ 3. SERVICE CATEGORIES ═══════════════════ */}
      <section id="services-categories" className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>Service Categories</SectionLabel>
              <SectionHeading>Explore Our Full Range</SectionHeading>
              <SectionDesc>From quick washes to complete detailing — find exactly what your car needs.</SectionDesc>
            </div>
          </FadeUp>

          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <FadeUp key={cat.name} delay={i * 0.05}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group cursor-pointer rounded-2xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-pop"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: cat.bg }}>
                      <Icon className="h-6 w-6" style={{ color: cat.color }} />
                    </div>
                    <h3 className="text-[15px] font-bold text-content">{cat.name}</h3>
                    <p className="mt-1 text-[13px] text-content-muted leading-relaxed">{cat.desc}</p>
                    <p className="mt-3 text-xs font-semibold text-primary">{cat.count} services available</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>

          <div className="sm:hidden flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <div key={cat.name} className="snap-start shrink-0 w-[200px] rounded-2xl border border-hairline bg-surface p-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: cat.bg }}>
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-[14px] font-bold text-content">{cat.name}</h3>
                  <p className="mt-1 text-[12px] text-content-muted leading-relaxed">{cat.desc}</p>
                  <p className="mt-2 text-[11px] font-semibold text-primary">{cat.count} services</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 4. POPULAR SERVICES ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel><Star className="h-3.5 w-3.5" /> Most Popular</SectionLabel>
              <SectionHeading>Services Customers Love</SectionHeading>
              <SectionDesc>Top-rated services booked by thousands of car owners every month.</SectionDesc>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POPULAR_SERVICES.map((svc, i) => {
              const Icon = svc.icon
              return (
                <FadeUp key={svc.name} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="group flex flex-col rounded-2xl border border-hairline bg-surface overflow-hidden transition-shadow hover:shadow-pop h-full"
                  >
                    <div className="relative px-5 pt-5 pb-8 overflow-hidden" style={{ background: svc.bg }}>
                      <motion.div className="absolute top-4 right-4 opacity-15 group-hover:opacity-25 transition-opacity" whileHover={{ rotate: 12, scale: 1.1 }}>
                        <Icon className="h-16 w-16" style={{ color: svc.color }} />
                      </motion.div>
                      <div className="flex items-center gap-1.5 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={cn('h-3 w-3', j < Math.floor(svc.rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-200 text-amber-200')} />
                        ))}
                        <span className="text-[11px] font-bold text-content ml-1">{svc.rating}</span>
                        <span className="text-[11px] text-content-muted">({svc.reviews.toLocaleString()})</span>
                      </div>
                      <h3 className="text-[16px] font-bold text-content relative z-10">{svc.name}</h3>
                    </div>

                    <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-xs font-medium text-content-muted">
                          <Clock className="h-3 w-3" /> {svc.duration}
                        </span>
                        <span className="text-xs text-content-muted">•</span>
                        <span className="text-sm font-extrabold text-primary">{svc.price}</span>
                      </div>
                      <p className="text-[13px] text-content-secondary leading-relaxed mb-4">{svc.desc}</p>
                      <div className="space-y-1.5 mb-5 flex-1">
                        {svc.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-[12px] text-content-secondary">
                            <CheckCircle className="h-3 w-3 text-primary shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                      <Link to="/customer/garages" className="block">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="secondary" size="sm" className="w-full gap-1.5 rounded-xl group-hover:bg-accent-light group-hover:border-primary group-hover:text-primary transition-all">
                            Book Now <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5. SERVICE PROVIDERS (Marketplace) ═══════════════════ */}
      <section id="service-providers" className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>
                <BadgeCheck className="h-3.5 w-3.5" /> Service Providers
              </SectionLabel>
              <SectionHeading>Compare Verified Garages</SectionHeading>
              <SectionDesc>
                Compare verified garages offering this service and choose the one that best fits your needs.
              </SectionDesc>
            </div>
          </FadeUp>

          {/* ── Service Header Card ── */}
          <FadeUp delay={0.05}>
            <div
              className="rounded-2xl border border-hairline bg-surface overflow-hidden mb-8"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Left: Illustration */}
                <div
                  className="sm:w-[280px] lg:w-[340px] shrink-0 flex items-center justify-center p-8 sm:p-10 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--accent-light) 0%, #d1fae5 100%)' }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-current" style={{ color: 'var(--primary)' }} />
                    <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full border-2 border-current" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="relative flex flex-col items-center gap-3">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(15,138,109,0.15)', backdropFilter: 'blur(8px)' }}
                    >
                      <FEATURED_SERVICE.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-surface/80 backdrop-blur-sm px-3 py-1 border border-hairline">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={cn('h-3 w-3', j < Math.floor(FEATURED_SERVICE.rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-200 text-amber-200')} />
                      ))}
                      <span className="text-[11px] font-bold text-content ml-0.5">{FEATURED_SERVICE.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl sm:text-[28px] font-extrabold text-content tracking-tight">
                    {FEATURED_SERVICE.name}
                  </h3>
                  <p className="mt-3 text-[15px] text-content-secondary leading-relaxed">
                    {FEATURED_SERVICE.desc}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-content-muted uppercase tracking-wider">Rating</p>
                        <p className="text-sm font-bold text-content">{FEATURED_SERVICE.rating} / 5.0</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-content-muted uppercase tracking-wider">Booked</p>
                        <p className="text-sm font-bold text-content">{FEATURED_SERVICE.totalBookings} times</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-content-muted uppercase tracking-wider">Avg. Duration</p>
                        <p className="text-sm font-bold text-content">{FEATURED_SERVICE.avgDuration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── Sort / Filter Chips ── */}
          <FadeUp delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-6">
              {SORT_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.key}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSort(opt.key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[13px] font-semibold transition-all border',
                    activeSort === opt.key
                      ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                      : 'bg-surface text-content-secondary border-hairline hover:border-control hover:text-content'
                  )}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </FadeUp>

          {/* ── Garage Cards ── */}
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {sortedGarages.map((garage, i) => (
                <motion.div
                  key={garage.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="group rounded-2xl border border-hairline bg-surface overflow-hidden transition-shadow hover:shadow-pop"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Cover / Logo area */}
                      <div
                        className="lg:w-[260px] shrink-0 relative overflow-hidden"
                        style={{ background: garage.coverGradient }}
                      >
                        {/* Decorative circles */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-[3px]" style={{ borderColor: garage.color }} />
                          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full border-2" style={{ borderColor: garage.color }} />
                        </div>

                        <div className="flex lg:flex-col items-center lg:items-center gap-4 p-6 sm:p-7 lg:py-10 relative z-10">
                          {/* Logo */}
                          <div
                            className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-xl lg:text-2xl font-extrabold text-white shrink-0"
                            style={{ background: `linear-gradient(135deg, ${garage.color}, ${garage.color}cc)`, boxShadow: `0 8px 24px ${garage.color}33` }}
                          >
                            {garage.initials}
                          </div>

                          <div className="lg:text-center">
                            <div className="flex items-center gap-2 lg:justify-center">
                              <h3 className="text-lg font-bold text-content">{garage.name}</h3>
                              {garage.verified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                  <BadgeCheck className="h-3 w-3" /> Verified
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1.5 mt-1.5 lg:justify-center">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className={cn('h-3.5 w-3.5', j < Math.floor(garage.rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-200 text-amber-200')} />
                              ))}
                              <span className="text-xs font-bold text-content ml-0.5">{garage.rating}</span>
                              <span className="text-xs text-content-muted">({garage.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info area */}
                      <div className="flex-1 p-6 sm:p-7">
                        <div className="flex flex-col h-full">
                          {/* Meta row */}
                          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
                            <span className="flex items-center gap-1.5 text-[13px] text-content-secondary">
                              <Navigation className="h-3.5 w-3.5 text-primary" /> {garage.distance}
                            </span>
                            <span className="flex items-center gap-1.5 text-[13px] text-content-secondary">
                              <Clock className="h-3.5 w-3.5 text-primary" /> {garage.duration}
                            </span>
                            <span className="flex items-center gap-1.5 text-[13px] font-bold text-content">
                              <CreditCard className="h-3.5 w-3.5 text-primary" />
                              <span>Starts from </span>
                              <span className="text-primary text-[15px]">{garage.price}</span>
                            </span>
                          </div>

                          {/* Availability */}
                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold',
                                garage.availability.includes('Today')
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              )}
                            >
                              <CalendarClock className="h-3 w-3" />
                              {garage.availability} • {garage.slot}
                            </span>
                          </div>

                          {/* Highlights */}
                          <div className="mb-5">
                            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">Includes</p>
                            <div className="flex flex-wrap gap-2">
                              {garage.highlights.map((h) => (
                                <span key={h} className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-hairline px-2.5 py-1.5 text-[12px] font-medium text-content-secondary">
                                  <CheckCircle className="h-3 w-3 text-primary shrink-0" /> {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-hairline">
                            <Link to="/customer/garages" className="flex-1 sm:flex-none">
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button variant="secondary" size="sm" className="w-full sm:w-auto gap-1.5 rounded-xl">
                                  <ExternalLink className="h-3.5 w-3.5" /> View Details
                                </Button>
                              </motion.div>
                            </Link>
                            <Link to="/customer/garages" className="flex-1 sm:flex-none">
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button size="sm" className="w-full sm:w-auto gap-1.5 rounded-xl">
                                  Book Now <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* View All Garages */}
          <FadeUp delay={0.15}>
            <div className="text-center mt-10">
              <Link to="/customer/garages">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="secondary" size="lg" className="gap-2 rounded-xl px-10">
                    View All Garages <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ 6. WHY CHOOSE AUTOSPA ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface">
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
                    className="group rounded-2xl border border-hairline bg-background p-6 sm:p-7 transition-shadow hover:shadow-card"
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

      {/* ═══════════════════ 7. BOOKING PROCESS ═══════════════════ */}
      <section className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionLabel>How It Works</SectionLabel>
              <SectionHeading>Book in 5 Simple Steps</SectionHeading>
              <SectionDesc>From browsing to completion — the entire process takes less than 60 seconds to start.</SectionDesc>
            </div>
          </FadeUp>

          <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-4">
            <div
              className="hidden sm:block absolute top-[28px] left-[calc(10%+24px)] right-[calc(10%+24px)] h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--accent-header), var(--accent-mid), var(--accent-header))', borderRadius: 2 }}
            />
            {BOOKING_STEPS.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center relative">
                  <div
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-[15px] font-extrabold text-primary-foreground mb-5"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', boxShadow: '0 4px 16px rgba(15,138,109,0.3)' }}
                  >
                    {String(step.step).padStart(2, '0')}
                  </div>
                  <h3 className="text-[15px] font-bold text-content">{step.title}</h3>
                  <p className="mt-2 text-[13px] text-content-muted leading-relaxed max-w-[180px]">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 8. TESTIMONIALS ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-surface overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel><MessageSquare className="h-3.5 w-3.5" /> Customer Reviews</SectionLabel>
              <SectionHeading>What Our Customers Say</SectionHeading>
              <SectionDesc>Real reviews from verified customers who trust AutoSpa for their car care needs.</SectionDesc>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="relative max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                {TESTIMONIALS.map((t, i) =>
                  i === activeTestimonial ? (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-2xl border border-hairline bg-background p-8 sm:p-10"
                      style={{ boxShadow: 'var(--shadow-card)' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` }}
                        >
                          {t.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={cn('h-4 w-4', j < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                            ))}
                          </div>
                          <p className="text-[15px] text-content leading-relaxed italic">"{t.review}"</p>
                          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <p className="text-sm font-bold text-content">{t.name}</p>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-content-muted" />
                            <p className="text-xs text-content-muted">
                              {t.service} at <span className="font-medium text-content-secondary">{t.garage}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center gap-2 mt-6">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={cn(
                      'transition-all duration-300 rounded-full',
                      i === activeTestimonial ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-content-muted/30 hover:bg-content-muted/50'
                    )}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>

              <div className="hidden sm:flex items-center justify-between absolute -left-14 -right-14 top-1/2 -translate-y-1/2 pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTestimonial((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="pointer-events-auto w-10 h-10 rounded-full border border-hairline bg-surface flex items-center justify-center text-content-muted hover:text-content hover:shadow-card transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length)}
                  className="pointer-events-auto w-10 h-10 rounded-full border border-hairline bg-surface flex items-center justify-center text-content-muted hover:text-content hover:shadow-card transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ 9. FAQ ═══════════════════ */}
      <section className="py-20 sm:py-24" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <SectionLabel>FAQ</SectionLabel>
              <SectionHeading>Frequently Asked Questions</SectionHeading>
              <SectionDesc>Everything you need to know before booking your first service.</SectionDesc>
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
                    <span className="text-[15px] font-semibold text-content pr-4">{faq.question}</span>
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
                          <p className="text-[14px] text-content-secondary leading-relaxed">{faq.answer}</p>
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

          <div
            className="absolute top-8 left-[10%] w-20 h-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'svc-shape-float-1 7s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-12 right-[15%] w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'svc-shape-float-2 9s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 right-[8%] w-12 h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'svc-shape-float-3 6s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-6 left-[25%] w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: 'svc-shape-float-1 8s ease-in-out 1s infinite' }}
          />

          <div className="relative mx-auto max-w-4xl px-8 py-16 sm:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-200 mb-4">
                <Zap className="h-4 w-4" /> Limited slots available today
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-tight"
            >
              Ready to Give Your Car{' '}<br className="hidden sm:block" />Premium Care?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-[17px] text-emerald-100/80 max-w-lg mx-auto"
            >
              Join 20,000+ car owners who trust AutoSpa for professional, hassle-free car care.
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
              <Link to="/customer/garages">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/25 text-[15px] font-semibold text-white hover:bg-white/10 transition-colors">
                    <MapPin className="h-4 w-4" /> Find Nearby Garages
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
