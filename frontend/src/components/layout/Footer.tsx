import { BusFront } from 'lucide-react'
import { Link } from 'react-router-dom'
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <BusFront /> Vé Việt
          </div>
          <p>Khởi đầu cho những hành trình kết nối.</p>
          <p>Đồ án quản lý dự án phần mềm · Phiên bản khởi tạo</p>
        </div>
        <div>
          <h3>Khám phá</h3>
          <Link to="/trips">Tìm chuyến xe</Link>
          <Link to="/my-bookings">Quản lý vé</Link>
        </div>
        <div>
          <h3>Thông tin dự án</h3>
          <p>Dữ liệu trên giao diện là minh họa.</p>
          <p>Đặt vé và thanh toán sẽ được phát triển sau.</p>
          <Link to="/admin">Xem giao diện quản trị</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Transport Ticket Booking System
      </div>
    </footer>
  )
}
