import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, Star, BadgeCheck, Upload, Trash2, ImageIcon, Eye, EyeOff, Pencil, Check } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { useMyGarage, useUpdateGarage, useUploadGallery } from '../../hooks/useOwner.js'
import { cn } from '../../lib/utils.js'

function completion(g) {
  const checks = [g.name, g.description, g.address, g.images?.length, g.workingHours?.length, g.amenities?.length]
  const done = checks.filter(Boolean).length
  const pct = Math.round((done / checks.length) * 100)
  let tip = 'Your profile looks great!'
  if (!g.images?.length) tip = 'Add gallery photos to attract more customers.'
  else if (!g.description) tip = 'Add a description so customers know what you offer.'
  else if (!g.amenities?.length) tip = 'List amenities (WiFi, lounge…) to stand out.'
  else if (!g.address) tip = 'Add your address so customers can find you.'
  return { pct, tip }
}

export default function GarageProfile() {
  const { data: garage, isLoading } = useMyGarage()
  const update = useUpdateGarage()
  const upload = useUploadGallery()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(false)

  if (isLoading) return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-28" /><Skeleton className="h-64" /></div>
  if (!garage) return (
    <div className="mx-auto max-w-md text-center">
      <Card className="p-8">
        <Store className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="font-semibold text-content">No garage yet</h2>
        <p className="mt-1 text-sm text-content-secondary">Create your garage profile to get started.</p>
      </Card>
    </div>
  )

  const { pct, tip } = completion(garage)
  const images = garage.images || []
  const isUrl = (s) => typeof s === 'string' && s.startsWith('http')

  const removeImage = (img) => update.mutate({ id: garage._id, body: { images: images.filter((x) => x !== img) } })
  const setCover = (img) => update.mutate({ id: garage._id, body: { images: [img, ...images.filter((x) => x !== img)] } })
  const onFiles = (e) => { if (e.target.files?.length) upload.mutate(Array.from(e.target.files)); e.target.value = '' }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-content">Garage Profile</h1>
          <p className="text-content-secondary">How customers see your garage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {preview ? 'Exit preview' : 'Preview as customer'}
          </Button>
          <Link to="/garage/profile/edit"><Button size="sm"><Pencil className="h-4 w-4" /> Edit</Button></Link>
        </div>
      </div>

      {/* Completion bar */}
      {!preview && (
        <Card className="mb-4 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-content">Profile completion</span>
            <span className="tabular font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-accent-light"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-sm text-content-secondary">{tip}</p>
        </Card>
      )}

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="h-36 bg-accent-light" style={isUrl(images[0]) ? { backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-content">{garage.name}</h2>
                {garage.verificationStatus === 'APPROVED' && <BadgeCheck className="h-5 w-5 text-primary" />}
              </div>
              <p className="mt-1 text-sm text-content-secondary">{garage.address || 'No address set'}</p>
            </div>
            <Badge className={garage.verificationStatus === 'APPROVED' ? 'bg-accent-light text-primary' : 'bg-accent-light text-primary-deep'}>{garage.verificationStatus}</Badge>
          </div>
          <p className="mt-3 text-sm text-content-secondary">{garage.description || 'No description yet.'}</p>

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-hairline rounded-control border border-hairline">
            <Stat label="Rating" value={<span className="flex items-center justify-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{(garage.rating || 0).toFixed(1)}</span>} />
            <Stat label="Service bays" value={garage.serviceBays} />
            <Stat label="Amenities" value={garage.amenities?.length || 0} />
          </div>
        </CardContent>
      </Card>

      {/* Gallery manager */}
      {!preview && (
        <Card className="mt-4">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-content">Gallery</h3>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
              <Button size="sm" variant="secondary" loading={upload.isPending} onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload</Button>
            </div>
            {!images.length ? (
              <div className="flex flex-col items-center rounded-control border border-dashed border-control py-10 text-content-muted">
                <ImageIcon className="mb-2 h-6 w-6" /> No images yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((img, i) => (
                  <div key={img} className="group relative overflow-hidden rounded-control">
                    <div className="h-24 bg-accent-light" style={isUrl(img) ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: img }} />
                    {i === 0 && <Badge className="absolute left-1 top-1 bg-primary text-primary-foreground text-[10px]">Cover</Badge>}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[var(--primary-deep)]/50 opacity-0 transition group-hover:opacity-100">
                      {i !== 0 && <button onClick={() => setCover(img)} title="Set as cover" className="rounded-full bg-white p-1.5 text-primary"><Check className="h-4 w-4" /></button>}
                      <button onClick={() => removeImage(img)} title="Remove" className="rounded-full bg-white p-1.5 text-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="px-3 py-3 text-center">
      <p className="text-base font-semibold text-content">{value}</p>
      <p className="text-xs text-content-secondary">{label}</p>
    </div>
  )
}
