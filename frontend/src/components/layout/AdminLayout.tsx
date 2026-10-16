import { Alert } from 'antd'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { AdminSidebar } from './AdminSidebar'
import { ApiStatus } from '../common/ApiStatus'
export function AdminLayout() {
  return (
    <>
      <Header />
      <div className="admin-shell">
        <AdminSidebar />
        <main id="main" className="admin-content">
          <Alert
            type="warning"
            showIcon
            title="Giao diện quản trị minh họa"
            description="Bạn đã đăng nhập với quyền quản trị. Các chức năng quản lý nghiệp vụ đang được phát triển."
          />
          <Outlet />
        </main>
      </div>
      {import.meta.env.DEV && <ApiStatus />}
    </>
  )
}
