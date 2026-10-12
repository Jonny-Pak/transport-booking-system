import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function AdminDashboardPage() {
  return (
    <FeaturePlaceholder
      title="Tổng quan quản trị"
      description="Theo dõi hoạt động và doanh thu khi các API được triển khai."
      items={[
        'Số đơn đặt vé theo trạng thái',
        'Doanh thu từ giao dịch đã xác nhận',
        'Tình hình chuyến xe và tỷ lệ lấp đầy',
      ]}
    />
  )
}
