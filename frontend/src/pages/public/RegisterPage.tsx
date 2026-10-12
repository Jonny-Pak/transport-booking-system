import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function RegisterPage() {
  return (
    <div className="container">
      <FeaturePlaceholder
        title="Tạo tài khoản"
        description="Chuẩn bị cho những hành trình tiếp theo của bạn."
        items={[
          'Thông tin họ tên, email và số điện thoại',
          'Kiểm tra dữ liệu và email trùng lặp',
          'Đăng ký tài khoản khách hàng qua API',
        ]}
      />
    </div>
  )
}
