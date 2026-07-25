import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'

import AuthShell from './AuthShell.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { authApi } from '../../api/auth.api.js'
import { useAuthStore } from '../../stores/auth.store.js'
import { dashboardPathForRole } from '../../routes/guards.js'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      const data = await authApi.login(values) // { user, accessToken, refreshToken }
      login(data)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`)
      navigate(dashboardPathForRole(data.user.role), { replace: true })
    } catch (e) {
      toast.error(e.message || 'Login failed')
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to AutoSpa."
      footer={<>New here? <Link to="/register/customer" className="font-medium text-primary">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
    </AuthShell>
  )
}
