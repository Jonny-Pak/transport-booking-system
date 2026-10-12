import { FeaturePlaceholder } from '../../components/common/FeaturePlaceholder'
export function LoginPage() {
  return (
    <div className="container">
      <FeaturePlaceholder
        title="Đăng nhập"
        description="Quản lý hành trình của bạn trong một tài khoản."
        items={[
          'Đăng nhập bằng email và mật khẩu',
          'Mật khẩu sẽ được bảo vệ bằng BCrypt ở backend',
          'Phiên đăng nhập và kiểm soát quyền sẽ được triển khai ở Sprint 1',
        ]}
      />
    </div>
  )
}
