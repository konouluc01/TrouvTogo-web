import { apiClient } from './client'
import type { ApiResponse, AuthPayload, LoginBody, RegisterBody } from './types'

export async function login(body: LoginBody) {
  const { data } = await apiClient.post<ApiResponse<AuthPayload>>(
    '/api/auth/login',
    body,
  )
  return data
}

export async function register(body: RegisterBody) {
  const { data } = await apiClient.post<ApiResponse<AuthPayload>>(
    '/api/auth/register',
    body,
  )
  return data
}
