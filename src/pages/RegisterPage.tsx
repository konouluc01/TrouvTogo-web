import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUTH_IMAGES } from '../config/media'
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register({
        username,
        email,
        password,
        telephone: telephone || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout
      imageSrc={AUTH_IMAGES.register}
      imageLabel="Rejoindre la communauté"
      tagline="Une annonce peut tout changer — pour vous ou pour quelqu’un d’autre."
      footnote="Inscription gratuite. Partagez uniquement ce qui vous semble utile à la recherche."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="mb-5 space-y-2 text-left sm:mb-6 sm:space-y-3">
          <p className="tt-overline">Inscription</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50 sm:text-4xl">
            Créer un compte TrouvTogo
          </h1>
          <p className="text-sm leading-relaxed text-espresso-900/65 dark:text-cream-100/60">
            Déjà inscrit ?{' '}
            <Link
              className="font-semibold text-accent underline-offset-4 transition-colors hover:underline dark:text-emerald-400/95"
              to="/connexion"
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div className="rounded-[2rem] bg-cream-50/80 p-5 shadow-soft backdrop-blur-sm ring-1 ring-espresso-900/[0.07] sm:p-6 dark:bg-night-900/60 dark:shadow-none dark:ring-white/[0.08]">
          <form onSubmit={onSubmit} className="space-y-3.5 sm:space-y-4">
            <Input
              label="Nom d’utilisateur"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Téléphone (optionnel)"
              type="tel"
              autoComplete="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
            <Input
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              {pending ? 'Création…' : 'Créer mon compte'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-espresso-900/45 sm:mt-5 dark:text-cream-100/40">
          Nous utilisons votre email pour la connexion et les notifications essentielles liées à vos annonces.
        </p>
      </motion.div>
    </AuthSplitLayout>
  )
}
