import { apiClient } from './client'
import type { ApiResponse, Categorie, CategoriePayload } from './types'

export async function adminListCategories() {
  const { data } = await apiClient.get<ApiResponse<Categorie[]>>('/api/admin/categories')
  return data
}

export async function adminGetCategory(id: number) {
  const { data } = await apiClient.get<ApiResponse<Categorie>>(`/api/admin/categories/${id}`)
  return data
}

export async function adminCreateCategory(body: CategoriePayload) {
  const { data } = await apiClient.post<ApiResponse<Categorie>>('/api/admin/categories', body)
  return data
}

export async function adminUpdateCategory(id: number, body: CategoriePayload) {
  const { data } = await apiClient.put<ApiResponse<Categorie>>(
    `/api/admin/categories/${id}`,
    body,
  )
  return data
}

export async function adminDeleteCategory(id: number) {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/api/admin/categories/${id}`)
  return data
}
