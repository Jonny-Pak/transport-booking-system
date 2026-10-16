import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { AuthProvider } from '../../features/auth/AuthProvider'
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#2563EB',
          borderRadius: 10,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  )
}
