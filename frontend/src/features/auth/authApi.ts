import { apiClient, ApiError } from '../../services/api/client'
import type { ApiResponse } from '../../types/api'
import type { LoginValues, RegisterValues } from './authSchema'

export interface AuthUser {
  id: number
  fullName: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
}

export async function getCurrentUser(
  signal?: AbortSignal,
): Promise<AuthUser | null> {
  try {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me', {
      signal,
    })
    return response.data.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function loginAccount(values: LoginValues) {
  const response = await apiClient.post<ApiResponse<AuthUser>>(
    '/auth/login',
    values,
  )
  return response.data.data
}

export async function registerAccount(values: RegisterValues) {
  // Send only registration fields; roles are never supplied by this form.
  const { fullName, email, phone, password } = values
  await apiClient.post('/auth/register', { fullName, email, phone, password })
}

export async function logoutAccount() {
  await apiClient.post('/auth/logout')
}
