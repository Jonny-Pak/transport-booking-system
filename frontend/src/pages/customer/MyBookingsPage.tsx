import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function MyBookingsPage() {
  return (
    <FeaturePlaceholder
      title="Vé của tôi"
      description="Theo dõi các chuyến đi đã đặt của bạn."
      items={[
        'Danh sách đơn đặt vé của tài khoản',
        'Lọc theo trạng thái và ngày khởi hành',
        'Xem chi tiết, vé điện tử và yêu cầu hủy theo chính sách',
      ]}
    />
  )
}
