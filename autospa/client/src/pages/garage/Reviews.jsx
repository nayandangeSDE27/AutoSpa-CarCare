import { useMemo, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Stars } from '../../components/ui/Stars.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { formatDate } from '../../lib/format.js'
import { useMyGarage } from '../../hooks/useOwner.js'
import { useGarageReviews, useReplyToReview } from '../../hooks/useReviews.js'

export default function Reviews() {
  const { data: garage } = useMyGarage()
  const { data: reviews, isLoading } = useGarageReviews(garage?._id)
  const reply = useReplyToReview()
  const [tab, setTab] = useState('all')
  const [replyFor, setReplyFor] = useState(null)
  const [text, setText] = useState('')

  const total = reviews?.length || 0
  const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0.0'
  const breakdown = useMemo(() => [5, 4, 3, 2, 1].map((n) => ({ n, c: (reviews || []).filter((r) => r.rating === n).length })), [reviews])

  const filtered = (reviews || []).filter((r) => {
    if (tab === 'all') return true
    if (tab === 'unreplied') return !r.reply
    return r.rating === Number(tab)
  })

  const submitReply = async (id) => {
    await reply.mutateAsync({ id, reply: text }).then(() => { setReplyFor(null); setText('') }).catch(() => {})
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Reviews</h1>
      <p className="mb-5 text-content-secondary">Respond publicly to build trust.</p>

      {isLoading ? <Skeleton className="h-28" /> : (
        <Card className="mb-5"><CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="tabular text-4xl font-semibold text-content">{avg}</p>
              <Stars value={Number(avg)} size="sm" />
              <p className="mt-1 text-xs text-content-secondary">{total} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {breakdown.map(({ n, c }) => (
                <div key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-content-secondary">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent-light"><div className="h-full bg-primary" style={{ width: total ? `${(c / total) * 100}%` : '0%' }} /></div>
                  <span className="w-6 text-right tabular text-content-muted">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent></Card>
      )}

      <Tabs className="mb-5" active={tab} onChange={setTab} tabs={[{ key: 'all', label: 'All' }, { key: 'unreplied', label: 'Unreplied' }, { key: '5', label: '5★' }, { key: '4', label: '4★' }, { key: '3', label: '≤3★' }]} />

      {isLoading ? <Skeleton className="h-40" /> : !filtered.length ? (
        <EmptyState icon={Star} title="No reviews" />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r._id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-content">{r.customerName || 'Customer'}</p>
                <Stars value={r.rating} size="sm" />
              </div>
              {r.comment && <p className="mt-2 text-sm text-content-secondary">{r.comment}</p>}
              <p className="mt-1 text-xs text-content-muted">{formatDate(r.createdAt)}</p>

              {r.reply ? (
                <div className="mt-3 rounded-control bg-accent-light p-3">
                  <p className="text-xs font-semibold text-primary-deep">Your reply</p>
                  <p className="text-sm text-content-secondary">{r.reply}</p>
                </div>
              ) : replyFor === r._id ? (
                <div className="mt-3 space-y-2">
                  <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a public reply…" className="w-full rounded-control border border-control bg-surface p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setReplyFor(null)}>Cancel</Button>
                    <Button size="sm" loading={reply.isPending} onClick={() => submitReply(r._id)}>Post reply</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => { setReplyFor(r._id); setText('') }}><MessageSquare className="h-4 w-4" /> Reply</Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
