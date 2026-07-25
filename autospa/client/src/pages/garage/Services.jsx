import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { cn } from '../../lib/utils.js'
import { currency, minutesToLabel } from '../../lib/format.js'
import { useOwnerServices, useServiceMutations } from '../../hooks/useOwner.js'

const CATEGORIES = ['wash', 'detail', 'interior', 'polish', 'other']
const empty = { name: '', category: 'wash', description: '', price: '', durationMinutes: '', isActive: true }

export default function Services() {
  const { data: services, isLoading } = useOwnerServices()
  const { create, update, remove } = useServiceMutations()
  const [tab, setTab] = useState('all')
  const [editor, setEditor] = useState(null) // {mode, service?}
  const [form, setForm] = useState(empty)

  const categories = useMemo(() => ['all', ...new Set((services || []).map((s) => s.category || 'other'))], [services])
  const filtered = (services || []).filter((s) => tab === 'all' || (s.category || 'other') === tab)

  const openAdd = () => { setForm(empty); setEditor({ mode: 'create' }) }
  const openEdit = (s) => { setForm({ name: s.name, category: s.category || 'other', description: s.description || '', price: s.price, durationMinutes: s.durationMinutes, isActive: s.isActive }); setEditor({ mode: 'edit', service: s }) }

  const submit = async () => {
    const body = { name: form.name, category: form.category, description: form.description, price: Number(form.price), durationMinutes: Number(form.durationMinutes), isActive: form.isActive }
    if (editor.mode === 'create') await create.mutateAsync(body).catch(() => {})
    else await update.mutateAsync({ id: editor.service._id, body }).catch(() => {})
    if (!create.isError && !update.isError) setEditor(null)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-content">Services</h1><p className="text-content-secondary">Your service catalogue.</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add service</Button>
      </div>

      <Tabs className="mb-5" active={tab} onChange={setTab} tabs={categories.map((c) => ({ key: c, label: c[0].toUpperCase() + c.slice(1) }))} />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !filtered.length ? (
        <EmptyState icon={Wrench} title="No services" description="Add your first service." action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add service</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <Card key={s._id} className={cn('p-4', !s.isActive && 'opacity-60')}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-content">{s.name}</p>
                  <p className="text-sm text-content-secondary">{s.description || '—'}</p>
                </div>
                <Badge className="bg-accent-light text-primary-deep">{minutesToLabel(s.durationMinutes)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="tabular text-xl font-semibold text-content">{currency(s.price)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => update.mutate({ id: s._id, body: { isActive: !s.isActive } })}
                    className={cn('rounded-full px-2.5 py-1 text-xs font-medium', s.isActive ? 'bg-accent-light text-primary' : 'bg-control text-content-muted')}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEdit(s)} className="rounded p-1.5 text-content-muted hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => window.confirm(`Delete ${s.name}?`) && remove.mutate(s._id)} className="rounded p-1.5 text-content-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor?.mode === 'edit' ? 'Edit service' : 'Add service'}
        className="max-w-lg"
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditor(null)}>Cancel</Button><Button size="sm" loading={create.isPending || update.isPending} onClick={submit}>Save</Button></>}
      >
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 w-full rounded-control border border-control bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-control border border-control bg-surface p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Duration (min)" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-content">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active (visible to customers)
          </label>

          {/* Live preview of the customer-facing card */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-content-muted">Customer preview</p>
            <Card className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-content">{form.name || 'Service name'}</p>
                <p className="text-sm text-content-secondary">{form.durationMinutes ? minutesToLabel(Number(form.durationMinutes)) : '— min'} · {form.category}</p>
              </div>
              <span className="tabular font-semibold text-content">{form.price ? currency(Number(form.price)) : '₹—'}</span>
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  )
}
