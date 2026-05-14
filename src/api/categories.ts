import { apiClient } from './client'
import type { ApiResponse, Categorie } from './types'

export async function listCategories() {
  const { data } = await apiClient.get<ApiResponse<Categorie[]>>(
    '/api/categories',
  )
  return data
}
