import axios from 'axios'
import type { ApiResponse } from '../../types/api'

export class ApiError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})
apiClient.interceptors.request.use(async (config) => {
  if (!config.baseURL) throw new ApiError('Chưa cấu hình VITE_API_BASE_URL.')
  const method = config.method?.toUpperCase() ?? 'GET'
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    // Fetch a fresh token for each mutation, including after login/logout.
    const response =
      await apiClient.get<ApiResponse<{ headerName: string; token: string }>>(
        '/auth/csrf',
      )
    const csrf = response.data.data
    config.headers.set(csrf.headerName, csrf.token)
  }
  return config
})
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
      if (
        error.response?.status === 401 &&
        !error.config?.url?.startsWith('/auth/')
      ) {
        window.dispatchEvent(new Event('auth:expired'))
      }
      const message =
        error.response?.data?.message ??
        (error.code === 'ECONNABORTED'
          ? 'API phản hồi quá chậm.'
          : 'Không thể kết nối API.')
      return Promise.reject(new ApiError(message, error.response?.status))
    }
    return Promise.reject(
      error instanceof Error ? error : new ApiError('Đã xảy ra lỗi.'),
    )
  },
)
