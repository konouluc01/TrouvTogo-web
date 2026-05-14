import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as usersApi from '../../api/users'
import type { ApiResponse, AuthPayload, Role, UserProfile } from '../../api/types'
import { isAxiosApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { CardShell } from '../../components/ui/CardShell'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../context/ToastContext'

function roleLabel(role: Role): string {
  return role === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur'
}

function formatMemberSince(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function extractApiMessage(err: unknown): string {
  if (isAxiosApiError(err) && err.response?.data && typeof err.response.data === 'object') {
    const d = err.response.data as ApiResponse<unknown>
    if (typeof d.message === 'string' && d.message) return d.message
  }
  return err instanceof Error ? err.message : 'Une erreur est survenue'
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { applySession, logout } = useAuth()
  const { push } = useToast()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileMeta, setProfileMeta] = useState<UserProfile | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [profilePending, setProfilePending] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordPending, setPasswordPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingProfile(true)
      try {
        const res = await usersApi.getProfile()
        if (cancelled) return
        if (res.success && res.data) {
          setProfileMeta(res.data)
          setUsername(res.data.username)
          setEmail(res.data.email)
          setTelephone(res.data.telephone ?? '')
        } else {
          push({ message: res.message || 'Impossible de charger le profil', variant: 'error' })
        }
      } catch (err) {
        if (!cancelled)
          push({ message: extractApiMessage(err), variant: 'error' })
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [push])

  async function onSubmitProfile(e: FormEvent) {
    e.preventDefault()
    setProfilePending(true)
    try {
      const res = await usersApi.updateProfile({
        username: username.trim(),
        email: email.trim(),
        telephone: telephone.trim() || undefined,
      })
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Mise à jour impossible')
      }
      applySession(res.data as AuthPayload)
      setProfileMeta((prev) =>
        prev
          ? {
              ...prev,
              username: res.data!.username,
              email: res.data!.email,
              telephone: res.data!.telephone ?? null,
              role: res.data!.role,
            }
          : prev,
      )
      push({ message: 'Profil enregistré.', variant: 'success' })
    } catch (err) {
      push({ message: extractApiMessage(err), variant: 'error' })
    } finally {
      setProfilePending(false)
    }
  }

  async function onSubmitPassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      push({ message: 'Les mots de passe ne correspondent pas.', variant: 'error' })
      return
    }
    setPasswordPending(true)
    try {
      const res = await usersApi.changePassword({
        currentPassword,
        newPassword,
      })
      if (!res.success) {
        throw new Error(res.message || 'Échec du changement')
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      push({ message: 'Mot de passe mis à jour.', variant: 'success' })
    } catch (err) {
      push({ message: extractApiMessage(err), variant: 'error' })
    } finally {
      setPasswordPending(false)
    }
  }

  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
          Mon profil
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Informations du compte et sécurité. Les modifications sont synchronisées avec le serveur.
        </p>
      </div>

      <CardShell className="space-y-6">
        <div>
          <p className="tt-overline">Identité</p>
          {loadingProfile ? (
            <p className="mt-3 text-sm text-espresso-900/55 dark:text-cream-100/55">
              Chargement…
            </p>
          ) : profileMeta ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-espresso-900/50 dark:text-cream-100/45">Rôle</dt>
                <dd className="font-medium text-espresso-900 dark:text-cream-50">
                  {roleLabel(profileMeta.role)}
                </dd>
              </div>
              <div>
                <dt className="text-espresso-900/50 dark:text-cream-100/45">Membre depuis</dt>
                <dd className="font-medium text-espresso-900 dark:text-cream-50">
                  {formatMemberSince(profileMeta.createdAt)}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <form onSubmit={onSubmitProfile} className="space-y-5 border-t border-espresso-900/10 pt-6 dark:border-white/10">
          <p className="text-sm font-medium text-espresso-900 dark:text-cream-50">
            Coordonnées
          </p>
          <Input
            label="Nom d’utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            minLength={3}
            maxLength={50}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Téléphone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            autoComplete="tel"
            placeholder="Optionnel"
          />
          <Button type="submit" disabled={profilePending || loadingProfile}>
            {profilePending ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </CardShell>

      <CardShell>
        <form onSubmit={onSubmitPassword} className="space-y-5">
          <div>
            <p className="tt-overline">Sécurité</p>
            <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/65">
              Choisissez un mot de passe robuste ; vous restez connecté après le changement.
            </p>
          </div>
          <Input
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Button type="submit" variant="outline" disabled={passwordPending}>
            {passwordPending ? 'Mise à jour…' : 'Changer le mot de passe'}
          </Button>
        </form>
      </CardShell>

      <CardShell className="border-espresso-900/[0.07] dark:border-white/[0.08]">
        <p className="tt-overline">Session</p>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/65">
          Déconnectez-vous sur cet appareil. Vous pourrez vous reconnecter à tout moment.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => {
            logout()
            navigate('/', { replace: true })
            push({ message: 'Vous êtes déconnecté.', variant: 'success' })
          }}
        >
          Se déconnecter
        </Button>
      </CardShell>
    </div>
  )
}
