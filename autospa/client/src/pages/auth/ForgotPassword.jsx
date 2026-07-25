import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail } from 'lucide-react'

import AuthShell from './AuthShell.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { authApi } from '../../api/auth.api.js'

const schema = z.object({ email: z.string().email('Enter a valid email') })

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      await authApi.forgotPassword(values)
      setSent(true)
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`If ${getValues('email')} is registered, a reset code has been sent (dev: server console).`}
        footer={<Link to={`/reset-password/code`} className="font-medium text-primary">I have a code →</Link>}>
        <Link to="/login"><Button variant="secondary" className="w-full">Back to login</Button></Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot password" subtitle="We'll send a reset code to your email."
      footer={<Link to="/login" className="font-medium text-primary">Back to login</Link>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Send reset code</Button>
      </form>
    </AuthShell>
  )
}
