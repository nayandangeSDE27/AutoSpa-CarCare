import { Card, CardContent } from '../components/ui/Card.jsx'

/**
 * Themed placeholder used for every route until the real pages land (7b–7e).
 * Confirms routing + guards + layouts without any real page content.
 */
export default function PagePlaceholder({ title, subtitle }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-semibold text-content">{title}</h1>
      {subtitle && <p className="mt-1 text-content-secondary">{subtitle}</p>}
      <Card className="mt-5">
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-content-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Placeholder — real page arrives in a later sub-phase.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
