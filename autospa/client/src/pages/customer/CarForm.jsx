import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Car, ShieldCheck, CheckCircle2, Search, ChevronRight, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card } from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { cn } from '../../lib/utils.js'
import { useCar, useCreateCar, useUpdateCar } from '../../hooks/useCars.js'
import { Badge } from '../../components/ui/Badge.jsx'

const INDIAN_MAKES = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'Volkswagen', 'Renault', 'Skoda', 'MG', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Other']
const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Orange']
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
const COLOR_HEX = { White: '#f8f9fa', Black: '#111827', Silver: '#c0c5cc', Grey: '#6b7280', Red: '#dc2626', Blue: '#2563eb', Green: '#16a34a', Yellow: '#eab308', Orange: '#f97316' }

// Allow spaces in regex for formatted display
const PLATE_RE = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/

const schema = z.object({
  make: z.string().min(1, 'Select a make'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    return Number(val);
  }, z.number().int().min(1990, 'Too old').max(2100, 'Invalid year').optional()),
  color: z.string().min(1, 'Pick a color'),
  licensePlate: z.string().trim().toUpperCase().regex(PLATE_RE, 'Format like KA01 AB 1234'),
  fuelType: z.string().optional(),
})

// Auto-formatter: ka01ab1234 -> KA01 AB 1234
function formatLicensePlate(value = '') {
  if (!value) return ''
  let v = String(value).toUpperCase().replace(/\s+/g, '')
  if (v.length > 2 && v.length <= 4 && !isNaN(v[2])) {
    v = v.slice(0, 2) + ' ' + v.slice(2)
  } else if (v.length > 4) {
    const p1 = v.slice(0, 2)
    let p2 = ''
    let p3 = ''
    let p4 = ''
    
    // Attempt to extract the 2 digits
    let i = 2
    while (i < v.length && !isNaN(v[i])) {
      p2 += v[i]
      i++
    }
    
    // Attempt to extract the middle letters
    while (i < v.length && isNaN(v[i])) {
      p3 += v[i]
      i++
    }
    
    // Remaining digits
    p4 = v.slice(i)
    
    return [p1, p2, p3 + p4].filter(Boolean).join(' ')
  }
  return v
}

function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }} className={className}>
      {children}
    </motion.div>
  )
}

function SearchableSelect({ value, onChange, options, error }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border bg-surface px-4 text-sm font-medium transition-all shadow-sm",
          open ? "border-primary ring-2 ring-primary/20" : "border-control hover:border-primary/50",
          error ? "border-danger ring-danger/20" : ""
        )}
      >
        <span className={value ? 'text-content' : 'text-content-muted'}>{value || 'Select manufacturer...'}</span>
        <ChevronRight className={cn("h-4 w-4 text-content-muted transition-transform", open ? "rotate-90" : "")} />
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-hairline bg-surface shadow-card"
          >
            <div className="flex items-center gap-2 border-b border-hairline px-3 py-2 bg-background">
              <Search className="h-4 w-4 text-content-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-transparent text-sm focus:outline-none" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.map(opt => (
                <div 
                  key={opt} 
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-content-secondary hover:bg-accent-light hover:text-content transition-colors"
                >
                  {opt}
                </div>
              ))}
              {filtered.length === 0 && <div className="px-3 py-4 text-center text-sm text-content-muted">No matches found.</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CarForm() {
  const { carId } = useParams()
  const isEdit = Boolean(carId)
  const navigate = useNavigate()
  const { data: car, isLoading } = useCar(carId)
  const create = useCreateCar()
  const update = useUpdateCar()

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { make: '', model: '', color: 'White', fuelType: 'Petrol' },
  })

  // Watch fields for live preview
  const wMake = watch('make')
  const wModel = watch('model')
  const wYear = watch('year')
  const wColor = watch('color')
  const wPlate = watch('licensePlate')
  const wFuel = watch('fuelType')

  useEffect(() => {
    if (car) {
      reset({ 
        make: car.make, 
        model: car.model, 
        year: car.year, 
        color: car.color ? car.color.charAt(0).toUpperCase() + car.color.slice(1).toLowerCase() : 'White', 
        licensePlate: formatLicensePlate(car.licensePlate || ''), 
        fuelType: car.fuelType || 'Petrol' 
      })
    }
  }, [car, reset])

  const onSubmit = async (values) => {
    // Strip spaces before sending to API
    const finalValues = { ...values, licensePlate: values.licensePlate.replace(/\s+/g, '') }
    if (isEdit) await update.mutateAsync({ id: carId, body: finalValues })
    else await create.mutateAsync(finalValues)
    navigate('/customer/cars')
  }

  if (isEdit && isLoading) return <div className="mx-auto max-w-lg"><Skeleton className="h-[500px] rounded-[2rem]" /></div>

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <button onClick={() => navigate('/customer/cars')} className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-content-secondary hover:text-content transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Garage
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-content tracking-tight">{isEdit ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h1>
        <p className="mt-2 text-content-secondary font-medium">Add your vehicle to enable faster bookings and personalized care.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Live Preview & Benefits */}
        <div className="lg:col-span-5 space-y-6">
          <FadeUp delay={0.1}>
            <Card className="overflow-hidden rounded-[2rem] border-hairline shadow-soft bg-gradient-to-br from-surface to-background">
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-accent-light flex items-center justify-center shadow-sm">
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                  {wFuel && (
                    <Badge variant="secondary" className="font-bold px-3 py-1.5 bg-background shadow-sm border border-hairline">
                      {wFuel}
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-2xl font-extrabold text-content tracking-tight mb-1">
                  {wMake || 'Vehicle Make'}
                </h2>
                <p className="text-[17px] font-semibold text-content-secondary">
                  {wModel || 'Model'} {wYear ? `(${wYear})` : ''}
                </p>

                <div className="mt-10 flex items-center justify-between">
                  <div className="px-4 py-2 rounded-xl border-2 border-control bg-background flex flex-col items-center justify-center shadow-inner min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-0.5">Registration</span>
                    <span className="tabular uppercase font-extrabold text-[15px] text-content tracking-wider">
                      {wPlate || 'KA01 AB 1234'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-1.5 mr-1">Color</span>
                    <div 
                      className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm ring-1 ring-black/5 transition-colors duration-300"
                      style={{ backgroundColor: COLOR_HEX[wColor] || COLOR_HEX['White'] }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="rounded-[2rem] border border-hairline bg-surface p-8 shadow-sm">
              <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-content mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Why add your vehicle?
              </h3>
              <ul className="space-y-4">
                {[
                  { title: 'Faster Bookings', desc: 'Skip entering details every time you book a wash.' },
                  { title: 'Personalized Services', desc: 'Get recommendations based on your car type.' },
                  { title: 'Service History', desc: 'Track all past washes and maintenance.' }
                ].map((benefit) => (
                  <li key={benefit.title} className="flex gap-3.5">
                    <div className="mt-0.5"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-sm font-bold text-content">{benefit.title}</p>
                      <p className="text-[13px] font-medium text-content-secondary mt-0.5 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <FadeUp delay={0.3}>
            <Card className="p-8 rounded-[2rem] border-hairline shadow-soft bg-surface">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                
                {/* Make */}
                <div>
                  <label className="mb-2 block text-sm font-extrabold text-content">Manufacturer</label>
                  <Controller
                    control={control}
                    name="make"
                    render={({ field }) => (
                      <SearchableSelect 
                        options={INDIAN_MAKES} 
                        value={field.value} 
                        onChange={field.onChange} 
                        error={errors.make}
                      />
                    )}
                  />
                  {errors.make && <p className="mt-2 text-sm font-semibold text-danger">{errors.make.message}</p>}
                </div>

                {/* Model & Year */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-content">Model</label>
                    <Input 
                      placeholder="e.g. Swift, City, Creta" 
                      error={errors.model?.message} 
                      {...register('model')} 
                      className="h-12 rounded-xl bg-background"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-content">Year <span className="text-content-muted font-medium">(Optional)</span></label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 2023" 
                      error={errors.year?.message} 
                      {...register('year')} 
                      className="h-12 rounded-xl bg-background"
                    />
                  </div>
                </div>

                {/* Registration */}
                <div>
                  <label className="mb-2 block text-sm font-extrabold text-content">Registration Number</label>
                  <Controller
                    control={control}
                    name="licensePlate"
                    render={({ field }) => (
                      <Input 
                        placeholder="KA01 AB 1234" 
                        className="h-12 rounded-xl bg-background tabular uppercase font-bold tracking-wider" 
                        error={errors.licensePlate?.message} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(formatLicensePlate(e.target.value))}
                      />
                    )}
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="mb-3 block text-sm font-extrabold text-content">Vehicle Color</label>
                  <Controller
                    control={control}
                    name="color"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((c) => (
                          <div key={c} className="relative group cursor-pointer" onClick={() => field.onChange(c)}>
                            <div 
                              className={cn(
                                'h-10 w-10 rounded-full border-[3px] shadow-sm transition-all duration-300', 
                                field.value === c ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-white ring-1 ring-black/5 hover:scale-110'
                              )}
                              style={{ background: COLOR_HEX[c] }}
                            />
                            {/* Color Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2.5 py-1 bg-content text-background text-[11px] font-bold rounded-lg whitespace-nowrap shadow-md">
                              {c}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-content" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.color && <p className="mt-2 text-sm font-semibold text-danger">{errors.color.message}</p>}
                </div>

                {/* Fuel Type (Segmented Cards) */}
                <div>
                  <label className="mb-3 block text-sm font-extrabold text-content">Fuel Type</label>
                  <Controller
                    control={control}
                    name="fuelType"
                    render={({ field }) => (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                        {FUELS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => field.onChange(f)}
                            className={cn(
                              "h-12 rounded-xl text-[13px] font-bold transition-all duration-300 shadow-sm border",
                              field.value === f 
                                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20" 
                                : "bg-background text-content-secondary border-control hover:border-primary/40 hover:text-content"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-6 mt-6 border-t border-hairline/60">
                  <div className="flex gap-4">
                    <Button type="button" variant="secondary" className="flex-1 rounded-xl h-12 shadow-sm border-hairline bg-background hover:bg-accent-light" onClick={() => navigate('/customer/cars')}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-[2] rounded-xl h-12 shadow-md hover:shadow-card text-sm" loading={isSubmitting}>
                      {isEdit ? 'Save Changes' : 'Save Vehicle'}
                    </Button>
                  </div>
                </div>

              </form>
            </Card>
          </FadeUp>

          {/* Secure Info Footer */}
          <FadeUp delay={0.4}>
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-accent-light/50 border border-hairline">
              <Shield className="h-5 w-5 text-content-muted shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-content-secondary leading-relaxed">
                Your vehicle information is securely stored and used exclusively to streamline your booking experience and provide tailored service recommendations.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}
