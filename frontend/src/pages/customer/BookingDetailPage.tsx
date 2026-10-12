import { useParams } from 'react-router-dom'
import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function BookingDetailPage() {
  const { bookingId } = useParams()
  return (
    <FeaturePlaceholder
      title="Chi tiết đặt vé"
      description={`Mã tham chiếu trên đường dẫn: ${bookingId}. Chưa tra cứu dữ liệu thật.`}
      items={[
        'Thông tin chuyến xe và hành khách',
        'Trạng thái đặt vé và thanh toán',
        'Vé điện tử sau khi xác nhận thanh toán',
      ]}
    />
  )
}
