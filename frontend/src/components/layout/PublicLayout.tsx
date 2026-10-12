import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ApiStatus } from '../common/ApiStatus'
export function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Đến nội dung
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && <ApiStatus />}
    </>
  )
}
