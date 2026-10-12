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
            description="Chưa có quyền quản trị hoặc dữ liệu thật. API nghiệp vụ vẫn yêu cầu xác thực."
          />
          <Outlet />
        </main>
      </div>
      {import.meta.env.DEV && <ApiStatus />}
    </>
  )
}
