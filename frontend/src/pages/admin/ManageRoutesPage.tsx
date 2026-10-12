import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function ManageRoutesPage() {
  return (
    <FeaturePlaceholder
      title="Quản lý tuyến đường"
      description="Cấu hình mạng lưới điểm đi và điểm đến."
      items={[
        'Danh sách tuyến và trạng thái hoạt động',
        'Khoảng cách và thời gian dự kiến',
        'Kiểm tra tuyến trùng lặp',
      ]}
    />
  )
}
