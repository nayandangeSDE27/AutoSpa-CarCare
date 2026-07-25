import { Card } from './Card.jsx'

export function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-control bg-accent-light">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <p className="tabular text-2xl font-semibold text-content">{value}</p>
          <p className="text-xs text-content-secondary">{label}</p>
        </div>
      </div>
    </Card>
  )
}

export default StatCard
