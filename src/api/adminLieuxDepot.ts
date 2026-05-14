import { apiClient } from './client'
import type { ApiResponse, LieuDepot, LieuDepotPayload } from './types'

export async function adminListLieuxDepot() {
  const { data } = await apiClient.get<ApiResponse<LieuDepot[]>>('/api/admin/lieux-depot')
  return data
}

export async function adminGetLieuDepot(id: number) {
  const { data } = await apiClient.get<ApiResponse<LieuDepot>>(`/api/admin/lieux-depot/${id}`)
  return data
}

export async function adminCreateLieuDepot(body: LieuDepotPayload) {
  const { data } = await apiClient.post<ApiResponse<LieuDepot>>('/api/admin/lieux-depot', body)
  return data
}

export async function adminUpdateLieuDepot(id: number, body: LieuDepotPayload) {
  const { data } = await apiClient.put<ApiResponse<LieuDepot>>(
    `/api/admin/lieux-depot/${id}`,
    body,
  )
  return data
}

export async function adminDeleteLieuDepot(id: number) {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/api/admin/lieux-depot/${id}`)
  return data
}
