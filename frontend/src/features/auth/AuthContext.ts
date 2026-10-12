import { createContext } from 'react'
export interface AuthState {
  user: null
  status: 'not-implemented'
}
export const AuthContext = createContext<AuthState | undefined>(undefined)
