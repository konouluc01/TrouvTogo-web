import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

/**
 * Réservé aux comptes `ROLE_ADMIN` (aligné sur @PreAuthorize côté API).
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center font-sans text-sm text-espresso-900/60 dark:text-cream-100/65">
        Chargement…
      </div>
    )
  }

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
