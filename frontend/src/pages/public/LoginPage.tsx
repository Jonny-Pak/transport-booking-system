import { Alert, Button, Card } from 'antd'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema, type LoginValues } from '../../features/auth/authSchema'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function submit(values: LoginValues) {
    setError(null)
    setSubmitting(true)
    try {
      const user = await auth.login(values)
      const from = (location.state as { from?: string } | null)?.from
      // Return only to a local path; never use an external redirect from navigation state.
      const destination =
        from?.startsWith('/') && !from.startsWith('//') && !from.includes('\\')
          ? from
          : user.role === 'ADMIN'
            ? '/admin'
            : '/my-bookings'
      navigate(destination, { replace: true })
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không thể đăng nhập.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-lg" title="Đăng nhập">
        {(location.state as { registered?: boolean } | null)?.registered && (
          <Alert
            className="mb-4"
            type="success"
            showIcon
            title="Đăng ký thành công. Vui lòng đăng nhập."
          />
        )}
        {error && (
          <Alert className="mb-4" type="error" showIcon title={error} />
        )}
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <span id="email-error" className="field-error">
            {errors.email?.message}
          </span>
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          <span id="password-error" className="field-error">
            {errors.password?.message}
          </span>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Đăng nhập
          </Button>
        </form>
        <p className="mt-5">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </Card>
    </div>
  )
}
