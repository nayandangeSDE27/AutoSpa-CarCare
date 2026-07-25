import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Star, MapPin, Clock, BadgeCheck, X, Wrench, ShieldCheck, 
  ThumbsUp, Zap, CreditCard, Navigation, Heart, CheckCircle2, ChevronRight, MessageSquare, Info
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { Stars } from '../../components/ui/Stars.jsx'
import { cn } from '../../lib/utils.js'
import { useGarage, useGarageServices } from '../../hooks/useGarages.js'
import { useGarageReviews } from '../../hooks/useReviews.js'
import { currency, minutesToLabel, isOpenNow, formatDate } from '../../lib/format.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const GALLERY_FALLBACK = [
  'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80', // Cover
  'https://images.unsplash.com/photo-1632823462991-6b453e00b86a?auto=format&fit=crop&q=80', // Service Bay
  'https://images.unsplash.com/photo-1553456558-aaf6328e5e8a?auto=format&fit=crop&q=80', // Waiting Area
  'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80' // Equipment
]

function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} 
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function GarageDetails() {
  const { garageId } = useParams()
  const navigate = useNavigate()
  const { data: garage, isLoading } = useGarage(garageId)
  const { data: services } = useGarageServices(garageId)
  const { data: reviews } = useGarageReviews(garageId)
  const [tab, setTab] = useState('services')
  const [lightbox, setLightbox] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 150], [0, 1])
  
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8 pb-24">
        <Skeleton className="h-[350px] w-full rounded-[2rem]" />
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-40 rounded-[2rem]" />
            <Skeleton className="h-96 rounded-[2rem]" />
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <Skeleton className="h-[400px] rounded-[2rem]" />
          </div>
        </div>
      </div>
    )
  }
  
  if (!garage) {
    return <EmptyState title="Garage not found" description="It may have been removed or is temporarily unavailable." action={<Link to="/customer/garages"><Button>Back to marketplace</Button></Link>} />
  }

  const images = garage.images?.length >= 4 ? garage.images : GALLERY_FALLBACK
  const open = isOpenNow(garage)
  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({ n, c: (reviews || []).filter((r) => r.rating === n).length }))
  const total = reviews?.length || 0
  const rating = garage.rating || 0
  
  const startingPrice = services?.length ? Math.min(...services.map(s => s.price)) : 0

  return (
    <div className="relative pb-24 bg-background min-h-screen">
      
      {/* Dynamic Sticky Header (Fades in on scroll) */}
      <motion.div style={{ opacity: headerOpacity }} className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-hairline h-16 flex items-center px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent-light rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-content" />
            </button>
            <span className="font-extrabold text-content truncate max-w-[200px] sm:max-w-md">{garage.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold flex items-center gap-1.5"><Star className="h-4 w-4 fill-primary text-primary" /> {rating.toFixed(1)}</span>
            <Button size="sm" className="rounded-full shadow-md px-6 hidden sm:flex" onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Book Now
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Grid (Airbnb Style) */}
        <div className="pt-4 sm:pt-6">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-content-secondary hover:text-content transition-colors group w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
          </button>
          
          <div className="grid grid-cols-4 gap-2 sm:gap-3 rounded-[2rem] overflow-hidden shadow-soft h-[250px] sm:h-[350px] lg:h-[400px]">
            {images.slice(0, 4).map((img, i) => {
              const isUrl = typeof img === 'string' && img.startsWith('http')
              return (
                <button
                  key={i}
                  onClick={() => setLightbox(img)}
                  className={cn(
                    "relative group bg-accent overflow-hidden transition-all duration-500",
                    i === 0 ? "col-span-4 sm:col-span-2 row-span-2" : "col-span-2 sm:col-span-1 hidden sm:block",
                    (i === 2 || i === 3) && "hidden lg:block"
                  )}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={isUrl ? { backgroundImage: `url(${img})` } : { background: img }}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  
                  {i === 0 && (
                    <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {garage.verificationStatus === 'APPROVED' && <Badge className="bg-primary text-white border-none shadow-sm"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>}
                        {open === true ? <Badge className="bg-green-500 text-white border-none shadow-sm">Open Now</Badge> : <Badge className="bg-black/50 text-white backdrop-blur-md border-none shadow-sm">Closed</Badge>}
                      </div>
                      <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1">{garage.name}</h1>
                      <p className="text-white/90 font-medium text-sm flex items-center gap-1"><MapPin className="h-4 w-4" /> {garage.address}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 mt-8 sm:mt-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header & Meta (Desktop) */}
            <div className="hidden sm:block">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-content tracking-tight mb-3 flex items-center gap-3">
                    {garage.name}
                    {garage.verificationStatus === 'APPROVED' && (
                      <span className="text-primary bg-primary/10 p-1.5 rounded-full" title="Verified Garage"><BadgeCheck className="h-6 w-6" /></span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-semibold text-content-secondary flex-wrap">
                    <div className="flex items-center gap-1.5 text-content">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="text-base">{rating.toFixed(1)}</span>
                      <span className="underline decoration-hairline underline-offset-2 hover:text-primary cursor-pointer transition-colors">({total} reviews)</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5 hover:text-content cursor-pointer transition-colors" onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      <MapPin className="h-4 w-4" />
                      <span className="underline decoration-hairline underline-offset-2">{garage.address || 'Address on request'}</span>
                    </div>
                    <span>·</span>
                    {open === true ? (
                      <span className="text-green-600 font-bold bg-green-500/10 px-2.5 py-0.5 rounded-md">Open Now</span>
                    ) : (
                      <span className="text-danger font-bold bg-danger/10 px-2.5 py-0.5 rounded-md">Closed</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => setIsSaved(!isSaved)}
                    className="flex items-center justify-center h-11 px-4 gap-2 rounded-xl border border-hairline hover:border-control font-semibold text-content transition-all shadow-sm bg-surface hover:bg-accent-light group"
                  >
                    <Heart className={cn("h-4 w-4 transition-colors", isSaved ? "fill-danger text-danger" : "text-content-secondary group-hover:text-content")} />
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-hairline hidden sm:block" />

            {/* Highlights Section */}
            <FadeUp>
              <h2 className="text-xl font-extrabold text-content mb-6">Why choose {garage.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, title: "Verified Garage", desc: "Trusted by AutoSpa" },
                  { icon: CheckCircle2, title: "Pro Equipment", desc: "State-of-the-art tools" },
                  { icon: CreditCard, title: "Secure Payments", desc: "Pay securely via app" },
                  { icon: ThumbsUp, title: "Top Rated", desc: "High customer satisfaction" },
                  { icon: Zap, title: "Instant Booking", desc: "Confirm immediately" },
                  { icon: Wrench, title: "Expert Staff", desc: "Trained professionals" },
                ].map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <h.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-content text-sm sm:text-base leading-tight">{h.title}</h3>
                      <p className="text-xs sm:text-sm text-content-secondary mt-0.5">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <hr className="border-hairline" />

            {/* Services Section */}
            <FadeUp delay={0.1}>
              <div id="services-section">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-content">Available Services</h2>
                    <p className="text-sm font-medium text-content-secondary mt-1">Select a service to book your appointment.</p>
                  </div>
                </div>

                {!services?.length ? (
                  <EmptyState icon={Wrench} title="No services listed" description="This garage hasn't added any services yet." />
                ) : (
                  <div className="space-y-4">
                    {services.map((s, i) => (
                      <motion.div 
                        key={s._id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-[1.5rem] border-hairline hover:border-primary/30 transition-all duration-300 hover:shadow-card hover:-translate-y-1 bg-surface">
                          <div className="flex items-start gap-4 mb-4 sm:mb-0">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <Wrench className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-extrabold text-content text-lg leading-tight">{s.name}</h3>
                                <Badge className="bg-accent text-[10px] font-bold text-content-secondary px-2 uppercase tracking-widest">{s.category || 'Service'}</Badge>
                              </div>
                              <p className="text-sm text-content-secondary line-clamp-1 mb-2">{s.description || 'Professional automotive service using high quality products.'}</p>
                              <div className="flex items-center gap-3 text-[13px] font-bold text-content-secondary">
                                <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border border-hairline"><Clock className="h-3.5 w-3.5" /> {minutesToLabel(s.durationMinutes)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t border-hairline sm:border-t-0 mt-2 sm:mt-0">
                            <div className="text-left sm:text-right">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Starting at</p>
                              <p className="tabular text-xl font-extrabold text-primary leading-tight">{currency(s.price)}</p>
                            </div>
                            <Link to={`/customer/bookings/new?garageId=${garage._id}&serviceId=${s._id}`} className="shrink-0">
                              <Button className="rounded-xl shadow-md group-hover:shadow-lg transition-shadow px-6 font-bold h-11">Book <span className="hidden sm:inline ml-1">Now</span></Button>
                            </Link>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </FadeUp>

            <hr className="border-hairline" />

            {/* About & Info */}
            <FadeUp delay={0.2}>
              <h2 className="text-2xl font-extrabold text-content mb-6">About the garage</h2>
              <p className="text-content-secondary font-medium leading-relaxed mb-8 text-base">
                {garage.description || `Welcome to ${garage.name}. We are a premium automotive care facility dedicated to providing top-tier service. Our experienced technicians use state-of-the-art equipment to ensure your vehicle receives the best treatment possible.`}
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                <Card className="p-6 rounded-[1.5rem] border-hairline shadow-sm bg-surface">
                  <h3 className="flex items-center gap-2 font-extrabold text-content mb-4"><Clock className="h-5 w-5 text-primary" /> Working Hours</h3>
                  <ul className="space-y-3 text-sm">
                    {(garage.workingHours || []).slice().sort((a, b) => a.day - b.day).map((w) => {
                      const today = new Date().getDay() === w.day
                      return (
                        <li key={w.day} className={cn("flex justify-between items-center", today ? "font-bold text-primary" : "font-medium text-content-secondary")}>
                          <span className="flex items-center gap-2">{DAYS[w.day]} {today && <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 uppercase">Today</Badge>}</span>
                          <span className={cn("tabular", w.isClosed ? "text-danger" : "text-content")}>{w.isClosed ? 'Closed' : `${w.open} – ${w.close}`}</span>
                        </li>
                      )
                    })}
                  </ul>
                </Card>

                <Card className="p-6 rounded-[1.5rem] border-hairline shadow-sm bg-surface flex flex-col">
                  <h3 className="flex items-center gap-2 font-extrabold text-content mb-4"><Info className="h-5 w-5 text-primary" /> Amenities & Features</h3>
                  <div className="flex flex-wrap gap-2 mb-auto">
                    {['Waiting lounge', 'Card accepted', 'Free WiFi', 'Restrooms', 'Free Coffee', `${garage.serviceBays || 2} Service Bays`].map((a) => (
                      <Badge key={a} variant="secondary" className="font-semibold px-3 py-1.5 rounded-lg border-hairline">{a}</Badge>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-hairline">
                    <p className="text-xs font-bold text-content-muted uppercase tracking-widest mb-2">Member Since</p>
                    <p className="font-bold text-content">{formatDate(garage.createdAt || new Date())}</p>
                  </div>
                </Card>
              </div>
            </FadeUp>

            <hr className="border-hairline" />

            {/* Location Section */}
            <FadeUp delay={0.3}>
              <div id="location-section">
                <h2 className="text-2xl font-extrabold text-content mb-6">Location</h2>
                <Card className="rounded-[1.5rem] border-hairline shadow-sm overflow-hidden bg-surface">
                  <div className="h-64 sm:h-80 relative group overflow-hidden bg-accent flex flex-col items-center justify-center">
                    {/* Placeholder for real map */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                    <MapPin className="h-10 w-10 text-primary mb-3 relative z-10" />
                    <p className="font-extrabold text-content relative z-10 text-lg">Interactive Map Layer</p>
                    <p className="text-sm font-medium text-content-secondary mt-1 relative z-10">Integration ready</p>
                    <div className="absolute bottom-4 right-4 z-10">
                      <Button variant="secondary" className="rounded-xl shadow-md font-bold bg-background hover:bg-surface">
                        <Navigation className="h-4 w-4 mr-2" /> Directions
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-extrabold text-content text-lg mb-1">{garage.name}</h3>
                    <p className="text-content-secondary font-medium flex items-start gap-2">
                      <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      {garage.address || 'Address on request'}
                    </p>
                  </div>
                </Card>
              </div>
            </FadeUp>

            <hr className="border-hairline" />

            {/* Reviews Section */}
            <FadeUp delay={0.4}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extrabold text-content flex items-center gap-2">
                  <Star className="h-6 w-6 fill-content text-content" />
                  {rating.toFixed(1)} · {total} Reviews
                </h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8 mb-8">
                {/* Rating bars */}
                <div className="space-y-2">
                  {ratingCounts.map(({ n, c }) => (
                    <div key={n} className="flex items-center gap-3 text-sm font-semibold group">
                      <span className="w-2 shrink-0 text-content">{n}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
                        <div className="h-full bg-content transition-all duration-1000" style={{ width: total ? `${(c / total) * 100}%` : '0%' }} />
                      </div>
                      <span className="w-8 shrink-0 text-right tabular text-content-secondary">{c}</span>
                    </div>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-bold text-content-muted uppercase tracking-widest mb-1">Cleanliness</p>
                    <p className="text-xl font-extrabold text-content">4.9</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-bold text-content-muted uppercase tracking-widest mb-1">Accuracy</p>
                    <p className="text-xl font-extrabold text-content">4.8</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-bold text-content-muted uppercase tracking-widest mb-1">Communication</p>
                    <p className="text-xl font-extrabold text-content">4.9</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-bold text-content-muted uppercase tracking-widest mb-1">Value</p>
                    <p className="text-xl font-extrabold text-content">4.7</p>
                  </div>
                </div>
              </div>

              {!reviews?.length ? (
                <EmptyState icon={MessageSquare} title="No reviews yet" description="This garage is waiting for its first review." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {reviews.slice(0, 6).map((r) => (
                    <div key={r._id} className="p-6 rounded-[1.5rem] border border-hairline bg-surface shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-extrabold text-primary border border-primary/10 shrink-0">
                          {r.customerName ? r.customerName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-extrabold text-content leading-tight">{r.customerName || 'Customer'}</p>
                          <p className="text-xs font-semibold text-content-secondary mt-0.5">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        <Stars value={r.rating} size="sm" />
                      </div>
                      {r.comment && <p className="text-sm font-medium text-content-secondary leading-relaxed line-clamp-4">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {reviews?.length > 6 && (
                <div className="mt-8">
                  <Button variant="secondary" className="rounded-xl font-bold h-12 px-6 border-hairline hover:border-control">
                    Show all {total} reviews
                  </Button>
                </div>
              )}
            </FadeUp>

          </div>
          
          {/* Right Column: Sticky Booking Widget (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-28 z-30">
              <Card className="p-6 rounded-[2rem] border-hairline shadow-card overflow-hidden bg-surface relative">
                {/* Subtle gradient accent */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
                
                <h3 className="text-2xl font-extrabold text-content mb-1">
                  {startingPrice > 0 ? (
                    <span className="flex items-baseline gap-1">
                      {currency(startingPrice)} <span className="text-base font-semibold text-content-secondary">starting price</span>
                    </span>
                  ) : (
                    "Book a Service"
                  )}
                </h3>
                <p className="text-sm font-medium text-content-secondary flex items-center gap-1.5 mb-6">
                  <Star className="h-4 w-4 fill-primary text-primary" /> 
                  <span className="font-bold text-content">{rating.toFixed(1)}</span>
                  · <span className="underline">{total} reviews</span>
                </p>
                
                <div className="rounded-[1rem] border border-hairline overflow-hidden mb-6">
                  <div className="p-3 border-b border-hairline hover:bg-accent-light transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Date</p>
                    <p className="font-extrabold text-sm text-content">Select a date in next step</p>
                  </div>
                  <div className="p-3 hover:bg-accent-light transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Service</p>
                    <p className="font-extrabold text-sm text-content">Choose from {services?.length || 0} options</p>
                  </div>
                </div>

                <Link to={`/customer/bookings/new?garageId=${garage._id}`} className="block w-full">
                  <Button className="w-full h-14 rounded-xl text-lg font-extrabold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary-deep text-white group">
                    Reserve
                    <ChevronRight className="h-5 w-5 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
                
                <p className="text-xs font-semibold text-content-muted text-center mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> You won't be charged yet
                </p>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Booking CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/95 p-4 backdrop-blur-xl lg:hidden flex items-center justify-between gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div>
           <p className="font-extrabold text-content text-lg">
             {startingPrice > 0 ? currency(startingPrice) : "Book Now"}
           </p>
           <p className="text-xs font-bold text-content-secondary underline">{total} reviews</p>
        </div>
        <Link to={`/customer/bookings/new?garageId=${garage._id}`} className="flex-1 max-w-[200px]">
          <Button className="w-full rounded-xl font-bold h-12 shadow-md">Reserve</Button>
        </Link>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8" 
            onClick={() => setLightbox(null)}
          >
            <button className="absolute right-4 sm:right-8 top-4 sm:top-8 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
              <X className="h-8 w-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="h-[80vh] w-full max-w-5xl rounded-[1.5rem] overflow-hidden bg-transparent flex items-center justify-center" 
            >
              {typeof lightbox === 'string' && lightbox.startsWith('http') ? (
                <img src={lightbox} alt="Garage" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-[1.5rem]" style={{ background: lightbox }} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
