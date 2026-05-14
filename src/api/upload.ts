import { apiClient } from './client'
import type { ApiResponse } from './types'

export async function uploadImages(files: File[]) {
  const form = new FormData()
  for (const f of files) {
    form.append('files', f)
  }
  const { data } = await apiClient.post<ApiResponse<{ urls: string[] }>>(
    '/api/upload/images',
    form,
  )
  return data
}
