import { useEffect, type PropsWithChildren } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './AuthContext'
import { getCurrentUser, loginAccount, logoutAccount } from './authApi'
import type { LoginValues } from './authSchema'

const authKey = ['auth', 'me'] as const

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: authKey,
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
    staleTime: 0,
  })

  useEffect(() => {
    function sessionExpired() {
      queryClient.removeQueries({
        predicate: (item) => item.queryKey[0] !== 'auth',
      })
      queryClient.setQueryData(authKey, null)
    }
    window.addEventListener('auth:expired', sessionExpired)
    return () => window.removeEventListener('auth:expired', sessionExpired)
  }, [queryClient])

  async function login(values: LoginValues) {
    const user = await loginAccount(values)
    await queryClient.cancelQueries()
    queryClient.removeQueries({
      predicate: (item) => item.queryKey[0] !== 'auth',
    })
    queryClient.setQueryData(authKey, user)
    return user
  }

  async function logout() {
    await logoutAccount()
    await queryClient.cancelQueries()
    queryClient.removeQueries({
      predicate: (item) => item.queryKey[0] !== 'auth',
    })
    queryClient.setQueryData(authKey, null)
  }

  let status: 'loading' | 'authenticated' | 'anonymous' | 'error' = 'anonymous'
  if (query.isPending) status = 'loading'
  else if (query.isError) status = 'error'
  else if (query.data) status = 'authenticated'

  return (
    <AuthContext.Provider
      value={{
        user: query.data ?? null,
        status,
        error: query.error?.message ?? null,
        login,
        logout,
        retry: () => {
          void query.refetch()
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
