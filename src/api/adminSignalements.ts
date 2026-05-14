import { apiClient } from './client'
import type { ApiResponse, Signalement } from './types'

export async function adminListSignalements() {
  const { data } = await apiClient.get<ApiResponse<Signalement[]>>('/api/admin/signalements')
  return data
}

export async function adminListSignalementsUnresolved() {
  const { data } = await apiClient.get<ApiResponse<Signalement[]>>(
    '/api/admin/signalements/non-resolus',
  )
  return data
}

export async function adminResolveSignalement(id: number) {
  const { data } = await apiClient.patch<ApiResponse<Signalement>>(
    `/api/admin/signalements/${id}/resolve`,
  )
  return data
}
