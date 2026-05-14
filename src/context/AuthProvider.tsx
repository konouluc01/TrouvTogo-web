import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import {
  setStoredToken,
  getStoredToken,
  clearAuthStorage,
} from '../api/client'
import { isJwtExpired } from '../lib/jwtExpiry'
import type { AuthPayload, LoginBody, RegisterBody } from '../api/types'
import { AuthContext } from './auth-context'

const USER_KEY = 'trouvtogo_user'

function readStoredUser(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthPayload
  } catch {
    return null
  }
}

function persistUser(user: AuthPayload | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthPayload | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = getStoredToken()
    const u = readStoredUser()
    if (t && u) {
      if (isJwtExpired(t)) {
        clearAuthStorage()
      } else {
        setToken(t)
        setUser(u)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (body: LoginBody) => {
    const res = await authApi.login(body)
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Connexion impossible')
    }
    const { token: newToken, ...rest } = res.data
    const payload: AuthPayload = { ...rest, token: newToken }
    setStoredToken(newToken)
    persistUser(payload)
    setToken(newToken)
    setUser(payload)
  }, [])

  const register = useCallback(async (body: RegisterBody) => {
    const res = await authApi.register(body)
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Inscription impossible')
    }
    const { token: newToken, ...rest } = res.data
    const payload: AuthPayload = { ...rest, token: newToken }
    setStoredToken(newToken)
    persistUser(payload)
    setToken(newToken)
    setUser(payload)
  }, [])

  const logout = useCallback(() => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }, [])

  const applySession = useCallback((payload: AuthPayload) => {
    setStoredToken(payload.token)
    persistUser(payload)
    setToken(payload.token)
    setUser(payload)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, applySession }),
    [user, token, loading, login, register, logout, applySession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
