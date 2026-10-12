import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function ManageTripsPage() {
  return (
    <FeaturePlaceholder
      title="Quản lý chuyến xe"
      description="Lập lịch vận hành và giá vé theo chuyến."
      items={[
        'Gán tuyến đường và phương tiện',
        'Giờ khởi hành, giờ đến và giá vé',
        'Kiểm tra xung đột lịch sử dụng phương tiện',
      ]}
    />
  )
}
