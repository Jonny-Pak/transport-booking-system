import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { CustomerLayout } from '../../components/layout/CustomerLayout'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { HomePage } from '../../pages/public/HomePage'
import { NotFoundPage } from '../../pages/public/NotFoundPage'
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        lazy: async () => ({
          Component: (await import('../../pages/public/LoginPage')).LoginPage,
        }),
      },
      {
        path: 'register',
        lazy: async () => ({
          Component: (await import('../../pages/public/RegisterPage'))
            .RegisterPage,
        }),
      },
      {
        path: 'trips',
        lazy: async () => ({
          Component: (await import('../../pages/public/TripSearchPage'))
            .TripSearchPage,
        }),
      },
      {
        path: 'trips/:tripId',
        lazy: async () => ({
          Component: (await import('../../pages/public/TripDetailPage'))
            .TripDetailPage,
        }),
      },
      {
        element: <CustomerLayout />,
        children: [
          {
            path: 'my-bookings',
            lazy: async () => ({
              Component: (await import('../../pages/customer/MyBookingsPage'))
                .MyBookingsPage,
            }),
          },
          {
            path: 'my-bookings/:bookingId',
            lazy: async () => ({
              Component: (
                await import('../../pages/customer/BookingDetailPage')
              ).BookingDetailPage,
            }),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../../pages/admin/AdminDashboardPage'))
            .AdminDashboardPage,
        }),
      },
      {
        path: 'routes',
        lazy: async () => ({
          Component: (await import('../../pages/admin/ManageRoutesPage'))
            .ManageRoutesPage,
        }),
      },
      {
        path: 'vehicles',
        lazy: async () => ({
          Component: (await import('../../pages/admin/ManageVehiclesPage'))
            .ManageVehiclesPage,
        }),
      },
      {
        path: 'trips',
        lazy: async () => ({
          Component: (await import('../../pages/admin/ManageTripsPage'))
            .ManageTripsPage,
        }),
      },
      {
        path: 'bookings',
        lazy: async () => ({
          Component: (await import('../../pages/admin/ManageBookingsPage'))
            .ManageBookingsPage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
