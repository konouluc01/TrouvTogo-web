import { apiClient } from './client'
import type {
  ApiResponse,
  AuthPayload,
  ChangePasswordBody,
  UpdateProfileBody,
  UserProfile,
} from './types'

/** Profil connecté — doit correspondre au backend `GET|PUT /api/users/me` */
const API_USERS_ME = '/api/users/me'

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(API_USERS_ME)
  return data
}

export async function updateProfile(body: UpdateProfileBody) {
  const { data } = await apiClient.put<ApiResponse<AuthPayload>>(API_USERS_ME, body)
  return data
}

export async function changePassword(body: ChangePasswordBody) {
  const { data } = await apiClient.put<ApiResponse<void>>(
    `${API_USERS_ME}/password`,
    body,
  )
  return data
}
