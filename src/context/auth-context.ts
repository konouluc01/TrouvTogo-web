import { createContext } from 'react'
import type { AuthPayload, LoginBody, RegisterBody } from '../api/types'

export interface AuthContextValue {
  user: AuthPayload | null
  token: string | null
  loading: boolean
  login: (body: LoginBody) => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  logout: () => void
  /** Après mise à jour profil : nouveau JWT + payload utilisateur */
  applySession: (payload: AuthPayload) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
