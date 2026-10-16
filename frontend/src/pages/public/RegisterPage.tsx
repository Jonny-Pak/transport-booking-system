import { Alert, Button, Card } from 'antd'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerAccount } from '../../features/auth/authApi'
import {
  registerSchema,
  type RegisterValues,
} from '../../features/auth/authSchema'

export function RegisterPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '' },
  })

  async function submit(values: RegisterValues) {
    setError(null)
    setSubmitting(true)
    try {
      await registerAccount(values)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không thể đăng ký.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-lg" title="Tạo tài khoản">
        {error && (
          <Alert className="mb-4" type="error" showIcon title={error} />
        )}
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          <label htmlFor="fullName">Họ và tên</label>
          <input
            id="fullName"
            autoComplete="name"
            {...register('fullName')}
            aria-invalid={!!errors.fullName}
            aria-describedby="name-error"
          />
          <span id="name-error" className="field-error">
            {errors.fullName?.message}
          </span>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <span id="email-error" className="field-error">
            {errors.email?.message}
          </span>
          <label htmlFor="phone">Số điện thoại (không bắt buộc)</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            aria-invalid={!!errors.phone}
            aria-describedby="phone-error"
          />
          <span id="phone-error" className="field-error">
            {errors.phone?.message}
          </span>
          <label htmlFor="password">Mật khẩu (ít nhất 8 ký tự)</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          <span id="password-error" className="field-error">
            {errors.password?.message}
          </span>
          <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirm-error"
          />
          <span id="confirm-error" className="field-error">
            {errors.confirmPassword?.message}
          </span>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Đăng ký
          </Button>
        </form>
        <p className="mt-5">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </Card>
    </div>
  )
}
