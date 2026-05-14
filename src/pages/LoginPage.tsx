import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUTH_IMAGES } from '../config/media'
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as
    | { from?: Location; sessionExpired?: boolean }
    | undefined
  const fromState = navState?.from
  const sessionExpired = navState?.sessionExpired === true
  const redirectTo = fromState
    ? `${fromState.pathname}${fromState.search ?? ''}${fromState.hash ?? ''}`
    : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout
      imageSrc={AUTH_IMAGES.login}
      imageLabel="TrouvTogo"
      tagline="On se retrouve là où la confiance commence."
      footnote="Connexion sécurisée — vos identifiants restent chiffrés en transit."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="mb-6 space-y-2 text-left sm:mb-7 sm:space-y-3">
          <p className="tt-overline">Connexion</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50 sm:text-4xl">
            Bon retour parmi nous
          </h1>
          <p className="text-sm leading-relaxed text-espresso-900/65 dark:text-cream-100/60">
            Pas encore de compte ?{' '}
            <Link
              className="font-semibold text-accent underline-offset-4 transition-colors hover:underline dark:text-emerald-400/95"
              to="/inscription"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="rounded-[2rem] bg-cream-50/80 p-5 shadow-soft backdrop-blur-sm ring-1 ring-espresso-900/[0.07] sm:p-7 dark:bg-night-900/60 dark:shadow-none dark:ring-white/[0.08]">
          {sessionExpired ? (
            <p
              className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
              role="status"
            >
              Votre session a expiré pour des raisons de sécurité. Reconnectez-vous pour
              continuer.
            </p>
          ) : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? (
              <p
                className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-500/15 dark:text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="mt-2 w-full" disabled={pending}>
              {pending ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-espresso-900/45 sm:mt-6 dark:text-cream-100/40">
          En vous connectant, vous acceptez une utilisation responsable de la messagerie et des annonces.
        </p>
      </motion.div>
    </AuthSplitLayout>
  )
}
