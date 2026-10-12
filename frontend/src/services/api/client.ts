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
  headers: { Accept: 'application/json' },
})
apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) throw new ApiError('Chưa cấu hình VITE_API_BASE_URL.')
  return config
})
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
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
