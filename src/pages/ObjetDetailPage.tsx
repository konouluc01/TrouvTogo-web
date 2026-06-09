import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as objetsApi from '../api/objets'
import type { Objet } from '../api/types'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { Button } from '../components/ui/Button'
import { CardShell } from '../components/ui/CardShell'
import { libelleCategorie } from '../lib/categoryLabels'
import { libelleConservation, libelleTypeLieu } from '../lib/lieuLabels'
import { openStreetMapEmbedUrl, openStreetMapUrl } from '../lib/geo'
import { useAuth } from '../context/useAuth'
import { isObjetOwner } from '../utils/objet-ownership'
import { formatMontantXof } from '../lib/money'
import { SignalementModal } from '../components/objet/SignalementModal'
import { TwoStepDeleteModal } from '../components/ui/TwoStepDeleteModal'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

export function ObjetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [objet, setObjet] = useState<Objet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false)
  const [isSignalling, setIsSignalling] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await objetsApi.getObjet(Number(id))
        if (cancelled) return
        if (res.success && res.data) setObjet(res.data)
        else setError(res.message || 'Objet introuvable')
      } catch {
        if (!cancelled) setError('Impossible de charger l’objet.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSignalement(message: string) {
    if (!objet) return
    setIsSignalling(true)
    try {
      const res = await objetsApi.createSignalement(objet.id, message)
      if (res.success) {
        toast.push({
          variant: 'success',
          message: 'Merci. Votre signalement a été envoyé à l’administration.',
        })
        setIsSignalModalOpen(false)
      } else {
        toast.push({ variant: 'error', message: res.message || 'Erreur lors de l’envoi.' })
      }
    } catch {
      toast.push({ variant: 'error', message: 'Impossible d’envoyer le signalement.' })
    } finally {
      setIsSignalling(false)
    }
  }

  async function handleDelete() {
    if (!objet) return
    setIsDeleting(true)
    try {
      const res = await objetsApi.deleteObjet(objet.id)
      if (res.success) {
        toast.push({ variant: 'success', message: 'Annonce supprimée avec succès.' })
        navigate('/objets')
      } else {
        toast.push({ variant: 'error', message: res.message || 'Erreur lors de la suppression.' })
      }
    } catch {
      toast.push({ variant: 'error', message: 'Impossible de supprimer l’annonce.' })
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  if (error) {
    return (
      <PageFade>
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <Link
            className="mt-6 inline-block font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
            to="/objets"
          >
            ← Retour aux annonces
          </Link>
        </div>
      </PageFade>
    )
  }

  if (!objet) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-32">
        <div className="h-96 animate-pulse rounded-[2rem] bg-cream-200/80 dark:bg-night-800/70" />
      </div>
    )
  }

  const typeLabel = objet.type === 'PERDU' ? 'Perdu' : 'Trouvé'
  const isOwner = !!user && isObjetOwner(user, objet)

  return (
    <PageFade>
      <article className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8">
        <Link
          to="/objets"
          className="mb-8 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
        >
          ← Annonces
        </Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-[2rem] bg-black/[0.025] p-2 ring-1 ring-espresso-900/[0.06] dark:bg-white/[0.03] dark:ring-white/10">
              <div className="aspect-[4/3] overflow-hidden rounded-[calc(2rem-0.5rem)] bg-cream-200 dark:bg-night-800">
                {objet.photosUrls?.[0] ? (
                  <img
                    src={objet.photosUrls[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-espresso-900/35 dark:text-cream-100/30">
                    Pas d’image
                  </div>
                )}
              </div>
            </div>
            {objet.photosUrls && objet.photosUrls.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {objet.photosUrls.slice(1).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover ring-1 ring-espresso-900/10 dark:ring-white/15"
                  />
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-6 text-left">
            <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent dark:bg-emerald-500/15 dark:text-emerald-300">
              {typeLabel}
            </span>
            <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
              {objet.titre}
            </h1>
            {objet.description ? (
              <p className="text-base leading-relaxed text-espresso-900/75 dark:text-cream-100/75">
                {objet.description}
              </p>
            ) : null}
            <CardShell>
              <dl className="space-y-3 text-sm">
                {objet.localisation ? (
                  <div>
                    <dt className="tt-overline">Lieu</dt>
                    <dd className="mt-1 text-espresso-900 dark:text-cream-50">
                      {objet.localisation}
                    </dd>
                  </div>
                ) : null}
                {objet.type === 'PERDU' &&
                objet.remiseMontant != null &&
                Number(objet.remiseMontant) > 0 ? (
                  <div>
                    <dt className="tt-overline">Remise proposée</dt>
                    <dd className="mt-1 font-semibold text-espresso-900 dark:text-cream-50">
                      {formatMontantXof(Number(objet.remiseMontant))}
                    </dd>
                    <dd className="mt-1 text-xs text-espresso-900/65 dark:text-cream-100/55">
                      Montant offert par le déclarant au retrouveur en échange de la restitution.
                    </dd>
                  </div>
                ) : null}
                {objet.type === 'TROUVE' &&
                objet.latitude != null &&
                objet.longitude != null &&
                Number.isFinite(objet.latitude) &&
                Number.isFinite(objet.longitude) ? (
                  <div>
                    <dt className="tt-overline">Point GPS</dt>
                    <dd className="mt-2 space-y-3">
                      <p className="text-xs tabular-nums text-espresso-900/80 dark:text-cream-100/75">
                        {objet.latitude.toFixed(5)}, {objet.longitude.toFixed(5)}
                      </p>
                      <div className="overflow-hidden rounded-2xl ring-1 ring-espresso-900/[0.08] dark:ring-white/10">
                        <iframe
                          title="Carte — point signalé"
                          src={openStreetMapEmbedUrl(objet.latitude, objet.longitude)}
                          className="block h-[220px] w-full max-w-md border-0 bg-cream-100 dark:bg-night-900"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={openStreetMapUrl(objet.latitude, objet.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
                      >
                        Voir sur la carte ↗
                      </a>
                    </dd>
                  </div>
                ) : null}
                {objet.type === 'TROUVE' && objet.conservationTrouve ? (
                  <div>
                    <dt className="tt-overline">Conservation</dt>
                    <dd className="mt-1 text-espresso-900 dark:text-cream-50">
                      {libelleConservation(objet.conservationTrouve)}
                    </dd>
                  </div>
                ) : null}
                {objet.type === 'TROUVE' &&
                objet.conservationTrouve === 'DEPOSE_STRUCTURE' &&
                objet.lieuDepotNom ? (
                  <div>
                    <dt className="tt-overline">Lieu de dépôt</dt>
                    <dd className="mt-1 space-y-1 text-espresso-900 dark:text-cream-50">
                      <span className="block font-medium">
                        {objet.lieuDepotTypeLieu
                          ? `${libelleTypeLieu(objet.lieuDepotTypeLieu)} — `
                          : ''}
                        {objet.lieuDepotNom}
                      </span>
                      {[objet.lieuDepotAdresse, objet.lieuDepotVille].filter(Boolean).length ? (
                        <span className="block text-sm text-espresso-900/85 dark:text-cream-100/80">
                          {[objet.lieuDepotAdresse, objet.lieuDepotVille].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                      {objet.lieuDepotTelephone ? (
                        <span className="block text-sm">
                          Tél.{' '}
                          <a
                            href={`tel:${objet.lieuDepotTelephone.replace(/\s/g, '')}`}
                            className="font-medium text-accent underline-offset-2 hover:underline dark:text-emerald-400"
                          >
                            {objet.lieuDepotTelephone}
                          </a>
                        </span>
                      ) : null}
                      {objet.lieuDepotIndication ? (
                        <span className="block text-xs text-espresso-900/70 dark:text-cream-100/60">
                          {objet.lieuDepotIndication}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                {objet.categorieNom || objet.categorieDescription ? (
                  <div>
                    <dt className="tt-overline">Catégorie</dt>
                    <dd className="mt-1 text-espresso-900 dark:text-cream-50">
                      {libelleCategorie(objet.categorieNom, objet.categorieDescription)}
                    </dd>
                  </div>
                ) : null}
                {objet.proprietaireUsername ? (
                  <div>
                    <dt className="tt-overline">Publié par</dt>
                    <dd className="mt-1 text-espresso-900 dark:text-cream-50">
                      {objet.proprietaireUsername}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardShell>
            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <Link to={`/objets/${objet.id}/modifier`}>
                    <Button variant="primary">
                      Modifier mon annonce
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="!border-red-500/35 !text-red-700 !ring-red-500/30 hover:!bg-red-500/10 dark:!border-red-400/40 dark:!text-red-300"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Supprimer
                  </Button>
                </>
              ) : user ? (
                <>
                  <Link to={`/messages?objet=${objet.id}`}>
                    <Button
                      trailing={<span className="text-lg leading-none">↗</span>}
                    >
                      Contacter via la plateforme
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => setIsSignalModalOpen(true)}
                  >
                    Signaler l'annonce
                  </Button>
                </>
              ) : (
                <Link to="/connexion" state={{ from: { pathname: `/objets/${objet.id}` } }}>
                  <Button variant="primary">
                    Se connecter pour contacter
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-xs text-espresso-900/50 dark:text-cream-100/45">
              {isOwner
                ? 'Vous êtes l’auteur de cette annonce — mettez-la à jour ou changez son statut depuis la page d’édition.'
                : user
                  ? 'Les échanges passent par la messagerie TrouvTogo pour plus de sécurité.'
                  : 'Connectez-vous pour envoyer un message sécurisé au propriétaire de l’annonce.'}
            </p>
          </div>
        </div>
      </article>

      <SignalementModal
        open={isSignalModalOpen}
        onClose={() => setIsSignalModalOpen(false)}
        onConfirm={handleSignalement}
        pending={isSignalling}
        itemLabel={objet.titre}
      />

      <TwoStepDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleDelete}
        pending={isDeleting}
        itemLabel={objet.titre}
      />

      <Footer />
    </PageFade>
  )
}
