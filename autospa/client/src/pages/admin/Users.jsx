import { useState } from 'react'
import { Users as UsersIcon, Ban, RotateCcw, Eye } from 'lucide-react'

import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState } from '../../components/ui/EmptyState.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { cn } from '../../lib/utils.js'
import { formatDate } from '../../lib/format.js'
import { useAdminUsers, useUserModeration, useAdminBookings } from '../../hooks/useAdmin.js'

const TAB_PARAMS = {
  all: {},
  customers: { role: 'customer' },
  owners: { role: 'garage_owner' },
  blocked: { status: 'blocked' },
}
const ROLE_LABEL = { customer: 'Customer', garage_owner: 'Garage owner', admin: 'Admin' }

export default function AdminUsers() {
  const [tab, setTab] = useState('all')
  const { data, isLoading } = useAdminUsers({ ...TAB_PARAMS[tab], limit: 100 })
  const { block, unblock } = useUserModeration()
  const [detail, setDetail] = useState(null)

  const users = data?.items || []

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-semibold text-content">Users</h1>
      <p className="mb-5 text-content-secondary">Manage platform accounts.</p>

      <Tabs className="mb-5" active={tab} onChange={setTab} tabs={[
        { key: 'all', label: 'All' }, { key: 'customers', label: 'Customers' }, { key: 'owners', label: 'Garage Owners' }, { key: 'blocked', label: 'Blocked' },
      ]} />

      {isLoading ? <Skeleton className="h-64" /> : !users.length ? (
        <EmptyState icon={UsersIcon} title="No users" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-hairline text-left text-content-muted">
                <tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Role</Th><Th>Joined</Th><Th className="text-right">Bookings</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {users.map((u) => (
                  <tr key={u._id}>
                    <Td className="font-medium text-content">{u.name}</Td>
                    <Td className="text-content-secondary">{u.email}</Td>
                    <Td className="tabular text-content-secondary">{u.phone || '—'}</Td>
                    <Td className="text-content-secondary">{ROLE_LABEL[u.role] || u.role}</Td>
                    <Td className="text-content-secondary">{formatDate(u.createdAt)}</Td>
                    <Td className="text-right tabular">{u.bookingCount ?? 0}</Td>
                    <Td><Badge className={u.status === 'blocked' ? 'bg-danger/10 text-danger' : 'bg-accent-light text-primary'}>{u.status}</Badge></Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetail(u)} title="View" className="rounded p-1.5 text-content-muted hover:text-primary"><Eye className="h-4 w-4" /></button>
                        {u.role !== 'admin' && (u.status === 'blocked' ? (
                          <button onClick={() => unblock.mutate(u._id)} title="Unblock" className="rounded p-1.5 text-content-muted hover:text-primary"><RotateCcw className="h-4 w-4" /></button>
                        ) : (
                          <button onClick={() => window.confirm(`Block ${u.name}?`) && block.mutate(u._id)} title="Block" className="rounded p-1.5 text-content-muted hover:text-danger"><Ban className="h-4 w-4" /></button>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <UserDetailModal user={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function UserDetailModal({ user, onClose }) {
  const { data } = useAdminBookings(user?.role === 'customer' ? { customerId: user._id, limit: 5 } : undefined)
  if (!user) return null
  return (
    <Modal open onClose={onClose} title={user.name} className="max-w-lg">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || '—'} />
          <Info label="Role" value={ROLE_LABEL[user.role] || user.role} />
          <Info label="Status" value={user.status} />
          <Info label="Joined" value={formatDate(user.createdAt)} />
          <Info label="Bookings" value={user.bookingCount ?? 0} />
        </div>
        {user.role === 'customer' && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-content-muted">Recent bookings</p>
            {!data?.items?.length ? <p className="text-content-muted">No bookings.</p> : (
              <ul className="space-y-1">{data.items.map((b) => <li key={b._id} className="flex justify-between"><span className="tabular text-content">{b.bookingNumber}</span><span className="text-content-secondary">{b.status}</span></li>)}</ul>
            )}
          </div>
        )}
        <p className="text-xs text-content-muted">Passwords are never exposed.</p>
      </div>
    </Modal>
  )
}

const Th = ({ children, className }) => <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
const Td = ({ children, className }) => <td className={cn('px-4 py-3', className)}>{children}</td>
const Info = ({ label, value }) => <div><p className="text-xs text-content-muted">{label}</p><p className="font-medium text-content">{value}</p></div>
