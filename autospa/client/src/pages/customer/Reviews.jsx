import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Pencil, Trash2 } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Stars } from '../../components/ui/Stars.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatDate } from '../../lib/format.js'
import { usePendingReviews, useMyReviews, useCreateReview, useUpdateReview, useDeleteReview } from '../../hooks/useReviews.js'

const EDIT_WINDOW = 24 * 60 * 60 * 1000

export default function Reviews() {
  const pending = usePendingReviews()
  const mine = useMyReviews()
  const create = useCreateReview()
  const update = useUpdateReview()
  const del = useDeleteReview()

  const [editor, setEditor] = useState(null) // { mode:'create'|'edit', booking?, review? }
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const openCreate = (booking) => { setEditor({ mode: 'create', booking }); setRating(5); setComment('') }
  const openEdit = (review) => { setEditor({ mode: 'edit', review }); setRating(review.rating); setComment(review.comment || '') }

  const submit = async () => {
    if (editor.mode === 'create') await create.mutateAsync({ bookingId: editor.booking._id, rating, comment }).catch(() => {})
    else await update.mutateAsync({ id: editor.review._id, body: { rating, comment } }).catch(() => {})
    setEditor(null)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Reviews</h1>
      <p className="mb-6 text-content-secondary">Share your experience and manage past reviews.</p>

      {/* Pending */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-content">Awaiting your review</h2>
        {pending.isLoading ? <Skeleton className="h-20" /> : !pending.data?.length ? (
          <p className="text-sm text-content-muted">No completed bookings awaiting a review.</p>
        ) : (
          <div className="space-y-2">
            {pending.data.map((b) => (
              <Card key={b._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="tabular text-sm font-semibold text-content">{b.bookingNumber}</p>
                  <p className="text-sm text-content-secondary">{b.services.map((s) => s.nameAtBooking).join(', ')} · {formatDate(b.startTime)}</p>
                </div>
                <Button size="sm" onClick={() => openCreate(b)}><Star className="h-4 w-4" /> Review</Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Mine */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-content">My reviews</h2>
        {mine.isLoading ? <Skeleton className="h-20" /> : !mine.data?.length ? (
          <EmptyState icon={Star} title="No reviews yet" description="Reviews you write will appear here." />
        ) : (
          <div className="space-y-2">
            {mine.data.map((r) => {
              const editable = Date.now() - new Date(r.createdAt).getTime() < EDIT_WINDOW
              return (
                <Card key={r._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <Stars value={r.rating} size="sm" />
                    <div className="flex gap-1">
                      {editable && <button onClick={() => openEdit(r)} className="rounded p-1.5 text-content-muted hover:text-primary" aria-label="Edit"><Pencil className="h-4 w-4" /></button>}
                      <button onClick={() => window.confirm('Delete this review?') && del.mutate(r._id)} className="rounded p-1.5 text-content-muted hover:text-danger" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-content-secondary">{r.comment}</p>}
                  <p className="mt-2 text-xs text-content-muted">{formatDate(r.createdAt)}{!editable && ' · edit window closed'}</p>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor?.mode === 'edit' ? 'Edit review' : 'Write a review'}
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" loading={create.isPending || update.isPending} onClick={submit}>Submit</Button></>}
      >
        <div className="space-y-3">
          <Stars value={rating} onChange={setRating} size="lg" />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="How was the service?"
            className="w-full rounded-control border border-control bg-surface p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </Modal>
    </div>
  )
}
