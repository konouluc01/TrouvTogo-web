import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { isJwtExpired } from '../lib/jwtExpiry'

const TOKEN_KEY = 'trouvtogo_token'
const USER_KEY = 'trouvtogo_user'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Vide token + cache utilisateur (aligné sur AuthProvider). */
export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

type SessionExpiredHandler = (() => void) | null

let sessionExpiredHandler: SessionExpiredHandler = null
let sessionExpireFiring = false

export function setSessionExpiredHandler(fn: SessionExpiredHandler): void {
  sessionExpiredHandler = fn
}

function fireSessionExpired(): void {
  if (sessionExpireFiring) return
  sessionExpireFiring = true
  try {
    clearAuthStorage()
    sessionExpiredHandler?.()
  } finally {
    window.setTimeout(() => {
      sessionExpireFiring = false
    }, 1500)
  }
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/register')
}

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    if (isJwtExpired(token)) {
      fireSessionExpired()
      return Promise.reject(new Error('Session expirée'))
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (!axios.isAxiosError(err) || !err.response) {
      return Promise.reject(err)
    }
    if (err.response.status !== 401) {
      return Promise.reject(err)
    }
    const url = String(err.config?.url ?? '')
    if (isAuthEndpoint(url)) {
      return Promise.reject(err)
    }
    fireSessionExpired()
    return Promise.reject(err)
  },
)

export function isAxiosApiError(err: unknown): err is AxiosError<unknown> {
  return axios.isAxiosError(err)
}
