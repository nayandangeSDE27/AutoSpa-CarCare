import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Lock } from 'lucide-react'

import AuthShell from './AuthShell.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { authApi } from '../../api/auth.api.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { dashboardPathForRole } from '../../routes/guards.js'

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid phone'),
  password: z.string().min(8, 'At least 8 characters'),
})

const otpSchema = z.object({ otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') })

/**
 * Shared register → verify-email → auto-login flow (backend requires a verified
 * email before login). role decides the endpoint + post-login redirect.
 */
export default function RegisterFlow({ role }) {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [step, setStep] = useState('form')
  const [creds, setCreds] = useState({ email: '', password: '' })

  const form = useForm({ resolver: zodResolver(schema) })
  const otpForm = useForm({ resolver: zodResolver(otpSchema) })

  const submitForm = async (values) => {
    try {
      const fn = role === 'garage_owner' ? authApi.registerGarage : authApi.registerCustomer
      await fn(values)
      setCreds({ email: values.email, password: values.password })
      toast.success('Account created. Check the server console for your OTP.')
      setStep('otp')
    } catch (e) {
      toast.error(e.message || 'Registration failed')
    }
  }

  const submitOtp = async ({ otp }) => {
    try {
      await authApi.verifyEmail({ email: creds.email, otp })
      const data = await authApi.login(creds)
      login(data)
      toast.success('Email verified — welcome!')
      navigate(dashboardPathForRole(data.user.role), { replace: true })
    } catch (e) {
      toast.error(e.message || 'Verification failed')
    }
  }

  const title = role === 'garage_owner' ? 'Register your garage' : 'Create your account'

  if (step === 'otp') {
    return (
      <AuthShell title="Verify your email" subtitle={`Enter the 6-digit code sent to ${creds.email}. (Dev: printed in the server console.)`}>
        <form onSubmit={otpForm.handleSubmit(submitOtp)} className="space-y-4" noValidate>
          <Input label="Verification code" inputMode="numeric" maxLength={6} placeholder="123456" className="tabular tracking-widest" error={otpForm.formState.errors.otp?.message} {...otpForm.register('otp')} />
          <Button type="submit" className="w-full" loading={otpForm.formState.isSubmitting}>Verify & continue</Button>
          <button type="button" className="w-full text-sm font-medium text-primary" onClick={() => authApi.resendOtp({ email: creds.email }).then(() => toast.success('New code sent')).catch((e) => toast.error(e.message))}>
            Resend code
          </button>
        </form>
      </AuthShell>
    )
  }

  const subtitle =
    role === 'garage_owner'
      ? 'First, create your owner account — you’ll set up your garage right after.'
      : 'It only takes a minute.'

  return (
    <AuthShell
      title={title}
      subtitle={subtitle}
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary">Log in</Link></>}
    >
      <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4" noValidate>
        <Input label="Full name" leftIcon={<User className="h-4 w-4" />} error={form.formState.errors.name?.message} {...form.register('name')} />
        <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} error={form.formState.errors.phone?.message} {...form.register('phone')} />
        <Input label="Password" type="password" leftIcon={<Lock className="h-4 w-4" />} error={form.formState.errors.password?.message} {...form.register('password')} />
        <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Create account</Button>
        {role === 'customer' ? (
          <p className="text-center text-sm text-content-secondary">
            Own a garage? <Link to="/register/garage" className="font-medium text-primary">Register a garage</Link>
          </p>
        ) : (
          <p className="text-center text-sm text-content-secondary">
            Looking to book? <Link to="/register/customer" className="font-medium text-primary">Sign up as a customer</Link>
          </p>
        )}
      </form>
    </AuthShell>
  )
}
