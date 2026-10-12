import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function ManageVehiclesPage() {
  return (
    <FeaturePlaceholder
      title="Quản lý phương tiện"
      description="Quản lý xe khách và cấu hình ghế."
      items={[
        'Biển số, loại xe và nhà vận hành',
        'Sơ đồ ghế và sức chứa',
        'Thiết kế mở rộng cho toa tàu trong tương lai',
      ]}
    />
  )
}
