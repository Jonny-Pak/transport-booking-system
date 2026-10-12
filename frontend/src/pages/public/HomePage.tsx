import {
  ArrowRight,
  BusFront,
  MapPin,
  Search,
  Ticket,
  CreditCard,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { TripSearchForm } from '../../features/trips/TripSearchForm'
import { sampleRoutes } from '../../features/trips/sampleRoutes'
export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-badge">
              <span /> HÀNH TRÌNH MỚI, TRẢI NGHIỆM MỚI
            </span>
            <h1>
              Mỗi chuyến đi,
              <br />
              một <span>khởi đầu mới.</span>
            </h1>
            <p>
              Tìm chuyến xe phù hợp, khám phá những điểm đến yêu thích.
              <br className="hidden md:block" /> Một nền tảng cho mọi hành trình
              của bạn.
            </p>
            <a className="hero-link" href="#trip-search">
              Khám phá hành trình <ArrowRight size={18} />
            </a>
            <div className="hero-note">
              <BusFront size={18} /> Khởi tạo cho xe khách · Hướng tới tàu hỏa
            </div>
          </div>
          <div className="journey-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-hill hill-back" />
            <div className="art-hill hill-front" />
            <div className="art-road" />
            <div className="art-bus">
              <div className="bus-windows">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="bus-stripe" />
              <div className="bus-wheel wheel-left" />
              <div className="bus-wheel wheel-right" />
              <span className="bus-word">VÉ VIỆT</span>
            </div>
            <div className="destination-chip">
              <MapPin size={18} /> Đi đến nơi bạn yêu
            </div>
            <span className="art-caption">CÙNG BẠN TRÊN MỌI NẺO ĐƯỜNG</span>
          </div>
        </div>
      </section>
      <section id="trip-search" className="container search-section">
        <div className="search-panel">
          <div className="search-heading">
            <BusFront size={20} />
            <h2>Tìm chuyến xe của bạn</h2>
            <span>Bản minh họa</span>
          </div>
          <TripSearchForm />
          <p className="search-disclaimer">
            Tìm kiếm hiện hiển thị tuyến mẫu. Chưa hỗ trợ đặt vé thực tế.
          </p>
        </div>
      </section>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ĐI ĐÂU TIẾP THEO?</p>
            <h2>Những tuyến đường nổi bật</h2>
            <p>Gợi ý hành trình với dữ liệu mẫu, giá chỉ để minh họa.</p>
          </div>
          <Link to="/trips">
            Xem tuyến mẫu <ArrowRight size={18} />
          </Link>
        </div>
        <div className="route-grid">
          {sampleRoutes.map((route) => (
            <article className="route-card" key={route.id}>
              <div className={`route-art ${route.theme}`}>
                <span className="sample-tag">DỮ LIỆU MẪU</span>
                <div className="landscape" />
                <span className="destination-name">{route.to}</span>
                <span className="destination-label">{route.label}</span>
              </div>
              <div className="route-info">
                <h3>
                  {route.from} <ChevronRight size={16} /> {route.to}
                </h3>
                <p>Xe khách · Khoảng {route.duration}</p>
                <div className="route-bottom">
                  <div>
                    <span>Giá minh họa từ</span>
                    <strong>
                      {route.fare}
                      <small> đ</small>
                    </strong>
                  </div>
                  <Link
                    to={`/trips/${route.id}`}
                    aria-label={`Xem tuyến mẫu đến ${route.to}`}
                  >
                    <ArrowRight size={22} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="process-section">
        <div className="container">
          <p className="eyebrow text-center">ĐƠN GIẢN TỪ ĐẦU ĐẾN CUỐI</p>
          <h2 className="text-center">Hành trình đặt vé dự kiến</h2>
          <p className="text-center muted">
            Quy trình sẽ được triển khai trong các sprint tiếp theo.
          </p>
          <div className="process-grid">
            {[
              {
                icon: Search,
                title: 'Tìm chuyến phù hợp',
                text: 'Chọn điểm đi, điểm đến và ngày khởi hành.',
              },
              {
                icon: Ticket,
                title: 'Chọn ghế & đặt vé',
                text: 'Xem sơ đồ ghế và điền thông tin hành khách.',
              },
              {
                icon: CreditCard,
                title: 'Thanh toán & nhận vé',
                text: 'Thanh toán trực tuyến và nhận vé điện tử.',
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <div className="process-step" key={title}>
                <div className="step-icon">
                  <Icon />
                  <span>{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
