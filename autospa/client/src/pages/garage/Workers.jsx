import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { cn } from '../../lib/utils.js'
import { useWorkers, useWorkerMutations } from '../../hooks/useOwner.js'

const STATUSES = ['available', 'busy', 'off']
const DOT = { available: 'bg-primary', busy: 'bg-amber-500', off: 'bg-content-muted' }

export default function Workers() {
  const { data: workers, isLoading } = useWorkers()
  const { create, remove, setStatus } = useWorkerMutations()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', speciality: '' })

  const submit = async () => {
    if (!form.name.trim()) return
    await create.mutateAsync(form).catch(() => {})
    if (!create.isError) { setOpen(false); setForm({ name: '', phone: '', speciality: '' }) }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-content">Workers</h1><p className="text-content-secondary">Your team and their availability.</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add worker</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : !workers?.length ? (
        <EmptyState icon={Users} title="No workers yet" description="Add workers so you can assign them to jobs." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add worker</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => {
            const util = Math.min(100, (w.todayJobs || 0) * 25)
            return (
              <Card key={w._id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent-mid text-sm font-semibold text-primary-deep">
                      {w.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface', DOT[w.status])} />
                    </div>
                    <div>
                      <p className="font-semibold text-content">{w.name}</p>
                      <p className="text-xs text-content-secondary">{w.speciality || 'General'}</p>
                    </div>
                  </div>
                  <button onClick={() => window.confirm(`Remove ${w.name}?`) && remove.mutate(w._id)} className="rounded p-1.5 text-content-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </div>
                {w.phone && <p className="mt-2 text-sm text-content-secondary tabular">{w.phone}</p>}

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-content-muted"><span>Today: {w.todayJobs || 0} jobs</span><span>{util}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-accent-light"><div className="h-full bg-primary" style={{ width: `${util}%` }} /></div>
                </div>

                <div className="mt-4 flex gap-1">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatus.mutate({ id: w._id, status: s })}
                      className={cn('flex-1 rounded-control py-1.5 text-xs font-medium capitalize transition', w.status === s ? 'bg-primary text-primary-foreground' : 'bg-accent-light text-content-secondary hover:text-content')}>
                      {s}
                    </button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add worker"
        footer={<><Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" loading={create.isPending} onClick={submit}>Add</Button></>}>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Speciality" placeholder="e.g. Detailing" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
