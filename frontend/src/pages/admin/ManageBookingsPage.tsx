import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function ManageBookingsPage() {
  return (
    <FeaturePlaceholder
      title="Quản lý đơn đặt vé"
      description="Theo dõi đơn đặt vé và xử lý theo chính sách."
      items={[
        'Tìm kiếm và lọc đơn đặt vé',
        'Xem trạng thái giữ ghế và thanh toán',
        'Theo dõi lịch sử thay đổi và yêu cầu hủy',
      ]}
    />
  )
}
