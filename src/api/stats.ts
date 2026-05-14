import { apiClient } from './client'
import type { ApiResponse, CommunauteStats, TimeSeriesPoint } from './types'

export async function getCommunauteStats() {
  const { data } = await apiClient.get<ApiResponse<CommunauteStats>>(
    '/api/stats/communaute',
  )
  return data
}

export async function getTimeSeries(months = 6) {
  const { data } = await apiClient.get<ApiResponse<TimeSeriesPoint[]>>(
    '/api/stats/timeseries',
    { params: { months } },
  )
  return data
}
