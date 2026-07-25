import { Link } from 'react-router-dom'
import { Car as CarIcon, Plus, Pencil, Trash2 } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { useCars, useDeleteCar } from '../../hooks/useCars.js'

const COLOR_HEX = { white: '#e5e7eb', black: '#111827', silver: '#c0c5cc', grey: '#6b7280', red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#eab308', orange: '#f97316' }

function dot(color) {
  return COLOR_HEX[(color || '').toLowerCase()] || '#8fe8ce'
}

export default function Cars() {
  const { data: cars, isLoading } = useCars()
  const del = useDeleteCar()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-content">My Cars</h1>
          <p className="text-content-secondary">Manage the vehicles you book services for.</p>
        </div>
        <Link to="/customer/cars/new" className="hidden sm:block">
          <Button><Plus className="h-4 w-4" /> Add car</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : !cars?.length ? (
        <EmptyState
          icon={CarIcon}
          title="No cars yet"
          description="Add your first car to start booking services."
          action={<Link to="/customer/cars/new"><Button><Plus className="h-4 w-4" /> Add car</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Card key={car._id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full border border-hairline" style={{ background: dot(car.color) }} />
                  <div>
                    <p className="font-semibold text-content">{car.make} {car.model}</p>
                    <p className="text-sm text-content-secondary">{car.year || '—'}</p>
                  </div>
                </div>
                <span className="tabular rounded-control bg-accent-light px-2 py-1 text-xs font-semibold text-primary-deep">{car.licensePlate}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/customer/cars/${car._id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full"><Pencil className="h-4 w-4" /> Edit</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.confirm(`Remove ${car.make} ${car.model}?`) && del.mutate(car._id)}
                  aria-label="Delete car"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </Card>
          ))}
          <Link to="/customer/cars/new">
            <Card className="flex h-full min-h-[8rem] items-center justify-center border-dashed p-5 text-content-secondary hover:border-primary hover:text-primary">
              <span className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add car</span>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
