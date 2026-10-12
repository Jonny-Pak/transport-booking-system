import { Alert, Button, Card } from 'antd'
import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
interface Props {
  title: string
  description: string
  items: string[]
}
export function FeaturePlaceholder({ title, description, items }: Props) {
  return (
    <section className="page-shell">
      <p className="eyebrow">NỀN TẢNG SPRINT 1</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      <Alert
        type="info"
        showIcon
        title="Giao diện khởi tạo"
        description="Chức năng này chưa kết nối dữ liệu nghiệp vụ. Chưa thể đặt vé, đăng nhập hoặc thanh toán."
      />
      <Card
        className="mt-6"
        title={
          <span className="flex items-center gap-2">
            <Construction size={20} /> Phạm vi dự kiến
          </span>
        }
      >
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link to="/">
          <Button className="mt-4">Về trang chủ</Button>
        </Link>
      </Card>
    </section>
  )
}
