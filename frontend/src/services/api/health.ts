import { apiClient, ApiError } from './client'
import type { ApiResponse } from '../../types/api'
export async function getApiHealth(
  signal?: AbortSignal,
): Promise<ApiResponse<null>> {
  const { data } = await apiClient.get<ApiResponse<null>>('/health', { signal })
  if (
    data.success !== true ||
    typeof data.message !== 'string' ||
    data.data !== null
  )
    throw new ApiError('API trả về dữ liệu sức khỏe không hợp lệ.')
  return data
}
