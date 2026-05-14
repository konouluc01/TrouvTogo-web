import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import * as categoriesApi from '../api/categories'
import * as objetsApi from '../api/objets'
import * as lieuxDepotApi from '../api/lieuxDepot'
import type {
  Categorie,
  ConservationTrouvaille,
  LieuDepot,
  StatutObjet,
  TypeObjet,
} from '../api/types'
import {
  datetimeLocalToBackend,
  formatDatetimeLocalFr,
  isoToDatetimeLocal,
} from '../lib/datetimeLocal'
import { DatetimeLocalModal } from '../components/ui/DatetimeLocalModal'
import { libelleTypeLieu } from '../lib/lieuLabels'
import { parseRemiseMontantInput } from '../lib/money'
import { openStreetMapEmbedUrl, openStreetMapUrl } from '../lib/geo'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ObjetPhotosField } from '../components/objet/ObjetPhotosField'
import { CardShell } from '../components/ui/CardShell'
import { TwoStepDeleteModal } from '../components/ui/TwoStepDeleteModal'
import { libelleCategorie } from '../lib/categoryLabels'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { isObjetOwner } from '../utils/objet-ownership'

const STATUT_OPTIONS: { value: StatutObjet; label: string }[] = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'RESOLU', label: 'Résolu' },
  { value: 'ARCHIVE', label: 'Archivé' },
]

export function ObjetEditPage() {
  const { id } = useParams()
  const oid = id ? Number(id) : NaN
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()

  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])

  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TypeObjet>('PERDU')
  const [localisation, setLocalisation] = useState('')
  const [categorieId, setCategorieId] = useState<number | ''>('')
  const [statut, setStatut] = useState<StatutObjet>('ACTIF')
  const [initialStatut, setInitialStatut] = useState<StatutObjet>('ACTIF')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [photosUploading, setPhotosUploading] = useState(false)
  const [pending, setPending] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)

  const [lieuxDepot, setLieuxDepot] = useState<LieuDepot[]>([])
  const [dateEvenement, setDateEvenement] = useState('')
  const [conservationTrouve, setConservationTrouve] = useState<ConservationTrouvaille | ''>('')
  const [lieuDepotId, setLieuDepotId] = useState<number | ''>('')
  const [geoPoint, setGeoPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [remiseInput, setRemiseInput] = useState('')
  const [deletePending, setDeletePending] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    categoriesApi.listCategories().then((r) => {
      if (!cancelled && r.success && r.data) setCategories(r.data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    lieuxDepotApi.listLieuxDepot().then((r) => {
      if (!cancelled && r.success && r.data) setLieuxDepot(r.data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (type !== 'TROUVE') {
      setConservationTrouve('')
      setLieuDepotId('')
      setGeoPoint(null)
    }
    if (type !== 'PERDU') {
      setRemiseInput('')
    }
  }, [type])

  useEffect(() => {
    if (!Number.isFinite(oid)) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await objetsApi.getObjet(oid)
        if (cancelled) return
        if (!res.success || !res.data) {
          push({ message: res.message || 'Annonce introuvable.', variant: 'error' })
          navigate('/objets', { replace: true })
          return
        }
        const o = res.data
        if (!user || !isObjetOwner(user, o)) {
          setForbidden(true)
          setLoading(false)
          return
        }
        setTitre(o.titre)
        setDescription(o.description ?? '')
        setType(o.type)
        setLocalisation(o.localisation ?? '')
        setCategorieId(o.categorieId ?? '')
        setStatut(o.statut)
        setInitialStatut(o.statut)
        setPhotoUrls([...(o.photosUrls ?? [])])
        setDateEvenement(isoToDatetimeLocal(o.dateEvenement))
        if (o.type === 'TROUVE') {
          setConservationTrouve(o.conservationTrouve ?? '')
          setLieuDepotId(o.lieuDepotId ?? '')
          if (
            o.latitude != null &&
            o.longitude != null &&
            Number.isFinite(o.latitude) &&
            Number.isFinite(o.longitude)
          ) {
            setGeoPoint({ lat: o.latitude, lng: o.longitude })
          } else {
            setGeoPoint(null)
          }
        } else {
          setConservationTrouve('')
          setLieuDepotId('')
          setGeoPoint(null)
        }
        if (o.type === 'PERDU' && o.remiseMontant != null && Number(o.remiseMontant) > 0) {
          setRemiseInput(String(Math.round(Number(o.remiseMontant))))
        } else {
          setRemiseInput('')
        }
      } catch {
        if (!cancelled) push({ message: 'Chargement impossible.', variant: 'error' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [oid, user, navigate, push])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!Number.isFinite(oid) || !user) return
    if (type === 'TROUVE') {
      if (!conservationTrouve) {
        push({
          message: 'Indiquez si vous conservez l’objet chez vous ou si vous l’avez déposé dans une structure.',
          variant: 'error',
        })
        return
      }
      if (conservationTrouve === 'DEPOSE_STRUCTURE') {
        if (lieuDepotId === '') {
          push({ message: 'Sélectionnez le lieu de dépôt.', variant: 'error' })
          return
        }
      }
    }

    let remiseMontant: number | null = null
    if (type === 'PERDU') {
      const parsed = parseRemiseMontantInput(remiseInput)
      if (parsed === 'invalid') {
        push({
          message: 'Indiquez un montant de remise valide (nombre entier en FCFA), ou laissez le champ vide.',
          variant: 'error',
        })
        return
      }
      remiseMontant = parsed != null && parsed > 0 ? parsed : null
    }

    setPending(true)
    try {
      const res = await objetsApi.updateObjet(oid, {
        titre: titre.trim(),
        description: description.trim() || undefined,
        type,
        localisation: localisation.trim() || undefined,
        latitude: type === 'TROUVE' && geoPoint ? geoPoint.lat : null,
        longitude: type === 'TROUVE' && geoPoint ? geoPoint.lng : null,
        dateEvenement: datetimeLocalToBackend(dateEvenement),
        categorieId: categorieId === '' ? null : Number(categorieId),
        conservationTrouve:
          type === 'TROUVE' && conservationTrouve ? conservationTrouve : null,
        lieuDepotId:
          type === 'TROUVE' && conservationTrouve === 'DEPOSE_STRUCTURE' && lieuDepotId !== ''
            ? Number(lieuDepotId)
            : null,
        photosUrls: photoUrls.length ? photoUrls : undefined,
        remiseMontant: type === 'PERDU' ? remiseMontant : null,
      })
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Mise à jour impossible')
      }

      if (statut !== initialStatut) {
        const sr = await objetsApi.patchObjetStatut(oid, statut)
        if (!sr.success) {
          push({
            message: sr.message || 'Statut non mis à jour.',
            variant: 'error',
          })
        }
      }

      push({ message: 'Annonce mise à jour.', variant: 'success' })
      navigate(`/objets/${oid}`, { replace: true })
    } catch (err) {
      push({
        message: err instanceof Error ? err.message : 'Erreur',
        variant: 'error',
      })
    } finally {
      setPending(false)
    }
  }

  async function executeDelete() {
    if (!Number.isFinite(oid)) return
    setDeletePending(true)
    try {
      const res = await objetsApi.deleteObjet(oid)
      if (!res.success) throw new Error(res.message || 'Suppression impossible')
      setDeleteModalOpen(false)
      push({ message: 'Annonce supprimée.', variant: 'success' })
      navigate('/objets', { replace: true })
    } catch (err) {
      push({
        message: err instanceof Error ? err.message : 'Erreur',
        variant: 'error',
      })
    } finally {
      setDeletePending(false)
    }
  }

  if (!Number.isFinite(oid)) {
    return <Navigate to="/objets" replace />
  }

  if (forbidden) {
    return (
      <PageFade>
        <div className="mx-auto max-w-xl px-4 pb-24 pt-28 md:px-8">
          <p className="text-sm text-espresso-900/80 dark:text-cream-100/75">
            Vous n’êtes pas autorisé à modifier cette annonce.
          </p>
          <Link
            to={`/objets/${oid}`}
            className="mt-6 inline-block font-semibold text-accent dark:text-emerald-400"
          >
            ← Retour à l’annonce
          </Link>
        </div>
        <Footer />
      </PageFade>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-32">
        <div className="h-64 animate-pulse rounded-[2rem] bg-cream-200/80 dark:bg-night-800/70" />
      </div>
    )
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8">
        <header className="mb-8 text-left">
          <p className="tt-overline">Édition</p>
          <h1 className="tt-page-title">Modifier l’annonce</h1>
          <Link
            to={`/objets/${oid}`}
            className="mt-3 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
          >
            ← Annuler et revenir à la fiche
          </Link>
        </header>

        <form onSubmit={onSubmit} className="text-left">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            <div className="flex flex-col gap-6 lg:min-w-0">
              <CardShell>
                <p className="tt-overline mb-6">Texte & lieu</p>
                <div className="space-y-5">
                  <Input
                    label="Titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    required
                    minLength={2}
                  />

                  <div className="flex flex-col gap-1.5 text-left">
                    <label
                      htmlFor="desc"
                      className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                    >
                      Description
                    </label>
                    <textarea
                      id="desc"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="tt-textarea"
                    />
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
                      Type
                    </legend>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                      {(
                        [
                          ['PERDU', 'Objet perdu'],
                          ['TROUVE', 'Objet trouvé'],
                        ] as const
                      ).map(([v, label]) => (
                        <label
                          key={v}
                          className="inline-flex cursor-pointer items-center gap-2 text-sm text-espresso-900 dark:text-cream-100"
                        >
                          <input
                            type="radio"
                            name="type"
                            value={v}
                            checked={type === v}
                            onChange={() => setType(v)}
                            className="accent-accent"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <Input
                    label={type === 'TROUVE' ? 'Lieu où l’objet a été trouvé' : 'Lieu de perte (approx.)'}
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
                      {type === 'TROUVE' ? 'Date et heure de découverte' : 'Date de la perte (approx.)'}
                    </span>
                    <button
                      type="button"
                      id="edit-date"
                      onClick={() => setDateModalOpen(true)}
                      className="tt-field-outline w-full rounded-[calc(1.25rem-0.375rem)] px-4 py-3 text-left text-sm text-espresso-900 outline-none ring-1 ring-espresso-900/[0.07] transition-[box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-espresso-900/[0.03] focus:shadow-soft dark:bg-night-900 dark:text-cream-50 dark:ring-white/[0.09] dark:hover:bg-white/[0.04]"
                    >
                      {dateEvenement.trim()
                        ? formatDatetimeLocalFr(dateEvenement)
                        : type === 'TROUVE'
                          ? 'Choisir la date et l’heure…'
                          : 'Optionnel — cliquer pour choisir'}
                    </button>
                    <DatetimeLocalModal
                      open={dateModalOpen}
                      onClose={() => setDateModalOpen(false)}
                      value={dateEvenement}
                      onCommit={setDateEvenement}
                      title={
                        type === 'TROUVE'
                          ? 'Date et heure de découverte'
                          : 'Date et heure (approx.)'
                      }
                      required={type === 'TROUVE'}
                    />
                  </div>

                  {type === 'PERDU' ? (
                    <div className="space-y-2">
                      <Input
                        id="edit-remise"
                        label="Remise pour le retrouveur (optionnel)"
                        value={remiseInput}
                        onChange={(e) => setRemiseInput(e.target.value)}
                        placeholder="Ex. 5000"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      <p className="text-xs text-espresso-900/55 dark:text-cream-100/45">
                        Montant en francs CFA offert à la personne qui vous restitue l’objet. Laissez vide si vous ne
                        proposez pas de remise.
                      </p>
                    </div>
                  ) : null}
                </div>
              </CardShell>

              {type === 'TROUVE' ? (
                <CardShell>
                  <p className="tt-overline mb-6">Où se trouve l’objet ?</p>
                  <div className="space-y-5">
                    <fieldset className="space-y-3 border-0 p-0">
                      <legend className="sr-only">Mode de conservation</legend>
                      <div className="flex flex-col gap-3">
                        <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-espresso-900 dark:text-cream-100">
                          <input
                            type="radio"
                            name="conservation-edit"
                            checked={conservationTrouve === 'CHEZ_MOI'}
                            onChange={() => {
                              setConservationTrouve('CHEZ_MOI')
                              setLieuDepotId('')
                            }}
                            className="mt-0.5 accent-accent"
                          />
                          <span>Je le garde chez moi</span>
                        </label>
                        <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-espresso-900 dark:text-cream-100">
                          <input
                            type="radio"
                            name="conservation-edit"
                            checked={conservationTrouve === 'DEPOSE_STRUCTURE'}
                            onChange={() => setConservationTrouve('DEPOSE_STRUCTURE')}
                            className="mt-0.5 accent-accent"
                          />
                          <span>Déposé dans une structure référencée</span>
                        </label>
                      </div>
                    </fieldset>
                    {conservationTrouve === 'DEPOSE_STRUCTURE' ? (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="lieu-depot-edit"
                          className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                        >
                          Lieu de dépôt
                        </label>
                        <select
                          id="lieu-depot-edit"
                          value={lieuDepotId === '' ? '' : String(lieuDepotId)}
                          onChange={(e) =>
                            setLieuDepotId(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="tt-select"
                        >
                          <option value="">— Choisir —</option>
                          {lieuxDepot.map((l) => (
                            <option key={l.id} value={l.id}>
                              {libelleTypeLieu(l.typeLieu)} — {l.nom}
                              {l.ville ? ` (${l.ville})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </CardShell>
              ) : null}
            </div>

            <div className="flex flex-col gap-6 lg:min-w-0">
              {type === 'TROUVE' ? (
                <CardShell>
                  <p className="tt-overline mb-6">Précision géographique</p>
                  <div className="space-y-5">
                    <p className="text-sm text-espresso-900/75 dark:text-cream-100/70">
                      Facultatif : cliquez pour enregistrer le point exact via le navigateur (aucune saisie manuelle).
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        if (!navigator.geolocation) {
                          push({
                            message: 'La géolocalisation n’est pas disponible sur cet appareil.',
                            variant: 'error',
                          })
                          return
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setGeoPoint({
                              lat: pos.coords.latitude,
                              lng: pos.coords.longitude,
                            })
                            push({ message: 'Position enregistrée.', variant: 'success' })
                          },
                          () => {
                            push({
                              message:
                                'Impossible d’obtenir votre position. Vérifiez les permissions du navigateur.',
                              variant: 'error',
                            })
                          },
                          { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
                        )
                      }}
                    >
                      Utiliser ma position
                    </Button>
                    {geoPoint ? (
                      <div className="space-y-2">
                        <p className="text-xs tabular-nums text-espresso-900/65 dark:text-cream-100/55">
                          {geoPoint.lat.toFixed(5)}, {geoPoint.lng.toFixed(5)}
                        </p>
                        <div className="overflow-hidden rounded-2xl ring-1 ring-espresso-900/[0.08] dark:ring-white/10">
                          <iframe
                            title="Aperçu carte — lieu de découverte"
                            src={openStreetMapEmbedUrl(geoPoint.lat, geoPoint.lng)}
                            className="block h-[220px] w-full border-0 bg-cream-100 dark:bg-night-900"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />
                        </div>
                        <a
                          href={openStreetMapUrl(geoPoint.lat, geoPoint.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
                        >
                          Ouvrir dans OpenStreetMap ↗
                        </a>
                      </div>
                    ) : null}
                    <p className="text-[11px] leading-relaxed text-espresso-900/50 dark:text-cream-100/40">
                      La position dépend de votre appareil et du réseau ; elle reste indicative.
                    </p>
                  </div>
                </CardShell>
              ) : null}

              <CardShell>
                <p className="tt-overline mb-6">Catégorie, statut & photos</p>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="cat"
                      className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                    >
                      Catégorie
                    </label>
                    <select
                      id="cat"
                      value={categorieId === '' ? '' : String(categorieId)}
                      onChange={(e) =>
                        setCategorieId(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="tt-select"
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {libelleCategorie(c.nom, c.description)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="statut"
                      className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                    >
                      Statut de l’annonce
                    </label>
                    <select
                      id="statut"
                      value={statut}
                      onChange={(e) => setStatut(e.target.value as StatutObjet)}
                      className="tt-select"
                    >
                      {STATUT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ObjetPhotosField
                    urls={photoUrls}
                    onChange={setPhotoUrls}
                    disabled={pending}
                    onBusyChange={setPhotosUploading}
                  />
                </div>
              </CardShell>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="submit" disabled={pending || photosUploading}>
              {pending ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending || photosUploading}
              onClick={() => navigate(`/objets/${oid}`)}
            >
              Annuler
            </Button>
          </div>
        </form>

        <div className="mt-10 border-t border-espresso-900/10 pt-8 dark:border-white/10">
          <p className="tt-overline mb-1">Zone sensible</p>
          <p className="text-xs text-espresso-900/55 dark:text-cream-100/45">
            La suppression retire définitivement l’annonce du fil public.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 !text-red-700 hover:!ring-red-500/30 dark:!text-red-300"
            disabled={pending || photosUploading || deletePending}
            onClick={() => setDeleteModalOpen(true)}
          >
            Supprimer cette annonce
          </Button>
        </div>
      </div>
      <Footer />
      <TwoStepDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          if (!deletePending) setDeleteModalOpen(false)
        }}
        onConfirmDelete={executeDelete}
        pending={deletePending}
        itemLabel={titre.trim() || undefined}
      />
    </PageFade>
  )
}
