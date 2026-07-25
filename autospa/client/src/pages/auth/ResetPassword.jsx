import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, KeyRound, Lock } from 'lucide-react'

import AuthShell from './AuthShell.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { authApi } from '../../api/auth.api.js'

// Backend resets via { email, otp, newPassword } (OTP-based, not a URL token).
const schema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'At least 8 characters'),
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      await authApi.resetPassword(values)
      toast.success('Password reset — please log in')
      navigate('/login', { replace: true })
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter the code from your email and a new password."
      footer={<Link to="/login" className="font-medium text-primary">Back to login</Link>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Input label="Reset code" inputMode="numeric" maxLength={6} className="tabular tracking-widest" leftIcon={<KeyRound className="h-4 w-4" />} error={errors.otp?.message} {...register('otp')} />
        <Input label="New password" type="password" leftIcon={<Lock className="h-4 w-4" />} error={errors.newPassword?.message} {...register('newPassword')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Reset password</Button>
      </form>
    </AuthShell>
  )
}
