import { Alert, Button, Empty } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { TripSearchForm } from '../../features/trips/TripSearchForm'
import { sampleRoutes } from '../../features/trips/sampleRoutes'
export function TripSearchPage() {
  const [params] = useSearchParams()
  const origin = params.get('origin'),
    destination = params.get('destination')
  const routes = sampleRoutes.filter(
    (route) =>
      (!origin || route.from === origin) &&
      (!destination || route.to === destination),
  )
  return (
    <section className="container page-shell">
      <p className="eyebrow">LÊN KẾ HOẠCH HÀNH TRÌNH</p>
      <h1>Tìm chuyến xe</h1>
      <div className="search-panel">
        <TripSearchForm />
      </div>
      <Alert
        className="my-6"
        type="info"
        showIcon
        title="Kết quả minh họa"
        description={`Dữ liệu mẫu không phản ánh lịch chạy hay ghế trống thực tế.${params.get('departureDate') ? ` Ngày bạn chọn: ${params.get('departureDate')}.` : ''}`}
      />
      <div className="space-y-4">
        {routes.map((route) => (
          <article className="search-result" key={route.id}>
            <div>
              <h3>
                {route.from} → {route.to}
              </h3>
              <p>
                Khoảng {route.duration} · Giá minh họa {route.fare} đ
              </p>
            </div>
            <Link to={`/trips/${route.id}`}>
              <Button>Xem tuyến mẫu</Button>
            </Link>
          </article>
        ))}
        {routes.length === 0 && (
          <Empty description="Chưa có tuyến mẫu cho lựa chọn này. API tìm chuyến sẽ được phát triển sau." />
        )}
      </div>
    </section>
  )
}
