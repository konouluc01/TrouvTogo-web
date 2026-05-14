import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as categoriesApi from '../api/categories'
import * as objetsApi from '../api/objets'
import type { Categorie, TypeObjet } from '../api/types'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ObjetPhotosField } from '../components/objet/ObjetPhotosField'
import { CardShell } from '../components/ui/CardShell'
import { useToast } from '../context/ToastContext'
import { libelleCategorie } from '../lib/categoryLabels'
import { DatetimeLocalModal } from '../components/ui/DatetimeLocalModal'
import {
  datetimeLocalToBackend,
  formatDatetimeLocalFr,
} from '../lib/datetimeLocal'
import * as lieuxDepotApi from '../api/lieuxDepot'
import type { ConservationTrouvaille, LieuDepot } from '../api/types'
import { libelleTypeLieu } from '../lib/lieuLabels'
import { parseRemiseMontantInput } from '../lib/money'
import { openStreetMapEmbedUrl, openStreetMapUrl } from '../lib/geo'

function parseTypeParam(v: string | null): TypeObjet {
  return v === 'TROUVE' ? 'TROUVE' : 'PERDU'
}

export function ObjetNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { push } = useToast()

  const [categories, setCategories] = useState<Categorie[]>([])
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TypeObjet>(() =>
    parseTypeParam(searchParams.get('type')),
  )
  const [localisation, setLocalisation] = useState('')
  /** Format contrôle natif `datetime-local` (yyyy-MM-ddThh:mm) */
  const [dateEvenement, setDateEvenement] = useState('')
  const [categorieId, setCategorieId] = useState<number | ''>('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [photosUploading, setPhotosUploading] = useState(false)
  const [pending, setPending] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)

  const [lieuxDepot, setLieuxDepot] = useState<LieuDepot[]>([])
  const [conservationTrouve, setConservationTrouve] = useState<ConservationTrouvaille | ''>('')
  const [lieuDepotId, setLieuDepotId] = useState<number | ''>('')
  /** Rempli uniquement via « Utiliser ma position » (pas de saisie manuelle). */
  const [geoPoint, setGeoPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [remiseInput, setRemiseInput] = useState('')

  useEffect(() => {
    setType(parseTypeParam(searchParams.get('type')))
  }, [searchParams])

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (type === 'TROUVE' && !dateEvenement.trim()) {
      push({
        message: 'Indiquez la date (et l’heure) à laquelle l’objet a été trouvé.',
        variant: 'error',
      })
      return
    }
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
          push({
            message: 'Sélectionnez le lieu où l’objet a été déposé.',
            variant: 'error',
          })
          return
        }
        if (lieuxDepot.length === 0) {
          push({
            message:
              'Aucun lieu de dépôt n’est encore configuré. Contactez l’équipe ou gardez l’objet chez vous.',
            variant: 'error',
          })
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
      const res = await objetsApi.createObjet({
        titre: titre.trim(),
        description: description.trim() || undefined,
        type,
        localisation: localisation.trim() || undefined,
        latitude:
          type === 'TROUVE' && geoPoint ? geoPoint.lat : null,
        longitude:
          type === 'TROUVE' && geoPoint ? geoPoint.lng : null,
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
        throw new Error(res.message || 'Publication impossible')
      }
      push({ message: 'Annonce publiée.', variant: 'success' })
      navigate(`/objets/${res.data.id}`, { replace: true })
    } catch (err) {
      push({
        message: err instanceof Error ? err.message : 'Erreur',
        variant: 'error',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8">
        <header className="mb-8 text-left">
          <p className="tt-overline">Publication</p>
          <h1 className="tt-page-title">
            {type === 'TROUVE' ? 'Publier un objet trouvé' : 'Signaler un objet perdu'}
          </h1>
          <Link
            to="/objets"
            className="mt-3 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
          >
            ← Retour aux annonces
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
                      htmlFor="new-desc"
                      className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                    >
                      Description
                    </label>
                    <textarea
                      id="new-desc"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="tt-textarea"
                      placeholder={
                        type === 'TROUVE'
                          ? 'Ex. état de l’objet, lieu précis de dépôt, précautions pour la remise…'
                          : 'Ex. signes distinctifs, dernières fois vu avec…'
                      }
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
                            name="type-new"
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
                    placeholder={type === 'TROUVE' ? 'Quartier, adresse, lieu public…' : 'Quartier, rue, repère…'}
                  />

                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
                      {type === 'TROUVE'
                        ? 'Date et heure de découverte'
                        : 'Date de la perte (approx.)'}
                      {type === 'TROUVE' ? (
                        <span className="ml-1 font-semibold text-red-800/90 dark:text-red-300/90">*</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      id="new-date"
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
                    <p className="text-xs text-espresso-900/55 dark:text-cream-100/45">
                      {type === 'TROUVE'
                        ? 'Obligatoire pour une annonce « trouvé » — aide les propriétaires à vérifier la correspondance.'
                        : 'Facultatif mais recommandé pour retrouver plus vite une correspondance.'}
                    </p>
                  </div>

                  {type === 'PERDU' ? (
                    <div className="space-y-2">
                      <Input
                        id="new-remise"
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
                            name="conservation-new"
                            checked={conservationTrouve === 'CHEZ_MOI'}
                            onChange={() => {
                              setConservationTrouve('CHEZ_MOI')
                              setLieuDepotId('')
                            }}
                            className="mt-0.5 accent-accent"
                          />
                          <span>
                            Je le garde chez moi en attendant de retrouver le propriétaire
                          </span>
                        </label>
                        <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-espresso-900 dark:text-cream-100">
                          <input
                            type="radio"
                            name="conservation-new"
                            checked={conservationTrouve === 'DEPOSE_STRUCTURE'}
                            onChange={() => setConservationTrouve('DEPOSE_STRUCTURE')}
                            className="mt-0.5 accent-accent"
                          />
                          <span>
                            Je l’ai déposé dans une structure (commissariat, mairie, etc.)
                          </span>
                        </label>
                      </div>
                    </fieldset>
                    {conservationTrouve === 'DEPOSE_STRUCTURE' ? (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="lieu-depot"
                          className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                        >
                          Lieu de dépôt
                          <span className="ml-1 font-semibold text-red-800/90 dark:text-red-300/90">*</span>
                        </label>
                        <select
                          id="lieu-depot"
                          value={lieuDepotId === '' ? '' : String(lieuDepotId)}
                          onChange={(e) =>
                            setLieuDepotId(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          required={conservationTrouve === 'DEPOSE_STRUCTURE'}
                          className="tt-select"
                        >
                          <option value="">— Choisir dans la liste —</option>
                          {lieuxDepot.map((l) => (
                            <option key={l.id} value={l.id}>
                              {libelleTypeLieu(l.typeLieu)} — {l.nom}
                              {l.ville ? ` (${l.ville})` : ''}
                            </option>
                          ))}
                        </select>
                        {lieuxDepot.length === 0 ? (
                          <p className="text-xs text-amber-800/90 dark:text-amber-200/85">
                            Aucun lieu n’est disponible pour l’instant. Choisissez « chez moi » ou revenez plus
                            tard.
                          </p>
                        ) : (
                          <p className="text-xs text-espresso-900/55 dark:text-cream-100/45">
                            Liste administrée par TrouvTogo : coordonnées et horaires peuvent figurer sous le nom du
                            lieu.
                          </p>
                        )}
                      </div>
                    ) : null}
                    <p className="text-[11px] leading-relaxed text-espresso-900/50 dark:text-cream-100/40">
                      Les dépôts d’objets trouvés sont soumis aux règles locales. En cas de doute, renseignez-vous
                      auprès de la structure concernée.
                    </p>
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
                      Facultatif : enregistrez le point exact où vous avez trouvé l’objet (en complément du lieu
                      texte). Cliquez sur le bouton pour autoriser la récupération des coordonnées par le navigateur.
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
                <p className="tt-overline mb-6">Catégorie & photos</p>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-cat"
                      className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                    >
                      Catégorie
                    </label>
                    <select
                      id="new-cat"
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
              {pending ? 'Publication…' : 'Publier l’annonce'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending || photosUploading}
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </PageFade>
  )
}
