import { NavLink } from 'react-router-dom'
import {
  BusFront,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Ticket,
} from 'lucide-react'
const links = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/routes', label: 'Tuyến đường', icon: MapPin },
  { to: '/admin/vehicles', label: 'Phương tiện', icon: BusFront },
  { to: '/admin/trips', label: 'Chuyến xe', icon: CalendarDays },
  { to: '/admin/bookings', label: 'Đơn đặt vé', icon: Ticket },
]
export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <p className="eyebrow">QUẢN TRỊ</p>
      <nav aria-label="Điều hướng quản trị">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
