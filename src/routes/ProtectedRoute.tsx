import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center font-sans text-sm text-espresso-900/60 dark:text-cream-100/65">
        Chargement…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  return <>{children}</>
}
