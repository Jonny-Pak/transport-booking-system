import { Alert } from 'antd'
import { NavLink, Outlet } from 'react-router-dom'
export function CustomerLayout() {
  return (
    <div className="container py-8">
      <Alert
        type="warning"
        showIcon
        title="Khu vực khách hàng — bản xem trước"
        description="Xác thực và kiểm soát quyền sẽ được triển khai trước khi sử dụng dữ liệu thật."
      />
      <nav className="mt-6">
        <NavLink to="/my-bookings">Vé của tôi</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
