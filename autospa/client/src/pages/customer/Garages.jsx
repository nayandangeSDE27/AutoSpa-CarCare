import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Store, Map as MapIcon } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { useGarages, useNearbyGarages } from '../../hooks/useGarages.js'
import { distanceKm, isOpenNow } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'

const CHIPS = [
  { key: 'open', label: 'Open now' },
  { key: 'featured', label: 'Featured' },
  { key: 'top', label: 'Top rated' },
]

export default function Garages() {
  const [searchParams] = useSearchParams()
  const [coords, setCoords] = useState(null)
  const [geoAsked, setGeoAsked] = useState(false)
  const [q, setQ] = useState(searchParams.get('q') || '') // pre-filter from global search
  const [chips, setChips] = useState([])
  const [sort, setSort] = useState('distance')

  useEffect(() => {
    if (!('geolocation' in navigator)) { setGeoAsked(true); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoAsked(true) },
      () => setGeoAsked(true),
      { timeout: 8000 }
    )
  }, [])

  const nearby = useNearbyGarages(coords)
  const all = useGarages()
  const isLoading = coords ? nearby.isLoading : all.isLoading
  const source = (coords && nearby.data) ? nearby.data : all.data

  const toggleChip = (k) => setChips((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]))

  const garages = useMemo(() => {
    let list = (source || []).map((g) => ({
      ...g,
      _km: coords ? distanceKm(coords.lat, coords.lng, g.location.coordinates[1], g.location.coordinates[0]) : null,
      _open: isOpenNow(g),
    }))
    if (q.trim()) list = list.filter((g) => g.name.toLowerCase().includes(q.trim().toLowerCase()))
    if (chips.includes('open')) list = list.filter((g) => g._open)
    if (chips.includes('featured')) list = list.filter((g) => g.isFeatured)
    if (chips.includes('top')) list = list.filter((g) => (g.rating || 0) >= 4.5)
    list.sort((a, b) => {
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (a._km == null || b._km == null) return 0
      return a._km - b._km
    })
    return list
  }, [source, coords, q, chips, sort])

  const resetFilters = () => { setQ(''); setChips([]); setSort('distance') }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-content">Garages</h1>
        <p className="text-content-secondary">
          {coords ? 'Sorted by distance from your location.' : geoAsked ? 'Enable location to sort by distance.' : 'Finding garages near you…'}
        </p>
      </div>

      {/* Search + sort */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input placeholder="Search garages…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-control border border-control bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
          <option value="distance">Sort: Distance</option>
          <option value="rating">Sort: Rating</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Filter chips + map seam */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => toggleChip(c.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition',
              chips.includes(c.key) ? 'border-primary bg-accent-light text-primary' : 'border-control text-content-secondary hover:border-strong'
            )}
          >
            {c.label}
          </button>
        ))}
        {/* Clean seam for the future Google Map layer (no key required now). */}
        <button className="ml-auto flex items-center gap-1.5 rounded-full border border-dashed border-control px-3 py-1.5 text-sm text-content-muted" title="Map view coming soon" disabled>
          <MapIcon className="h-4 w-4" /> Map view
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !garages.length ? (
        <EmptyState icon={Store} title="No garages match" description="Try clearing your search and filters." action={<Button variant="secondary" onClick={resetFilters}>Reset filters</Button>} />
      ) : (
        <div className="space-y-3">
          {garages.map((g) => (
            <Card key={g._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-control bg-accent-light">
                <Store className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-content">{g.name}</h3>
                  {g.isFeatured && <Badge className="bg-accent-mid text-primary-deep">Featured</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-content-secondary">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /> {(g.rating || 0).toFixed(1)}</span>
                  {g._km != null && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {g._km.toFixed(1)} km</span>}
                  {g._open === true && <Badge className="bg-accent-light text-primary">Open</Badge>}
                  {g._open === false && <Badge className="bg-danger/10 text-danger">Closed</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/customer/garages/${g._id}`}><Button variant="secondary" size="sm">Details</Button></Link>
                <Link to={`/customer/bookings/new?garageId=${g._id}`}><Button size="sm">Book</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
