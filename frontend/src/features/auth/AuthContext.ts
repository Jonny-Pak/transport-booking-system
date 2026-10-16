import { createContext } from 'react'
import type { AuthUser } from './authApi'
import type { LoginValues } from './authSchema'

export interface AuthState {
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'anonymous' | 'error'
  error: string | null
  login: (values: LoginValues) => Promise<AuthUser>
  logout: () => Promise<void>
  retry: () => void
}
export const AuthContext = createContext<AuthState | undefined>(undefined)
