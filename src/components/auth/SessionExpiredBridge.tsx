import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setSessionExpiredHandler } from '../../api/client'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../context/ToastContext'

export function SessionExpiredBridge() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  const { logout } = useAuth()
  const { push } = useToast()
  const logoutRef = useRef(logout)
  logoutRef.current = logout

  useEffect(() => {
    setSessionExpiredHandler(() => {
      logoutRef.current()
      push({
        variant: 'info',
        message: 'Votre session a expiré. Reconnectez-vous pour continuer.',
      })
      const path = window.location.pathname
      if (path === '/connexion' || path === '/inscription') return
      navigate('/connexion', {
        replace: true,
        state: {
          sessionExpired: true,
          from: locationRef.current,
        },
      })
    })
    return () => setSessionExpiredHandler(null)
  }, [navigate, push])

  return null
}
