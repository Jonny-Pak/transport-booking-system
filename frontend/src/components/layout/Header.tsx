import { BusFront, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <BusFront size={25} />
          </span>{' '}
          Vé Việt<span className="brand-label">BUS</span>
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
          <NavLink to="/trips">Tìm chuyến xe</NavLink>
          <NavLink to="/my-bookings">Vé của tôi</NavLink>
          <NavLink to="/login">Đăng nhập</NavLink>
          <Link className="nav-cta" to="/register">
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  )
}
