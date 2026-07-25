// import { useEffect, useRef, useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import { AnimatePresence, motion, useInView } from 'framer-motion'
// import {
//   Menu, X, MapPin, Calendar, Car, ArrowRight,
//   ChevronRight, Star, Shield, Clock, Zap,
//   Droplets, Wrench, Sparkles, CheckCircle,
//   Twitter, Instagram, Youtube, Phone, Mail,
//   Eye, EyeOff,
// } from 'lucide-react'
// import PageTransition from './PageTransition.jsx'
// import { cn } from '../lib/utils.js'

// /* ─────────────────────────────── data ─────────────────────────────── */
// /* NOTE: Pricing intentionally excluded from nav per requirements */

// const NAV = [
//   { label: 'Services', to: '#services' },
//   { label: 'Garages', to: '#garages' },
//   { label: 'How it works', to: '#how' },
// ]

// const SERVICES = [
//   { icon: Droplets, label: 'Foam Wash', price: '₹299', time: '30 min', color: '#d1fae5', accent: '#059669' },
//   { icon: Sparkles, label: 'Full Detail', price: '₹999', time: '2 hrs', color: '#dbeafe', accent: '#2563eb' },
//   { icon: Wrench, label: 'Oil Change', price: '₹599', time: '45 min', color: '#fef3c7', accent: '#d97706' },
//   { icon: Shield, label: 'Ceramic Coat', price: '₹3499', time: '1 day', color: '#f3e8ff', accent: '#7c3aed' },
// ]

// const STATS = [
//   { value: '12K+', label: 'Happy customers' },
//   { value: '340+', label: 'Garages listed' },
//   { value: '4.9', label: 'Average rating' },
//   { value: '98%', label: 'On-time completion' },
// ]

// const HOW = [
//   { step: '01', title: 'Pick a service', desc: 'Choose from wash, detail, oil change, tyre rotation and more.' },
//   { step: '02', title: 'Select a slot', desc: 'See live bay availability and book the time that suits you.' },
//   { step: '03', title: 'Drop your car', desc: 'Arrive, hand over your keys — our team takes it from there.' },
//   { step: '04', title: 'Track in real time', desc: "Watch your bay status and get notified the moment it's ready." },
// ]

// const FOOTER_LINKS = {
//   Product: ['Services', 'Garages', 'Pricing', 'Mobile app'],
//   Company: ['About', 'Careers', 'Blog', 'Press'],
//   Legal: ['Privacy Policy', 'Terms', 'Cookies', 'Licenses'],
// }

// const SOCIALS = [
//   { Icon: Twitter, label: 'Twitter' },
//   { Icon: Instagram, label: 'Instagram' },
//   { Icon: Youtube, label: 'YouTube' },
// ]

// /* ─────────────────────── helpers ─────────────────────── */

// function useScrolled(threshold = 12) {
//   const [scrolled, setScrolled] = useState(false)
//   useEffect(() => {
//     const h = () => setScrolled(window.scrollY > threshold)
//     h(); window.addEventListener('scroll', h, { passive: true })
//     return () => window.removeEventListener('scroll', h)
//   }, [threshold])
//   return scrolled
// }

// function FadeUp({ children, delay = 0, className }) {
//   const ref = useRef(null)
//   const inView = useInView(ref, { once: true, margin: '-60px' })
//   return (
//     <motion.div
//       ref={ref}
//       className={className}
//       initial={{ opacity: 0, y: 28 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
//     >
//       {children}
//     </motion.div>
//   )
// }

// /* ─────────────────────── Auth Modal ─────────────────────── */

// function AuthModal({ mode, onClose, onSwitch }) {
//   const [showPw, setShowPw] = useState(false)
//   const isLogin = mode === 'login'

//   // Close on backdrop click
//   const handleBackdrop = (e) => {
//     if (e.target === e.currentTarget) onClose()
//   }

//   // Close on Escape key
//   useEffect(() => {
//     const onKey = (e) => { if (e.key === 'Escape') onClose() }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [onClose])

//   // Prevent body scroll when open
//   useEffect(() => {
//     const prevOverflow = document.body.style.overflow
//     document.body.style.overflow = 'hidden'
//     return () => { document.body.style.overflow = prevOverflow }
//   }, [])

//   return (
//     <motion.div
//       className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto px-4 py-8"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={handleBackdrop}
//     >
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0"
//         style={{ background: 'rgba(3,20,12,.65)', backdropFilter: 'blur(6px)' }}
//       />

//       {/* Modal card */}
//       <motion.div
//         className="relative w-full max-w-[420px] my-auto rounded-3xl overflow-hidden"
//         initial={{ opacity: 0, scale: 0.92, y: 24 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.92, y: 24 }}
//         transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
//         style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }}
//       >
//         {/* Green top strip */}
//         <div
//           className="px-8 pt-8 pb-6"
//           style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}
//         >
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
//                 <Car className="w-4 h-4 text-white" />
//               </div>
//               <span className="text-white font-bold text-[17px]">AutoSpa</span>
//             </div>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
//               aria-label="Close"
//             >
//               <X className="w-4 h-4 text-white" />
//             </button>
//           </div>

//           <h2 className="text-[26px] font-black text-white leading-tight">
//             {isLogin ? 'Welcome back 👋' : 'Create account ✨'}
//           </h2>
//           <p className="text-white/70 text-[14px] mt-1">
//             {isLogin
//               ? 'Log in to manage your bookings.'
//               : 'Join 12,000+ drivers on AutoSpa.'}
//           </p>
//         </div>

//         {/* Form body */}
//         <div className="px-8 py-7">
//           <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">

//             {/* Full name — signup only */}
//             {!isLogin && (
//               <div>
//                 <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
//                   Full name
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Nayan Sharma"
//                   className="w-full px-4 py-3 rounded-xl text-[14px] text-gray-800 outline-none transition-all"
//                   style={{
//                     background: '#f8faf9',
//                     border: '1.5px solid #e5e7eb',
//                   }}
//                   onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,.1)' }}
//                   onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
//                 />
//               </div>
//             )}

//             {/* Email */}
//             <div>
//               <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
//                 Email address
//               </label>
//               <input
//                 type="email"
//                 placeholder="you@email.com"
//                 className="w-full px-4 py-3 rounded-xl text-[14px] text-gray-800 outline-none transition-all"
//                 style={{ background: '#f8faf9', border: '1.5px solid #e5e7eb' }}
//                 onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,.1)' }}
//                 onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPw ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] text-gray-800 outline-none transition-all"
//                   style={{ background: '#f8faf9', border: '1.5px solid #e5e7eb' }}
//                   onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,.1)' }}
//                   onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPw(p => !p)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//               {isLogin && (
//                 <div className="text-right mt-1.5">
//                   <button type="button" className="text-[12px] font-semibold" style={{ color: '#059669' }}>
//                     Forgot password?
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2 mt-1 transition-opacity hover:opacity-90 active:scale-[.98]"
//               style={{
//                 background: 'linear-gradient(135deg,#059669,#047857)',
//                 boxShadow: '0 4px 16px rgba(5,150,105,.35)',
//               }}
//             >
//               {isLogin ? 'Log in to AutoSpa' : 'Create my account'}
//               <ArrowRight className="w-4 h-4" />
//             </button>

//             {/* Divider */}
//             <div className="flex items-center gap-3">
//               <div className="flex-1 h-px bg-gray-100" />
//               <span className="text-[12px] text-gray-400 font-medium">or continue with</span>
//               <div className="flex-1 h-px bg-gray-100" />
//             </div>

//             {/* Google */}
//             <button
//               type="button"
//               className="w-full py-3 rounded-xl border text-[14px] font-semibold text-gray-700 flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-colors"
//               style={{ border: '1.5px solid #e5e7eb' }}
//             >
//               <svg className="w-4 h-4" viewBox="0 0 24 24">
//                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//               </svg>
//               Continue with Google
//             </button>
//           </form>

//           {/* Switch mode */}
//           <p className="text-center text-[13px] text-gray-500 mt-5">
//             {isLogin ? "Don't have an account? " : 'Already have an account? '}
//             <button
//               onClick={onSwitch}
//               className="font-bold hover:underline"
//               style={{ color: '#059669' }}
//             >
//               {isLogin ? 'Sign up free' : 'Log in'}
//             </button>
//           </p>
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }

// /* ═══════════════════════════ MAIN LAYOUT ════════════════════════════ */

// export default function PublicLayout() {
//   const scrolled = useScrolled()
//   const [drawer, setDrawer] = useState(false)
//   const [authMode, setAuthMode] = useState(null) // 'login' | 'signup' | null
//   const [email, setEmail] = useState('')
//   const [subDone, setSubDone] = useState(false)
//   const location = useLocation()

//   useEffect(() => setDrawer(false), [location.pathname])

//   const openLogin = () => { setDrawer(false); setAuthMode('login') }
//   const openSignup = () => { setDrawer(false); setAuthMode('signup') }
//   const closeAuth = () => setAuthMode(null)
//   const switchAuth = () => setAuthMode(m => m === 'login' ? 'signup' : 'login')

//   const handleSubscribe = (e) => {
//     e.preventDefault()
//     if (email) { setSubDone(true); setEmail('') }
//   }

//   return (
//     <div className="flex min-h-screen flex-col" style={{ fontFamily: "'Inter', sans-serif", background: '#f8faf9' }}>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

//         .as-nav-link { position:relative; }
//         .as-nav-link::after {
//           content:''; position:absolute; left:0; bottom:-2px;
//           width:0; height:2px; border-radius:2px;
//           background:#059669; transition:width .25s ease;
//         }
//         .as-nav-link:hover::after { width:100%; }

//         .as-service-card { transition: transform .2s ease, box-shadow .2s ease; }
//         .as-service-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(5,150,105,.13); }

//         .as-stat-count {
//           background: linear-gradient(135deg,#059669,#047857);
//           -webkit-background-clip:text; -webkit-text-fill-color:transparent;
//         }

//         .as-hero-blob {
//           position:absolute; border-radius:50%; filter:blur(72px); opacity:.35; pointer-events:none;
//         }

//         .as-search-bar { box-shadow:0 8px 40px rgba(5,150,105,.18), 0 2px 8px rgba(0,0,0,.07); }

//         @keyframes float {
//           0%,100%{ transform:translateY(0) rotate(-1deg); }
//           50%     { transform:translateY(-10px) rotate(1deg); }
//         }
//         .as-float { animation:float 5s ease-in-out infinite; }

//         .as-badge-pill {
//           display:inline-flex; align-items:center; gap:6px;
//           background:linear-gradient(135deg,#d1fae5,#a7f3d0);
//           color:#065f46; border:1px solid #6ee7b7;
//           padding:6px 14px; border-radius:999px;
//           font-size:13px; font-weight:600; letter-spacing:.01em;
//         }

//         .as-drawer-item { transition: background .15s, color .15s; }
//         .as-drawer-item:hover { background:#ecfdf5; color:#059669; }
//       `}</style>

//       {/* ══════════════════ NAVBAR ══════════════════ */}
//       <header
//         className={cn(
//           'fixed inset-x-0 top-0 z-50 transition-all duration-300',
//           scrolled
//             ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm'
//             : 'bg-white border-b border-transparent'
//         )}
//       >
//         <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">

//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2.5 shrink-0">
//             <div
//               className="w-8 h-8 rounded-lg flex items-center justify-center"
//               style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
//             >
//               <Car className="w-4 h-4 text-white" />
//             </div>
//             <span className="text-[17px] font-bold tracking-tight text-gray-900">
//               Auto<span style={{ color: '#059669' }}>Spa</span>
//             </span>
//           </Link>

//           {/* Desktop nav — Pricing intentionally omitted */}
//           <nav className="hidden md:flex items-center gap-7">
//             {NAV.map(item => (
//               <a
//                 key={item.label}
//                 href={item.to}
//                 className="as-nav-link text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors pb-0.5"
//               >
//                 {item.label}
//               </a>
//             ))}
//           </nav>

//           {/* Desktop CTAs — open modals */}
//           <div className="hidden md:flex items-center gap-3">
//             <button
//               onClick={openLogin}
//               className="text-[14px] font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
//             >
//               Log in
//             </button>
//             <button
//               onClick={openSignup}
//               className="flex items-center gap-1.5 text-[14px] font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
//               style={{
//                 background: 'linear-gradient(135deg,#059669,#047857)',
//                 boxShadow: '0 2px 12px rgba(5,150,105,.35)',
//               }}
//             >
//               Get started <ArrowRight className="w-3.5 h-3.5" />
//             </button>
//           </div>

//           {/* Mobile hamburger */}
//           <button
//             onClick={() => setDrawer(true)}
//             className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
//             aria-label="Open menu"
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//         </div>
//       </header>

//       {/* ══════════════════ MOBILE DRAWER ══════════════════ */}
//       <AnimatePresence>
//         {drawer && (
//           <motion.div
//             className="fixed inset-0 z-[100] md:hidden"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="absolute inset-0"
//               style={{ background: 'rgba(3,30,20,.55)', backdropFilter: 'blur(4px)' }}
//               onClick={() => setDrawer(false)}
//             />
//             <motion.aside
//               className="absolute right-0 top-0 h-full w-[300px] flex flex-col bg-white shadow-2xl"
//               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
//               transition={{ type: 'tween', duration: 0.26 }}
//             >
//               {/* Drawer header */}
//               <div
//                 className="flex items-center justify-between px-5 py-4"
//                 style={{ background: 'linear-gradient(135deg,#065f46,#047857)' }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
//                     <Car className="w-4 h-4 text-white" />
//                   </div>
//                   <span className="text-white font-bold text-[16px]">AutoSpa</span>
//                 </div>
//                 <button
//                   onClick={() => setDrawer(false)}
//                   className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Nav links */}
//               <nav className="flex flex-col gap-0.5 p-3 pt-4">
//                 {NAV.map(item => (
//                   <a
//                     key={item.label}
//                     href={item.to}
//                     onClick={() => setDrawer(false)}
//                     className="as-drawer-item flex items-center justify-between px-3 py-3 rounded-xl text-[14px] font-medium text-gray-700"
//                   >
//                     {item.label}
//                     <ChevronRight className="w-4 h-4 text-gray-400" />
//                   </a>
//                 ))}
//               </nav>

//               {/* Contact card */}
//               <div
//                 className="mx-3 mt-2 rounded-xl p-4"
//                 style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
//               >
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 mb-2">Need help?</p>
//                 <p className="text-[13px] text-gray-600 flex items-center gap-2">
//                   <Mail className="w-3.5 h-3.5 text-emerald-600" /> support@autospa.app
//                 </p>
//                 <p className="text-[13px] text-gray-600 flex items-center gap-2 mt-1">
//                   <Clock className="w-3.5 h-3.5 text-emerald-600" /> Mon–Sun, 8 am – 8 pm
//                 </p>
//               </div>

//               {/* Drawer CTAs — open modals */}
//               <div className="mt-auto p-4 flex flex-col gap-2.5">
//                 <button
//                   onClick={openLogin}
//                   className="w-full py-2.5 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Log in
//                 </button>
//                 <button
//                   onClick={openSignup}
//                   className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
//                   style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
//                 >
//                   Get started free <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </motion.aside>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ══════════════════ AUTH MODAL (centered on screen) ══════════════════ */}
//       <AnimatePresence>
//         {authMode && (
//           <AuthModal
//             mode={authMode}
//             onClose={closeAuth}
//             onSwitch={switchAuth}
//           />
//         )}
//       </AnimatePresence>

//       {/* ══════════════════ MAIN ══════════════════ */}
//       <main className="flex-1 pt-[68px]">

//         {/* ── HERO ── */}
//         <section
//           className="relative overflow-hidden"
//           style={{ background: 'linear-gradient(160deg,#f0fdf4 0%,#ffffff 55%,#ecfdf5 100%)' }}
//         >
//           <div className="as-hero-blob w-[480px] h-[480px] top-[-80px] right-[-80px]" style={{ background: '#6ee7b7' }} />
//           <div className="as-hero-blob w-[320px] h-[320px] bottom-[40px] left-[-60px]" style={{ background: '#a7f3d0' }} />

//           <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">

//             {/* Left */}
//             <div>
//               <motion.div
//                 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: .5, delay: .05 }}
//               >
//                 <span className="as-badge-pill">
//                   <Sparkles className="w-3.5 h-3.5" /> Premium Car Care, On Demand
//                 </span>
//               </motion.div>

//               <motion.h1
//                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: .55, delay: .15, ease: [.22, 1, .36, 1] }}
//                 className="mt-6 text-[48px] sm:text-[58px] font-black leading-[1.08] tracking-tight text-gray-900"
//               >
//                 Your car deserves<br />
//                 <span style={{
//                   background: 'linear-gradient(135deg,#059669,#047857)',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                 }}>
//                   the best care.
//                 </span>
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: .5, delay: .25 }}
//                 className="mt-5 text-[17px] leading-relaxed text-gray-500 max-w-[480px]"
//               >
//                 Book trusted washing and garage services in seconds. Real-time bay tracking, live ETA, zero hassle.
//               </motion.p>

//               <motion.div
//                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                 transition={{ duration: .5, delay: .35 }}
//                 className="flex flex-wrap gap-3 mt-6"
//               >
//                 {['Verified garages', 'Live tracking', 'Instant confirmation'].map(t => (
//                   <span key={t} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
//                     <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} /> {t}
//                   </span>
//                 ))}
//               </motion.div>

//               {/* Search bar */}
//               <motion.div
//                 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: .6, delay: .4, ease: [.22, 1, .36, 1] }}
//                 className="as-search-bar bg-white rounded-2xl mt-10 p-2"
//               >
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   {[
//                     { Icon: MapPin, ph: 'Your location' },
//                     { Icon: Car, ph: 'Service type' },
//                     { Icon: Calendar, ph: 'Pick a date' },
//                   ].map(({ Icon, ph }) => (
//                     <div key={ph} className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
//                       <Icon className="w-4 h-4 shrink-0" style={{ color: '#059669' }} />
//                       <input
//                         placeholder={ph}
//                         className="text-[14px] text-gray-700 placeholder:text-gray-400 bg-transparent outline-none w-full"
//                       />
//                     </div>
//                   ))}
//                   <button
//                     className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shrink-0"
//                     style={{
//                       background: 'linear-gradient(135deg,#059669,#047857)',
//                       boxShadow: '0 2px 14px rgba(5,150,105,.4)',
//                     }}
//                   >
//                     Search <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Right — floating cards */}
//             <motion.div
//               initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: .65, delay: .3, ease: [.22, 1, .36, 1] }}
//               className="hidden lg:flex justify-center items-center"
//             >
//               <div className="relative w-full max-w-[420px]">
//                 <div
//                   className="as-float w-full aspect-[4/3] rounded-3xl flex items-center justify-center"
//                   style={{
//                     background: 'linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)',
//                     border: '1.5px solid #6ee7b7',
//                     boxShadow: '0 24px 64px rgba(5,150,105,.18)',
//                   }}
//                 >
//                   <Car className="w-28 h-28 opacity-30" style={{ color: '#059669' }} />
//                 </div>

//                 {/* Booking confirmed badge */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
//                   transition={{ delay: .7, duration: .5 }}
//                   className="absolute -left-8 top-8 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
//                   style={{ boxShadow: '0 8px 32px rgba(0,0,0,.12)', border: '1px solid #f0fdf4' }}
//                 >
//                   <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#d1fae5' }}>
//                     <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
//                   </div>
//                   <div>
//                     <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Booking confirmed</p>
//                     <p className="text-[14px] font-bold text-gray-800">Bay 2 · 10:30 AM</p>
//                   </div>
//                 </motion.div>

//                 {/* ETA badge */}
//                 <motion.div
//                   initial={{ opacity: 0, x: 20, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }}
//                   transition={{ delay: .85, duration: .5 }}
//                   className="absolute -right-6 bottom-12 bg-white rounded-2xl px-4 py-3"
//                   style={{ boxShadow: '0 8px 32px rgba(0,0,0,.12)', border: '1px solid #f0fdf4' }}
//                 >
//                   <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ready in</p>
//                   <p className="text-[22px] font-black" style={{ color: '#059669' }}>12 min</p>
//                 </motion.div>

//                 {/* Stars */}
//                 <motion.div
//                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                   transition={{ delay: 1, duration: .4 }}
//                   className="absolute -right-4 top-6 bg-white rounded-xl px-3 py-2 flex items-center gap-1.5"
//                   style={{ boxShadow: '0 4px 16px rgba(0,0,0,.10)' }}
//                 >
//                   {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
//                   <span className="text-[12px] font-bold text-gray-700 ml-0.5">4.9</span>
//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </section>

//         {/* ── STATS ── */}
//         <section className="border-y border-gray-100 bg-white">
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
//             {STATS.map(({ value, label }, i) => (
//               <FadeUp key={label} delay={i * 0.08}>
//                 <div className="text-center">
//                   <p className="as-stat-count text-[36px] font-black leading-none">{value}</p>
//                   <p className="mt-1.5 text-[13px] font-medium text-gray-500">{label}</p>
//                 </div>
//               </FadeUp>
//             ))}
//           </div>
//         </section>

//         {/* ── SERVICES ── */}
//         <section id="services" className="py-24" style={{ background: '#f8faf9' }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8">
//             <FadeUp>
//               <div className="text-center mb-14">
//                 <span className="text-[12px] font-bold uppercase tracking-[.12em]" style={{ color: '#059669' }}>What we offer</span>
//                 <h2 className="mt-3 text-[36px] sm:text-[42px] font-black tracking-tight text-gray-900">Services built for every car</h2>
//                 <p className="mt-3 text-[16px] text-gray-500 max-w-xl mx-auto">From a quick rinse to a full ceramic coat — book any service in under 60 seconds.</p>
//               </div>
//             </FadeUp>

//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
//               {SERVICES.map(({ icon: Icon, label, price, time, color, accent }, i) => (
//                 <FadeUp key={label} delay={i * 0.07}>
//                   <div
//                     className="as-service-card group bg-white rounded-2xl p-6 cursor-pointer"
//                     style={{ border: '1.5px solid #f1f5f2', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
//                   >
//                     <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: color }}>
//                       <Icon className="w-6 h-6" style={{ color: accent }} />
//                     </div>
//                     <h3 className="text-[16px] font-bold text-gray-900">{label}</h3>
//                     <p className="mt-1 text-[13px] text-gray-400 flex items-center gap-1.5">
//                       <Clock className="w-3.5 h-3.5" /> {time}
//                     </p>
//                     <div className="mt-5 flex items-center justify-between">
//                       <span className="text-[20px] font-black" style={{ color: accent }}>{price}</span>
//                       <span
//                         className="text-[12px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                         style={{ color: accent }}
//                       >
//                         Book now <ChevronRight className="w-3.5 h-3.5" />
//                       </span>
//                     </div>
//                   </div>
//                 </FadeUp>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ── HOW IT WORKS ── */}
//         <section id="how" className="py-24 bg-white">
//           <div className="mx-auto max-w-7xl px-5 sm:px-8">
//             <FadeUp>
//               <div className="text-center mb-16">
//                 <span className="text-[12px] font-bold uppercase tracking-[.12em]" style={{ color: '#059669' }}>Simple process</span>
//                 <h2 className="mt-3 text-[36px] sm:text-[42px] font-black tracking-tight text-gray-900">Booking takes 60 seconds</h2>
//               </div>
//             </FadeUp>

//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
//               <div
//                 className="hidden lg:block absolute top-[28px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px]"
//                 style={{ background: 'linear-gradient(90deg,#bbf7d0,#6ee7b7,#bbf7d0)', borderRadius: 2 }}
//               />
//               {HOW.map(({ step, title, desc }, i) => (
//                 <FadeUp key={step} delay={i * 0.1}>
//                   <div className="flex flex-col items-center text-center">
//                     <div
//                       className="relative w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-black text-white mb-5 z-10"
//                       style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 16px rgba(5,150,105,.35)' }}
//                     >
//                       {step}
//                     </div>
//                     <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
//                     <p className="mt-2 text-[14px] text-gray-500 leading-relaxed max-w-[200px]">{desc}</p>
//                   </div>
//                 </FadeUp>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ── CTA BAND ── */}
//         <FadeUp>
//           <section
//             className="mx-4 sm:mx-8 my-20 rounded-3xl overflow-hidden"
//             style={{ background: 'linear-gradient(135deg,#065f46 0%,#047857 60%,#059669 100%)' }}
//           >
//             <div className="mx-auto max-w-4xl px-8 py-16 text-center">
//               <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-200 mb-4">
//                 <Zap className="w-4 h-4" /> Limited slots available today
//               </span>
//               <h2 className="text-[36px] sm:text-[46px] font-black text-white leading-tight">
//                 Ready for a cleaner car?
//               </h2>
//               <p className="mt-4 text-[17px] text-emerald-100 max-w-md mx-auto">
//                 Join 12,000+ drivers who trust AutoSpa for effortless car care.
//               </p>
//               <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
//                 <button
//                   onClick={openSignup}
//                   className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-colors"
//                 >
//                   Book your first service <ArrowRight className="w-4 h-4" />
//                 </button>
//                 <a href="#how">
//                   <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-white/25 text-[15px] font-semibold text-white hover:bg-white/10 transition-colors">
//                     See how it works
//                   </button>
//                 </a>
//               </div>
//             </div>
//           </section>
//         </FadeUp>

//         <PageTransition />
//       </main>

//       {/* ══════════════════ FOOTER ══════════════════ */}
//       <footer style={{ background: '#052e20', color: 'white' }}>

//         {/* Newsletter */}
//         <div style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
//             <div>
//               <h3 className="text-[18px] font-bold text-white">Car care tips in your inbox</h3>
//               <p className="text-[14px] text-white/50 mt-1">Monthly reminders + exclusive member discounts.</p>
//             </div>
//             <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
//               {subDone ? (
//                 <span className="flex items-center gap-2 text-[14px] font-semibold text-emerald-300">
//                   <CheckCircle className="w-4 h-4" /> You're subscribed!
//                 </span>
//               ) : (
//                 <>
//                   <input
//                     type="email" required value={email} onChange={e => setEmail(e.target.value)}
//                     placeholder="your@email.com"
//                     className="flex-1 md:w-60 rounded-xl px-4 py-2.5 text-[14px] outline-none"
//                     style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'white' }}
//                   />
//                   <button
//                     type="submit"
//                     className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
//                     style={{ background: '#059669' }}
//                   >
//                     Subscribe <ArrowRight className="w-3.5 h-3.5" />
//                   </button>
//                 </>
//               )}
//             </form>
//           </div>
//         </div>

//         {/* Footer grid */}
//         <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
//           <div className="col-span-2 md:col-span-2 pr-6">
//             <div className="flex items-center gap-2.5 mb-4">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#059669' }}>
//                 <Car className="w-4 h-4 text-white" />
//               </div>
//               <span className="text-[17px] font-bold text-white">AutoSpa</span>
//             </div>
//             <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,.5)' }}>
//               Professional car care — from a quick wash to a full garage service — booked in seconds, tracked in real time.
//             </p>

//             <div className="flex gap-2.5 mt-6">
//               {SOCIALS.map(({ Icon, label }) => (
//                 <button
//                   key={label}
//                   aria-label={label}
//                   className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/15"
//                   style={{ background: 'rgba(255,255,255,.08)' }}
//                 >
//                   <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,.65)' }} />
//                 </button>
//               ))}
//             </div>

//             <div className="mt-6 space-y-2">
//               {[
//                 { Icon: Mail, text: 'support@autospa.app' },
//                 { Icon: Phone, text: '+1 (555) 010-0100' },
//                 { Icon: Clock, text: 'Mon–Sun, 8 am – 8 pm' },
//               ].map(({ Icon, text }) => (
//                 <p key={text} className="flex items-center gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,.45)' }}>
//                   <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#34d399' }} />
//                   {text}
//                 </p>
//               ))}
//             </div>
//           </div>

//           {Object.entries(FOOTER_LINKS).map(([col, links]) => (
//             <div key={col}>
//               <h4 className="text-[11px] font-bold uppercase tracking-[.12em] mb-5" style={{ color: '#34d399' }}>{col}</h4>
//               <ul className="space-y-3">
//                 {links.map(l => (
//                   <li key={l}>
//                     <a href="#" className="text-[14px] transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,.45)' }}>
//                       {l}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Bottom bar */}
//         <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
//             <span className="text-[13px]" style={{ color: 'rgba(255,255,255,.3)' }}>
//               © {new Date().getFullYear()} AutoSpa Technologies. All rights reserved.
//             </span>
//             <div className="flex items-center gap-5">
//               {['Privacy', 'Terms', 'Cookies'].map(l => (
//                 <a key={l} href="#" className="text-[13px] hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,.3)' }}>
//                   {l}
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }




import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  Droplets,
  MapPin,
  Info,
  Compass,
  Code2,
  Building2,
  UserPlus,
  LogIn,
  ArrowRight,
  ChevronRight,
  Send,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react'

import Button from '../components/ui/Button.jsx'
import PageTransition from './PageTransition.jsx'
import { cn } from '../lib/utils.js'

/* ─────────────────── data ─────────────────── */

const NAV = [
  { label: 'Home', to: '/', Icon: Compass, exact: true },
  { label: 'Services', to: '/services', Icon: Droplets },
  { label: 'Meet the Developer', to: '/developer', Icon: Code2 },
  { label: 'How It Works', to: '/how-it-works', Icon: Info },
  { label: 'About', to: '/about', Icon: Building2 },
  { label: 'Become Partner', to: '/register/garage', Icon: UserPlus },
]

const SOCIALS = [
  { Icon: Facebook, label: 'Facebook', href: '#' },
  { Icon: Twitter, label: 'Twitter', href: '#' },
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
]

const FOOTER_COLUMNS = [
  {
    title: 'Customers',
    links: [
      { label: 'Browse Services', to: '/#services' },
      { label: 'Find Garages', to: '/customer/garages' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Support & FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Garage Owners',
    links: [
      { label: 'Become a Partner', to: '/register/garage' },
      { label: 'Partner Login', to: '/login' },
      { label: 'Owner Dashboard', to: '/garage/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Meet the Developer', to: '/developer' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
    ],
  },
]

/* ─────────────────── hooks ─────────────────── */

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

/* ─────────────────── nav link helper ─────────────────── */

function isNavActive(item, location) {
  if (item.hash) {
    return location.pathname === '/' && location.hash === item.hash
  }
  if (item.exact) {
    return location.pathname === item.to && !location.hash
  }
  // Regular route links (e.g. /services, /about)
  if (!item.hash && !item.exact && item.to && !item.to.includes('#')) {
    return location.pathname === item.to
  }
  return false
}

/* ═══════════════════════════ MAIN LAYOUT ════════════════════════════ */

export default function PublicLayout() {
  const scrolled = useScrolled()
  const [drawer, setDrawer] = useState(false)
  const [email, setEmail] = useState('')
  const [subDone, setSubDone] = useState(false)
  const location = useLocation()
  const drawerFirstFocusRef = useRef(null)

  // Close the mobile drawer on navigation.
  useEffect(() => setDrawer(false), [location.pathname])

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (drawer) {
      document.body.style.overflow = 'hidden'
      drawerFirstFocusRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubDone(true); setEmail('') }
  }

  /* ── drawer animation variants ── */
  const drawerVariants = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: { type: 'spring', damping: 26, stiffness: 240, staggerChildren: 0.05, delayChildren: 0.08 },
    },
    exit: { x: '100%', transition: { type: 'tween', duration: 0.2, ease: 'easeIn' } },
  }
  const itemVariant = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } },
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <header
        className={cn(
          'fixed inset-x-0 z-40 transition-all duration-500 flex justify-center pointer-events-none',
          scrolled ? 'top-4 px-4' : 'top-0 px-0'
        )}
      >
        <div
          className={cn(
            'pointer-events-auto flex w-full items-center justify-between transition-all duration-500 relative',
            scrolled
              ? 'max-w-6xl h-14 bg-surface/80 backdrop-blur-2xl border border-hairline shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] rounded-full px-6 lg:px-8'
              : 'max-w-7xl h-16 bg-transparent border-b border-transparent px-5 sm:px-8 rounded-none'
          )}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 shrink-0 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="AutoSpa Home"
          >
            <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-9 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV.map((item) => {
              const active = isNavActive(item, location)
              const Icon = item.Icon
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold transition-all rounded-full',
                    'hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    active ? 'text-primary bg-primary/5' : 'text-content-secondary'
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/customer/garages"
              className="rounded-control p-2 text-content-secondary hover:text-primary hover:bg-accent-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Search garages"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>

            <Link to="/login" className="rounded-control focus-visible:outline-none">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Button variant="secondary" size="sm">Log in</Button>
              </motion.div>
            </Link>
            <Link to="/register/customer" className="rounded-control focus-visible:outline-none">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" className="gap-1.5">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <Link
              to="/customer/garages"
              className="rounded-control p-2 text-content-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Search garages"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="rounded-control p-2 text-content-secondary hover:text-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════ MOBILE DRAWER ══════════════════ */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-primary-deep/40 backdrop-blur-sm"
              onClick={() => setDrawer(false)}
            />

            <motion.aside
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              className="absolute right-0 top-0 flex h-full w-80 flex-col bg-surface shadow-pop border-l border-hairline"
            >
              {/* header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
                <Link
                  to="/"
                  onClick={() => setDrawer(false)}
                  className="flex items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="AutoSpa Home"
                >
                  <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-8 w-auto" />
                </Link>
                <button
                  ref={drawerFirstFocusRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawer(false)}
                  className="rounded-control p-1.5 text-content-secondary hover:text-content hover:bg-accent-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* nav items */}
              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
                <div className="flex flex-col gap-0.5">
                  {NAV.map((item) => {
                    const active = isNavActive(item, location)
                    const Icon = item.Icon
                    return (
                      <motion.div key={item.label} variants={itemVariant}>
                        <NavLink
                          to={item.to}
                          onClick={() => setDrawer(false)}
                          className={cn(
                            'group flex items-center justify-between rounded-control px-4 py-3 text-sm font-medium transition-all',
                            'hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            active
                              ? 'text-primary bg-accent-light font-semibold'
                              : 'text-content-secondary hover:text-content'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn('h-[18px] w-[18px] transition-colors', active ? 'text-primary' : 'text-content-muted group-hover:text-primary')} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                      </motion.div>
                    )
                  })}
                </div>
              </nav>

              {/* CTAs */}
              <div className="p-5 border-t border-hairline flex flex-col gap-2.5">
                <motion.div variants={itemVariant}>
                  <Link to="/login" onClick={() => setDrawer(false)} className="block rounded-control focus-visible:outline-none">
                    <Button variant="secondary" className="w-full gap-2">
                      <LogIn className="h-4 w-4" /> Log in
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariant}>
                  <Link to="/register/customer" onClick={() => setDrawer(false)} className="block rounded-control focus-visible:outline-none">
                    <Button className="w-full gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-hairline bg-surface">

        {/* Newsletter band */}
        <div className="border-b border-hairline">
          <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-content">Stay in the loop</h3>
              <p className="mt-1 text-sm text-content-secondary">
                Monthly maintenance tips, partner discounts, and new feature updates.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
              {subDone ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-sm font-medium text-primary bg-accent-light border border-accent-mid px-4 py-2.5 rounded-control w-full"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>You're subscribed! Check your inbox soon.</span>
                </motion.div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-control border border-control bg-background px-4 py-2.5 text-sm text-content outline-none transition-all placeholder:text-content-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                    aria-label="Email address for newsletter"
                  />
                  <Button type="submit" size="sm" className="shrink-0 gap-1.5">
                    Subscribe <Send className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Footer grid */}
        <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="AutoSpa Home">
              <img src="/autospa-logo-horizontal.svg" alt="AutoSpa" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-content-secondary leading-relaxed max-w-xs">
              India's leading on-demand car care marketplace. We connect vehicle owners with verified local garages for professional, hassle-free servicing.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-control border border-control text-content-muted hover:text-primary hover:border-primary hover:bg-accent-light transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={s.label}
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-content-muted">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'text-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm',
                          isActive ? 'text-primary font-medium' : 'text-content-secondary'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-hairline">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-xs text-content-muted sm:flex-row">
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <span>© {new Date().getFullYear()} AutoSpa Technologies Pvt. Ltd. All rights reserved.</span>
              <span className="font-medium text-content-secondary/80 text-blue-600">Designed, Developed & Maintained by Nayan Dange</span>
            </div>
            <div className="flex items-center gap-5">
              <NavLink to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</NavLink>
              <NavLink to="/terms" className="hover:text-primary transition-colors">Terms</NavLink>
              <NavLink to="/cookies" className="hover:text-primary transition-colors">Cookies</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

