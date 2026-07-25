import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Store, Star, Check, X, Ban, Eye } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { cn } from '../../lib/utils.js'
import { currency } from '../../lib/format.js'
import { useAdminGarages, useGarageModeration, useAdminBookings } from '../../hooks/useAdmin.js'

const STATUS_BADGE = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-accent-light text-primary',
  REJECTED: 'bg-danger/10 text-danger',
  SUSPENDED: 'bg-content-muted/15 text-content-secondary',
}
const cityOf = (a) => (a?.split(',').pop() || '—').trim()

export default function AdminGarages() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'ALL'
  const { data: garages, isLoading } = useAdminGarages(status === 'ALL' ? undefined : status)
  const { approve, reject, suspend } = useGarageModeration()
  const [detail, setDetail] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [reason, setReason] = useState('')

  const setTab = (s) => setParams(s === 'ALL' ? {} : { status: s })

  const counts = useMemo(() => ({}), [])
  const doReject = async () => {
    if (!reason.trim()) return
    await reject.mutateAsync({ id: rejectFor._id, reason }).then(() => { setRejectFor(null); setReason('') }).catch(() => {})
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Garages</h1>
      <p className="mb-5 text-content-secondary">Verify and moderate garages.</p>

      <Tabs
        className="mb-5"
        active={status}
        onChange={setTab}
        tabs={[
          { key: 'ALL', label: 'All' },
          { key: 'PENDING', label: '● Pending' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
          { key: 'SUSPENDED', label: 'Suspended' },
        ]}
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !garages?.length ? (
        <EmptyState icon={Store} title="No garages" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-hairline text-left text-content-muted">
                <tr>
                  <Th>Garage</Th><Th>Owner</Th><Th>City</Th><Th className="text-right">Bookings</Th><Th className="text-right">Rating</Th><Th className="text-right">Commission</Th><Th>Status</Th><Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {garages.map((g) => (
                  <tr key={g._id} className={cn(g.verificationStatus === 'PENDING' && 'bg-amber-50/50')}>
                    <Td className="font-medium text-content">{g.name}</Td>
                    <Td className="text-content-secondary">{g.owner?.name || '—'}</Td>
                    <Td className="text-content-secondary">{cityOf(g.address)}</Td>
                    <Td className="text-right tabular">{g.totalBookings}</Td>
                    <Td className="text-right"><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{(g.rating || 0).toFixed(1)}</span></Td>
                    <Td className="text-right tabular">{currency(g.commissionEarned)}</Td>
                    <Td><Badge className={STATUS_BADGE[g.verificationStatus]}>{g.verificationStatus}</Badge></Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetail(g)} title="View" className="rounded p-1.5 text-content-muted hover:text-primary"><Eye className="h-4 w-4" /></button>
                        {g.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => approve.mutate(g._id)} title="Approve" className="rounded p-1.5 text-content-muted hover:text-primary"><Check className="h-4 w-4" /></button>
                            <button onClick={() => { setRejectFor(g); setReason('') }} title="Reject" className="rounded p-1.5 text-content-muted hover:text-danger"><X className="h-4 w-4" /></button>
                          </>
                        )}
                        {g.verificationStatus === 'APPROVED' && (
                          <button onClick={() => window.confirm(`Suspend ${g.name}?`) && suspend.mutate(g._id)} title="Suspend" className="rounded p-1.5 text-content-muted hover:text-danger"><Ban className="h-4 w-4" /></button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reject reason modal */}
      <Modal open={Boolean(rejectFor)} onClose={() => setRejectFor(null)} title={`Reject ${rejectFor?.name || ''}`}
        footer={<><Button variant="secondary" size="sm" onClick={() => setRejectFor(null)}>Cancel</Button><Button variant="danger" size="sm" disabled={!reason.trim()} loading={reject.isPending} onClick={doReject}>Reject</Button></>}>
        <Input label="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Incomplete documents" />
      </Modal>

      {/* Detail modal */}
      <GarageDetailModal garage={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function GarageDetailModal({ garage, onClose }) {
  const { data } = useAdminBookings(garage ? { garageId: garage._id, limit: 5 } : undefined)
  if (!garage) return null
  return (
    <Modal open onClose={onClose} title={garage.name} className="max-w-lg">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <Info label="Owner" value={garage.owner?.name} />
          <Info label="Owner email" value={garage.owner?.email} />
          <Info label="Address" value={garage.address || '—'} />
          <Info label="Bays" value={garage.serviceBays} />
          <Info label="Rating" value={(garage.rating || 0).toFixed(1)} />
          <Info label="Status" value={garage.verificationStatus} />
          <Info label="Total bookings" value={garage.totalBookings} />
          <Info label="Commission earned" value={currency(garage.commissionEarned)} />
        </div>
        {garage.rejectionReason && <p className="rounded-control bg-danger/10 p-2 text-danger">Rejection: {garage.rejectionReason}</p>}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-content-muted">Recent bookings</p>
          {!data?.items?.length ? <p className="text-content-muted">No bookings yet.</p> : (
            <ul className="space-y-1">
              {data.items.map((b) => (
                <li key={b._id} className="flex justify-between"><span className="tabular text-content">{b.bookingNumber}</span><span className="text-content-secondary">{b.status}</span></li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-content-muted">Document viewer connects once a documents-fetch endpoint is added.</p>
      </div>
    </Modal>
  )
}

const Th = ({ children, className }) => <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
const Td = ({ children, className }) => <td className={cn('px-4 py-3', className)}>{children}</td>
const Info = ({ label, value }) => <div><p className="text-xs text-content-muted">{label}</p><p className="font-medium text-content">{value}</p></div>
