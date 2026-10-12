import { useQuery } from '@tanstack/react-query'
import { getApiHealth } from '../../services/api/health'
export function ApiStatus() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getApiHealth(signal),
    refetchInterval: 30000,
  })
  return (
    <aside
      className={`api-status ${health.isError ? 'api-error' : ''}`}
      role="status"
      title={health.error?.message}
    >
      <span className="status-dot" />
      {health.isPending
        ? 'Đang kết nối API…'
        : health.isError
          ? `API: ${health.error.message}`
          : 'API đã kết nối'}
      {health.isError && (
        <button onClick={() => void health.refetch()}>Thử lại</button>
      )}
    </aside>
  )
}
