import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { AuthContext } from '../../features/auth/AuthContext'
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})
const authState = { user: null, status: 'not-implemented' } as const
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
        <AuthContext.Provider value={authState}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    </ConfigProvider>
  )
}
