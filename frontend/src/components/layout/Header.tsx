import { BusFront, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button, message } from 'antd'
import { useAuth } from '../../hooks/useAuth'
export function Header() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const auth = useAuth()
  const navigate = useNavigate()
  async function logout() {
    setLoggingOut(true)
    try {
      await auth.logout()
      navigate('/login')
    } catch (error) {
      void messageApi.error(
        error instanceof Error ? error.message : 'Không thể đăng xuất.',
      )
    } finally {
      setLoggingOut(false)
    }
  }
  return (
    <header className="site-header">
      {contextHolder}
      <div className="container header-inner">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <BusFront size={25} />
          </span>{' '}
          Vé Việt<span className="brand-label">TÀU · XE</span>
        </Link>
        <button
          className="mobile-menu"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          className={`header-nav ${open ? 'is-open' : ''}`}
          aria-label="Điều hướng chính"
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end>
            Trang chủ
          </NavLink>
          <NavLink to="/trips">Tìm chuyến</NavLink>
          {auth.user?.role === 'ADMIN' ? (
            <NavLink to="/admin">Quản trị</NavLink>
          ) : (
            <NavLink to="/my-bookings">Vé của tôi</NavLink>
          )}
          {auth.user ? (
            <>
              <span className="max-w-40 truncate" title={auth.user.fullName}>
                {auth.user.fullName}
              </span>
              <Button
                onClick={() => {
                  void logout()
                }}
                loading={loggingOut}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            auth.status !== 'loading' && (
              <>
                <NavLink to="/login">Đăng nhập</NavLink>
                <Link className="nav-cta" to="/register">
                  Đăng ký
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
