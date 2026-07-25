import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User as UserIcon, ShieldAlert } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { useMe, useUpdateMe, useChangePassword } from '../../hooks/useMe.js'
import { useAuthStore } from '../../stores/auth.store.js'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  phone: z.string().trim().min(6, 'Enter a valid phone'),
})
const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
})

export default function Profile() {
  const { data: me, isLoading } = useMe()
  const updateMe = useUpdateMe()
  const changePw = useChangePassword()
  const logout = useAuthStore((s) => s.logout)
  const [pwOpen, setPwOpen] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    values: me ? { name: me.name, phone: me.phone } : undefined,
  })
  const pwForm = useForm({ resolver: zodResolver(pwSchema) })

  if (isLoading) return <div className="mx-auto max-w-2xl space-y-4"><Skeleton className="h-28" /><Skeleton className="h-64" /></div>

  const initials = (me?.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()

  const submitPw = async (v) => {
    await changePw.mutateAsync(v).catch(() => {})
    if (!changePw.isError) { setPwOpen(false); pwForm.reset() }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-2xl font-semibold text-content">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-mid text-xl font-semibold text-primary-deep">{initials}</div>
          <div>
            <p className="text-lg font-semibold text-content">{me?.name}</p>
            <p className="text-sm text-content-secondary">{me?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium capitalize text-primary">{me?.role}</span>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <h2 className="mb-4 font-semibold text-content">Account details</h2>
          <form onSubmit={handleSubmit((v) => updateMe.mutate(v))} className="space-y-4">
            <Input label="Full name" leftIcon={<UserIcon className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
            <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
            <Input label="Email" leftIcon={<Mail className="h-4 w-4" />} value={me?.email || ''} disabled readOnly />
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty} loading={updateMe.isPending}>Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-content">Password</h2>
              <p className="text-sm text-content-secondary">Change your account password.</p>
            </div>
            <Button variant="secondary" onClick={() => setPwOpen(true)}>Change password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="mt-4 border-danger/30">
        <CardContent>
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-danger"><ShieldAlert className="h-4 w-4" /> Danger zone</h2>
          <p className="mb-3 text-sm text-content-secondary">Sign out of your account on this device.</p>
          <Button variant="danger" onClick={logout}>Log out</Button>
        </CardContent>
      </Card>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Change password"
        footer={<><Button variant="secondary" size="sm" onClick={() => setPwOpen(false)}>Cancel</Button><Button size="sm" loading={changePw.isPending} onClick={pwForm.handleSubmit(submitPw)}>Update</Button></>}
      >
        <div className="space-y-3">
          <Input label="Current password" type="password" error={pwForm.formState.errors.currentPassword?.message} {...pwForm.register('currentPassword')} />
          <Input label="New password" type="password" error={pwForm.formState.errors.newPassword?.message} {...pwForm.register('newPassword')} />
        </div>
      </Modal>
    </div>
  )
}
