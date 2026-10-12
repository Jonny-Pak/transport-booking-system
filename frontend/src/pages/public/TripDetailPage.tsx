import { useParams } from 'react-router-dom'
import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
import { sampleRoutes } from '../../features/trips/sampleRoutes'
import { NotFoundPage } from './NotFoundPage'
export function TripDetailPage() {
  const { tripId } = useParams()
  const route = sampleRoutes.find((item) => item.id === tripId)
  if (!route) return <NotFoundPage />
  return (
    <div className="container">
      <FeaturePlaceholder
        title={`${route.from} → ${route.to}`}
        description={`Tuyến mẫu · Khoảng ${route.duration} · Giá minh họa ${route.fare} đ`}
        items={[
          'Thông tin nhà xe và giờ khởi hành',
          'Sơ đồ ghế và trạng thái ghế theo chuyến',
          'Thông tin hành khách và chính sách hủy vé',
        ]}
      />
    </div>
  )
}
