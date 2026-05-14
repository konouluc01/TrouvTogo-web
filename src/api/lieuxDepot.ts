import { apiClient } from './client'
import type { ApiResponse, LieuDepot } from './types'

/** Liste publique : lieux actifs uniquement */
export async function listLieuxDepot() {
  const { data } = await apiClient.get<ApiResponse<LieuDepot[]>>('/api/lieux-depot')
  return data
}
