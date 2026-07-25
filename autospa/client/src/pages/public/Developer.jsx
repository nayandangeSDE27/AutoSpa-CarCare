import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Download, Github, Linkedin, Mail, Server, Code2, Database, Layers,
  CheckCircle, Zap, Terminal, Cpu, Globe, Settings, Shield, ArrowRight,
  MonitorSmartphone, GraduationCap, Briefcase, Heart, Lightbulb, Lock, Activity, Clock
} from 'lucide-react'

import Button from '../../components/ui/Button.jsx'
import { cn } from '../../lib/utils.js'

/* ═══════════════════════════ DATA ════════════════════════════ */

const TECH_CATEGORIES = [
  { category: 'Languages', items: ['JavaScript'] },
  { category: 'Frontend', items: ['React.js', 'TailwindCSS', 'HTML5', 'CSS3', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT', 'Multer', 'Nodemailer'] },
  { category: 'Database', items: ['MongoDB', 'Mongoose', 'Redis'] },
  { category: 'Cloud Services', items: ['ImageKit.io', 'Cloudinary'] },
  { category: 'Payments', items: ['Stripe'] },
  { category: 'Currently Learning', items: ['BullMQ (Basics)', 'Docker (Basics)', 'Git', 'GitHub', 'Postman'] },
]

const JOURNEY = [
  { title: 'Started Web Development', icon: Code2 },
  { title: 'JavaScript', icon: Terminal },
  { title: 'React', icon: Globe },
  { title: 'MERN Stack', icon: Layers },
  { title: 'Backend Development', icon: Server },
  { title: 'Redis', icon: Zap },
  { title: 'Currently Learning', icon: Cpu },
  { title: 'Building Production Projects', icon: Settings },
  { title: 'Preparing for Software Engineering Roles', icon: GraduationCap },
]

const PHILOSOPHY = [
  { title: 'Write Clean Code', desc: 'Readable and maintainable code always wins over clever but complex implementations.', icon: Code2 },
  { title: 'Build Scalable Systems', desc: 'Every project should be easy to extend, featuring clear boundaries and robust architectures.', icon: Layers },
  { title: 'Keep Learning', desc: 'Technology evolves every day, and continuous learning is an essential part of being an engineer.', icon: Lightbulb },
]

const WHAT_I_BUILD = [
  { title: 'REST APIs', icon: Server, desc: 'Scalable and secure endpoints' },
  { title: 'Authentication', icon: Lock, desc: 'JWT & Role-based access' },
  { title: 'Backend Architecture', icon: Layers, desc: 'Clean, modular design' },
  { title: 'Database Design', icon: Database, desc: 'MongoDB & Mongoose' },
  { title: 'Booking Systems', icon: Clock, desc: 'Complex scheduling logic' },
  { title: 'Real-Time Apps', icon: Activity, desc: 'Event-driven systems' },
  { title: 'Clean Code', icon: Code2, desc: 'Maintainable patterns' },
  { title: 'Performance', icon: Zap, desc: 'Redis caching & optimization' },
]

/* ═══════════════════════════ HELPERS ════════════════════════════ */

function FadeUp({ children, delay = 0, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
      {children}
    </span>
  )
}

function SectionHeading({ children, className }) {
  return (
    <h2 className={cn('mt-5 text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-content leading-[1.1]', className)}>
      {children}
    </h2>
  )
}

function TechTooltip({ children, text }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="relative flex items-center justify-center cursor-default group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      aria-label={text}
    >
      {children}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 bg-content text-background text-xs font-bold rounded-xl shadow-xl z-50 pointer-events-none"
          >
            {text}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-content" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════ PAGE COMPONENT ════════════════════════════ */

export default function Developer() {
  const { scrollYProgress } = useScroll()
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <>
      <style>{`
        @keyframes dev-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes badge-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10px, -20px) scale(1.05); }
        }
        @keyframes badge-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 20px) scale(1.05); }
        }
        @keyframes dev-gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .dev-float { animation: dev-float 8s ease-in-out infinite; }
        .badge-float-1 { animation: badge-float-1 6s ease-in-out infinite; }
        .badge-float-2 { animation: badge-float-2 7s ease-in-out infinite alternate; }
        .badge-float-3 { animation: badge-float-1 8s ease-in-out infinite reverse; }
        .badge-float-4 { animation: badge-float-2 9s ease-in-out infinite alternate-reverse; }
        
        .bg-animated-gradient {
          background-size: 200% 200%;
          animation: dev-gradient-flow 8s ease infinite;
        }
        .animate-blob { animation: blob-drift 20s infinite alternate ease-in-out; }
      `}</style>

      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-surface py-32 lg:py-0">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-light/[0.2] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Subtle grid pattern for premium feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0 flex flex-col items-center lg:items-start">
              <FadeUp delay={0.1}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wide text-primary shadow-sm">
                  <Heart className="h-3.5 w-3.5" fill="currentColor" />
                  Built with Passion
                </span>
              </FadeUp>

              <FadeUp delay={0.2}>
                <h1 className="mt-8 text-5xl sm:text-6xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight text-content">
                  Meet the Developer Behind{' '}
                  <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent bg-animated-gradient drop-shadow-sm">
                    AutoSpa
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="mt-8 text-[17px] sm:text-lg leading-[1.8] text-content-secondary max-w-[520px]">
                  <p className="mb-4">
                    Hi, I'm Nayan, a <strong className="text-content font-bold">Backend-Focused MERN Stack Developer</strong> passionate about building scalable backend systems, secure REST APIs and modern web applications.
                  </p>
                  <p>
                    Although backend engineering is my primary focus, I also build responsive React applications to deliver complete end-to-end products.
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={0.4} className="w-full">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-10">
                  <a href="#" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative group">
                      <div className="absolute inset-0 bg-primary opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-xl" />
                      <Button size="lg" className="relative gap-2 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        <Download className="h-4 w-4" /> Download Resume
                      </Button>
                    </motion.div>
                  </a>
                  <a href="https://github.com/nayandangeSDE27" target="_blank" rel="noreferrer" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="secondary" size="lg" className="gap-2 rounded-xl shadow-soft hover:shadow-card transition-all duration-300 bg-background border-hairline">
                        <Github className="h-4 w-4" /> View GitHub
                      </Button>
                    </motion.div>
                  </a>
                </div>
              </FadeUp>

              <FadeUp delay={0.5} className="w-full">
                <div className="grid grid-cols-2 gap-3 mt-14 pt-10 border-t border-hairline/60">
                  {[
                    { label: 'Backend Focused', icon: Server, sub: 'Scalable APIs' },
                    { label: 'MERN Stack', icon: Layers, sub: 'Full Stack JS' },
                    { label: 'JavaScript', icon: Terminal, sub: 'Primary Lang' },
                    { label: 'Currently Learning', icon: Cpu, sub: 'Docker & BullMQ' },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <motion.div 
                        key={stat.label} 
                        whileHover={{ y: -3, backgroundColor: 'var(--accent-light)' }}
                        className="flex flex-col gap-1 p-4 rounded-2xl bg-surface border border-hairline/50 shadow-sm transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-content">
                          <Icon className="h-4 w-4 text-primary" /> {stat.label}
                        </div>
                        <span className="text-xs font-medium text-content-secondary ml-6">{stat.sub}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </FadeUp>
            </div>

            {/* Right Content: Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex justify-center items-center order-first lg:order-last mb-10 lg:mb-0"
            >
              <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] dev-float">
                {/* Glow rings */}
                <div className="absolute inset-[-30px] rounded-full bg-gradient-to-tr from-primary/30 to-accent-light/50 opacity-60 blur-2xl" />
                <div className="absolute inset-[20px] rounded-full bg-white/10 opacity-50 blur-xl" />
                
                <div className="relative w-full h-full rounded-full border-[6px] border-white/80 overflow-hidden bg-background shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                  <img
                    src="/developer-profile.jpg"
                    alt="Nayan Dange"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* Glassmorphism Tech Badges */}
                <div className="absolute -top-4 left-4 sm:-left-4 badge-float-1">
                  <TechTooltip text="Building scalable REST APIs">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[11px] sm:text-xs font-extrabold text-content">Node.js</div>
                    </motion.div>
                  </TechTooltip>
                </div>
                
                <div className="absolute top-1/4 -right-4 sm:-right-8 badge-float-2">
                  <TechTooltip text="Responsive UI Development">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[11px] sm:text-xs font-extrabold text-[#61DAFB]">React</div>
                    </motion.div>
                  </TechTooltip>
                </div>
                
                <div className="absolute bottom-12 -left-2 sm:-left-8 badge-float-3">
                  <TechTooltip text="Database Design & Aggregation">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[11px] sm:text-xs font-extrabold text-[#47A248]">MongoDB</div>
                    </motion.div>
                  </TechTooltip>
                </div>
                
                <div className="absolute -bottom-6 right-8 sm:right-12 badge-float-4">
                  <TechTooltip text="Caching & OTP Storage">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[11px] sm:text-xs font-extrabold text-[#D82C20]">Redis</div>
                    </motion.div>
                  </TechTooltip>
                </div>
                
                <div className="absolute top-10 left-12 sm:left-16 badge-float-2 hidden sm:block">
                  <TechTooltip text="Backend Framework">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[10px] font-extrabold text-content">Express</div>
                    </motion.div>
                  </TechTooltip>
                </div>
                
                <div className="absolute bottom-8 right-16 sm:right-24 badge-float-1 hidden sm:block">
                  <TechTooltip text="Primary Programming Language">
                    <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-soft flex items-center justify-center ring-1 ring-black/5">
                      <div className="text-[11px] font-extrabold text-[#F7DF1E]">JS</div>
                    </motion.div>
                  </TechTooltip>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 2. WHAT I LOVE BUILDING ═══════════════════ */}
      <section className="py-32 bg-background border-t border-hairline/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[80px]" />
        
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <SectionLabel>Passions</SectionLabel>
              <SectionHeading>What I Love Building</SectionHeading>
              <p className="mt-6 text-lg text-content-secondary leading-relaxed">
                I specialize in developing robust backend architectures and bridging them with clean, interactive frontend experiences.
              </p>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHAT_I_BUILD.map((item, i) => {
              const Icon = item.icon
              return (
                <FadeUp key={item.title} delay={i * 0.05}>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-8 rounded-[2rem] bg-surface border border-hairline/60 shadow-sm hover:shadow-card hover:border-primary/20 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-content mb-2">{item.title}</h3>
                    <p className="text-sm font-medium text-content-secondary leading-relaxed">{item.desc}</p>
                  </motion.div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3. ABOUT ME ═══════════════════ */}
      <section className="py-32" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <FadeUp>
            <SectionLabel>About Me</SectionLabel>
            <SectionHeading className="mt-6 leading-tight">Building Reliable Software with a Backend-First Mindset</SectionHeading>
          </FadeUp>
          
          <div className="mt-14 space-y-8 text-[19px] text-content-secondary leading-[1.8] font-medium">
            <FadeUp delay={0.1}>
              <p>
                I'm Nayan, a <strong className="text-content">Backend-Focused MERN Stack Developer</strong> passionate about building scalable, secure and maintainable web applications.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p>
                I enjoy solving <strong className="text-content">Backend Engineering</strong> challenges such as designing <strong className="text-content">REST APIs</strong>, implementing secure <strong className="text-content">Authentication</strong>, optimizing database queries with <strong className="text-content">MongoDB</strong>, and building complex real-world business logic.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p>
                While backend development is my strongest area, I also develop modern <strong className="text-content">React</strong> applications to create clean, responsive and user-friendly interfaces.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <p>
                My goal is to transform ideas into reliable products through clean architecture, reusable code and practical engineering solutions.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 4. MY EXPERTISE ═══════════════════ */}
      <section className="py-32 bg-surface border-y border-hairline/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <SectionLabel>My Expertise</SectionLabel>
              <SectionHeading>Technical Focus Areas</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-8">
            <FadeUp delay={0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="rounded-[2.5rem] border border-hairline bg-background p-10 h-full shadow-soft hover:shadow-card hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Server className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold text-content mb-8">Backend Development</h3>
                <ul className="space-y-4">
                  {['Node.js & Express.js', 'REST APIs Architecture', 'Authentication & JWT', 'Database Design (Mongo)', 'Business Logic Implementation', 'API Security Best Practices', 'Redis Caching'].map((item) => (
                    <li key={item} className="flex items-center gap-3.5 text-[15px] font-semibold text-content-secondary">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <motion.div
                whileHover={{ y: -8 }}
                className="rounded-[2.5rem] border border-hairline bg-background p-10 h-full shadow-soft hover:shadow-card hover:border-primary/20 transition-all flex flex-col group"
              >
                <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold text-content mb-8">Frontend Development</h3>
                <ul className="space-y-4 mb-8 flex-1">
                  {['React.js ecosystem', 'TailwindCSS & UI Frameworks', 'Responsive Layouts', 'React Router & Navigation', 'Framer Motion Animations', 'API Integration & State'].map((item) => (
                    <li key={item} className="flex items-center gap-3.5 text-[15px] font-semibold text-content-secondary">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-6 border-t border-hairline/60">
                  <p className="text-[13px] text-content-secondary font-semibold leading-relaxed italic opacity-80">
                    Backend is my primary specialization while React helps me build complete end-to-end experiences.
                  </p>
                </div>
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <motion.div
                whileHover={{ y: -8 }}
                className="rounded-[2.5rem] border border-hairline bg-background p-10 h-full shadow-soft hover:shadow-card hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold text-content mb-8">Development Principles</h3>
                <ul className="space-y-4">
                  {['Clean, Readable Code', 'Reusable & Modular Components', 'Scalable System Architecture', 'Performance Optimization', 'Long-term Maintainability', 'Complex Problem Solving'].map((item) => (
                    <li key={item} className="flex items-center gap-3.5 text-[15px] font-semibold text-content-secondary">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5. TECH STACK ═══════════════════ */}
      <section className="py-32" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <SectionLabel>Tech Stack</SectionLabel>
              <SectionHeading>Technologies I Work With</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TECH_CATEGORIES.map((cat, i) => (
              <FadeUp key={cat.category} delay={i * 0.05}>
                <div className="rounded-[2rem] border border-hairline bg-surface p-8 h-full transition-all hover:border-primary/30 hover:shadow-card shadow-sm">
                  <h4 className="text-[13px] font-extrabold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {cat.category}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {cat.items.map((item) => (
                      <span key={item} className="px-4 py-2 rounded-xl bg-background border border-hairline text-[14px] font-bold text-content-secondary shadow-sm hover:text-content hover:border-content-secondary/30 transition-colors">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 6. FEATURED PROJECT ═══════════════════ */}
      <section className="py-32 bg-surface border-y border-hairline/30">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20">
              <SectionLabel>Showcase</SectionLabel>
              <SectionHeading>Featured Project</SectionHeading>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-[3rem] bg-gradient-to-br from-background via-background to-surface border border-hairline p-10 sm:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative grid lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-primary/10 mb-8 ring-1 ring-primary/20">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-extrabold text-content mb-4 tracking-tight">AutoSpa</h3>
                  <p className="text-xl font-bold text-primary mb-8">Professional Car Care Marketplace</p>
                  
                  <div className="space-y-6 text-[17px] leading-relaxed text-content-secondary font-medium">
                    <p>
                      AutoSpa is a full-stack MERN application that connects customers with verified garages for professional car care services.
                    </p>
                    <p>
                      Built with a complex role-based architecture, customers can discover garages, compare services, book appointments, manage vehicles and track bookings in real-time.
                    </p>
                    <p>
                      Garage owners access a dedicated secure dashboard to manage workers, operational hours, bookings and specific services.
                    </p>
                  </div>

                  <Link to="/" className="inline-block mt-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="rounded-xl h-14 px-8 text-base shadow-xl">
                        Explore AutoSpa <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                <div className="lg:col-span-5 bg-surface/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-hairline shadow-soft ring-1 ring-black/5">
                  <h4 className="font-bold text-content mb-8 text-lg tracking-wide uppercase">Architecture & Features</h4>
                  <div className="space-y-5">
                    {[
                      'Role Based Authentication (JWT)',
                      'Secure Email Verification (OTP)',
                      'Complex Booking Engine',
                      'Multi-tenant Garage Management',
                      'Worker & Schedule Management',
                      'Stripe Payment Integration',
                      'Redis High-Speed Caching',
                      'Advanced Analytics Dashboard',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3.5 text-[15px] font-bold text-content-secondary group-hover:text-content transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ 7. WHY BACKEND? ═══════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <FadeUp>
            <SectionLabel>Passion</SectionLabel>
            <SectionHeading className="mt-6">Why I Enjoy Backend Engineering</SectionHeading>
          </FadeUp>
          
          <FadeUp delay={0.1}>
            <div className="mt-14 space-y-8 text-xl text-content-secondary font-medium leading-[1.8] bg-surface/60 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-16 border border-hairline shadow-soft ring-1 ring-black/5">
              <p>
                Backend engineering allows me to solve complex technical challenges that power real-world applications behind the scenes.
              </p>
              <p>
                I thrive when designing robust APIs, structuring optimal database schemas, implementing rock-solid authentication, optimizing response times and building systems that scale gracefully.
              </p>
              <p>
                Although I enjoy creating interactive React interfaces, my deepest interest lies in building the reliable backend architectures that make those interfaces function smoothly.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ 8. LEARNING JOURNEY ═══════════════════ */}
      <section className="py-32 bg-surface border-y border-hairline/30">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20">
              <SectionLabel>Timeline</SectionLabel>
              <SectionHeading>Learning Journey</SectionHeading>
            </div>
          </FadeUp>

          <div className="relative">
            {/* Timeline track */}
            <div className="absolute left-8 sm:left-[3.25rem] top-6 bottom-6 w-[3px] bg-primary/10 rounded-full" />
            <motion.div 
              style={{ scaleY: scrollYProgress, transformOrigin: 'top' }} 
              className="absolute left-8 sm:left-[3.25rem] top-6 bottom-6 w-[3px] bg-primary rounded-full z-0 hidden lg:block"
            />
            
            <div className="space-y-8">
              {JOURNEY.map((step, i) => {
                const Icon = step.icon
                return (
                  <FadeUp key={step.title} delay={i * 0.05}>
                    <motion.div 
                      whileHover={{ x: 6 }}
                      className="relative pl-20 sm:pl-28 flex items-center group"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[1.35rem] sm:left-[2.1rem] w-12 h-12 rounded-[1rem] bg-background border-2 border-primary/30 group-hover:border-primary flex items-center justify-center shadow-sm z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-card">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="rounded-[1.5rem] border border-hairline bg-background px-8 py-5 shadow-sm group-hover:shadow-soft transition-all w-full group-hover:border-primary/20">
                        <span className="text-lg font-bold text-content">{step.title}</span>
                      </div>
                    </motion.div>
                  </FadeUp>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 9. PHILOSOPHY ═══════════════════ */}
      <section className="py-32" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <div className="text-center mb-20">
              <SectionLabel>Philosophy</SectionLabel>
              <SectionHeading>Development Philosophy</SectionHeading>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {PHILOSOPHY.map((phil, i) => {
              const Icon = phil.icon
              return (
                <FadeUp key={phil.title} delay={i * 0.1}>
                  <div className="rounded-[2.5rem] border border-hairline bg-surface p-10 h-full shadow-soft hover:shadow-card hover:border-primary/20 transition-all group">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-accent-light flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-content mb-4">{phil.title}</h3>
                    <p className="text-[15px] font-medium text-content-secondary leading-relaxed">{phil.desc}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 10. LET'S CONNECT ═══════════════════ */}
      <FadeUp>
        <section className="mx-4 sm:mx-8 mb-20 rounded-[3rem] overflow-hidden relative shadow-2xl group border border-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-primary to-primary-deep transition-transform duration-1000 group-hover:scale-105" />

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative mx-auto max-w-3xl px-8 py-24 sm:py-32 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
              Interested in Collaborating?
            </h2>

            <p className="mt-8 text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto leading-relaxed font-medium">
              I'm always interested in discussing backend engineering, scalable system design and modern web development. Whether it's collaboration, open-source contributions or exciting opportunities, I'd be happy to connect.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[16px] font-extrabold text-primary hover:bg-gray-50 transition-colors shadow-[0_8px_16px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <Download className="h-5 w-5" /> Download Resume
              </motion.a>
              
              <motion.a 
                href="https://github.com/nayandangeSDE27" 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 bg-black/20 backdrop-blur-xl text-[16px] font-bold text-white hover:bg-black/30 transition-colors shadow-[0_8px_16px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <Github className="h-5 w-5" /> GitHub
              </motion.a>
              
              <motion.a 
                href="https://www.linkedin.com/in/nayan-dange-0621a0299/" 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 bg-blue-600/40 backdrop-blur-xl text-[16px] font-bold text-white hover:bg-blue-600/50 transition-colors shadow-[0_8px_16px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <Linkedin className="h-5 w-5" /> LinkedIn
              </motion.a>

              <motion.a 
                href="mailto:nayandange07@gmail.com" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-[16px] font-bold text-white hover:bg-white/20 transition-colors shadow-[0_8px_16px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <Mail className="h-5 w-5" /> Email
              </motion.a>
            </div>
          </div>
        </section>
      </FadeUp>
    </>
  )
}
