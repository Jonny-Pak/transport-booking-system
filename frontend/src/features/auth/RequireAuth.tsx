import { Alert, Button, Result, Spin } from 'antd'
import { Navigate, useLocation } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function RequireAuth({
  children,
  role,
}: PropsWithChildren<{ role: 'CUSTOMER' | 'ADMIN' }>) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.status === 'loading')
    return (
      <div className="p-12 text-center">
        <Spin aria-label="Đang kiểm tra phiên đăng nhập" />
      </div>
    )
  if (auth.status === 'error')
    return (
      <div className="container py-8">
        <Alert
          type="error"
          showIcon
          title="Không thể kiểm tra phiên đăng nhập"
          description={auth.error}
          action={<Button onClick={auth.retry}>Thử lại</Button>}
        />
      </div>
    )
  if (!auth.user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  if (auth.user.role !== role)
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={<Button href="/">Về trang chủ</Button>}
      />
    )
  return children
}
