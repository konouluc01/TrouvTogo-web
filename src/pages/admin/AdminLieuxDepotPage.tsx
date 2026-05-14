import { type FormEvent, useCallback, useEffect, useState } from 'react'
import * as adminLieuxApi from '../../api/adminLieuxDepot'
import type { LieuDepot, LieuDepotPayload, TypeLieuDepot } from '../../api/types'
import { isAxiosApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { CardShell } from '../../components/ui/CardShell'
import { Input } from '../../components/ui/Input'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { TwoStepDeleteModal } from '../../components/ui/TwoStepDeleteModal'
import { useClientListFilter } from '../../hooks/useClientListFilter'
import { useToast } from '../../context/ToastContext'
import { libelleTypeLieu } from '../../lib/lieuLabels'

const TYPES_LIEU: TypeLieuDepot[] = ['COMMISSARIAT', 'GENDARMERIE', 'MAIRIE', 'AUTRE']
const PAGE_SIZE = 8

function apiErr(err: unknown): string {
  if (isAxiosApiError(err) && err.response?.data && typeof err.response.data === 'object') {
    const m = (err.response.data as { message?: string }).message
    if (m) return m
  }
  return err instanceof Error ? err.message : 'Erreur'
}

export function AdminLieuxDepotPage() {
  const { push } = useToast()
  const [rows, setRows] = useState<LieuDepot[]>([])
  const [loading, setLoading] = useState(true)
  const [listSearch, setListSearch] = useState('')
  const [listPage, setListPage] = useState(1)

  const [createType, setCreateType] = useState<TypeLieuDepot>('COMMISSARIAT')
  const [createNom, setCreateNom] = useState('')
  const [createAdresse, setCreateAdresse] = useState('')
  const [createVille, setCreateVille] = useState('')
  const [createTel, setCreateTel] = useState('')
  const [createIndic, setCreateIndic] = useState('')
  const [createActif, setCreateActif] = useState(true)
  const [createPending, setCreatePending] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState<TypeLieuDepot>('COMMISSARIAT')
  const [editNom, setEditNom] = useState('')
  const [editAdresse, setEditAdresse] = useState('')
  const [editVille, setEditVille] = useState('')
  const [editTel, setEditTel] = useState('')
  const [editIndic, setEditIndic] = useState('')
  const [editActif, setEditActif] = useState(true)
  const [savePending, setSavePending] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const refresh = useCallback(async () => {
    const res = await adminLieuxApi.adminListLieuxDepot()
    if (res.success && res.data) setRows(res.data)
    else push({ message: res.message || 'Liste impossible', variant: 'error' })
  }, [push])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refresh()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const matchLieu = useCallback((l: LieuDepot, q: string) => {
    const parts = [
      l.nom,
      l.ville,
      l.adresse,
      l.telephone,
      l.indication,
      libelleTypeLieu(l.typeLieu),
      l.typeLieu,
    ]
    return parts.some((p) => (p ?? '').toLowerCase().includes(q))
  }, [])

  const {
    filtered: filteredLieux,
    pageSlice,
    totalPages,
    totalItems,
    currentPage,
    rangeStart,
    rangeEnd,
  } = useClientListFilter(rows, listSearch, matchLieu, listPage, PAGE_SIZE)

  useEffect(() => {
    setListPage(1)
  }, [listSearch])

  useEffect(() => {
    if (currentPage !== listPage) setListPage(currentPage)
  }, [currentPage, listPage])

  useEffect(() => {
    setEditingId(null)
  }, [listSearch])

  function payloadBase(
    typeLieu: TypeLieuDepot,
    nom: string,
    adresse: string,
    ville: string,
    tel: string,
    indic: string,
    actif: boolean,
  ): LieuDepotPayload {
    return {
      typeLieu,
      nom: nom.trim(),
      adresse: adresse.trim() || undefined,
      ville: ville.trim() || undefined,
      telephone: tel.trim() || undefined,
      indication: indic.trim() || undefined,
      actif,
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!createNom.trim()) return
    setCreatePending(true)
    try {
      const body = payloadBase(
        createType,
        createNom,
        createAdresse,
        createVille,
        createTel,
        createIndic,
        createActif,
      )
      const res = await adminLieuxApi.adminCreateLieuDepot(body)
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Lieu créé.', variant: 'success' })
      setCreateNom('')
      setCreateAdresse('')
      setCreateVille('')
      setCreateTel('')
      setCreateIndic('')
      setCreateActif(true)
      setCreateType('COMMISSARIAT')
      await refresh()
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setCreatePending(false)
    }
  }

  function startEdit(l: LieuDepot) {
    setEditingId(l.id)
    setEditType(l.typeLieu)
    setEditNom(l.nom)
    setEditAdresse(l.adresse ?? '')
    setEditVille(l.ville ?? '')
    setEditTel(l.telephone ?? '')
    setEditIndic(l.indication ?? '')
    setEditActif(l.actif)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (editingId == null || !editNom.trim()) return
    setSavePending(true)
    try {
      const body = payloadBase(
        editType,
        editNom,
        editAdresse,
        editVille,
        editTel,
        editIndic,
        editActif,
      )
      const res = await adminLieuxApi.adminUpdateLieuDepot(editingId, body)
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Lieu mis à jour.', variant: 'success' })
      setEditingId(null)
      await refresh()
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setSavePending(false)
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return
    setDeletePending(true)
    try {
      const res = await adminLieuxApi.adminDeleteLieuDepot(deleteId)
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Lieu supprimé.', variant: 'success' })
      setDeleteId(null)
      await refresh()
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setDeletePending(false)
    }
  }

  const deleting = rows.find((r) => r.id === deleteId)

  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
          Lieux de dépôt
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Structures où un trouveur peut indiquer avoir déposé un objet (commissariat, gendarmerie, mairie…). Les
          annonces « trouvé » s’appuient sur cette liste — ordre d’affichage automatique par nom (A → Z).
        </p>
      </div>

      <CardShell>
        <form onSubmit={onCreate} className="space-y-5">
          <p className="tt-overline">Nouveau lieu</p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-type"
                className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
              >
                Type
              </label>
              <select
                id="new-type"
                value={createType}
                onChange={(e) => setCreateType(e.target.value as TypeLieuDepot)}
                className="tt-select"
              >
                {TYPES_LIEU.map((t) => (
                  <option key={t} value={t}>
                    {libelleTypeLieu(t)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Nom du lieu"
              value={createNom}
              onChange={(e) => setCreateNom(e.target.value)}
              required
              maxLength={200}
            />
            <Input
              label="Adresse"
              value={createAdresse}
              onChange={(e) => setCreateAdresse(e.target.value)}
              maxLength={500}
            />
            <Input
              label="Ville"
              value={createVille}
              onChange={(e) => setCreateVille(e.target.value)}
              maxLength={120}
            />
            <Input
              label="Téléphone"
              value={createTel}
              onChange={(e) => setCreateTel(e.target.value)}
              maxLength={40}
            />
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label
                htmlFor="new-indic"
                className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
              >
                Indications (horaires, accès…)
              </label>
              <textarea
                id="new-indic"
                rows={3}
                value={createIndic}
                onChange={(e) => setCreateIndic(e.target.value)}
                maxLength={1000}
                className="tt-textarea"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-espresso-900 dark:text-cream-100 md:col-span-2">
              <input
                type="checkbox"
                checked={createActif}
                onChange={(e) => setCreateActif(e.target.checked)}
                className="accent-accent"
              />
              Actif (visible dans les formulaires publics)
            </label>
          </div>
          <Button type="submit" disabled={createPending}>
            {createPending ? 'Création…' : 'Créer le lieu'}
          </Button>
        </form>
      </CardShell>

      <CardShell className="overflow-x-auto">
        <p className="tt-overline mb-4">Liste</p>
        {loading ? (
          <p className="text-sm text-espresso-900/55">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-espresso-900/55">Aucun lieu enregistré.</p>
        ) : (
          <>
            <div className="mb-4 max-w-md">
              <Input
                id="admin-lieu-search"
                label="Rechercher"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Nom, ville, type, adresse…"
                autoComplete="off"
              />
            </div>
            {filteredLieux.length === 0 ? (
              <p className="text-sm text-espresso-900/55">
                Aucun résultat pour « {listSearch.trim()} ».
              </p>
            ) : (
              <>
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-espresso-900/10 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-900/55 dark:border-white/10 dark:text-cream-100/45">
                      <th className="pb-3 pr-3">Type</th>
                      <th className="pb-3 pr-3">Nom</th>
                      <th className="pb-3 pr-3">Ville</th>
                      <th className="pb-3 pr-3">Actif</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((l) =>
                editingId === l.id ? (
                  <tr key={l.id} className="border-b border-accent/30 bg-accent/[0.06] dark:bg-accent/[0.08]">
                    <td colSpan={5} className="py-4 pr-2">
                      <form onSubmit={saveEdit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
                              Type
                            </label>
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value as TypeLieuDepot)}
                              className="tt-select"
                            >
                              {TYPES_LIEU.map((t) => (
                                <option key={t} value={t}>
                                  {libelleTypeLieu(t)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="Nom"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            required
                            maxLength={200}
                          />
                          <Input
                            label="Adresse"
                            value={editAdresse}
                            onChange={(e) => setEditAdresse(e.target.value)}
                            maxLength={500}
                          />
                          <Input
                            label="Ville"
                            value={editVille}
                            onChange={(e) => setEditVille(e.target.value)}
                            maxLength={120}
                          />
                          <Input
                            label="Téléphone"
                            value={editTel}
                            onChange={(e) => setEditTel(e.target.value)}
                            maxLength={40}
                          />
                          <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
                              Indications
                            </label>
                            <textarea
                              rows={3}
                              value={editIndic}
                              onChange={(e) => setEditIndic(e.target.value)}
                              maxLength={1000}
                              className="tt-textarea"
                            />
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-espresso-900 dark:text-cream-100 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={editActif}
                              onChange={(e) => setEditActif(e.target.checked)}
                              className="accent-accent"
                            />
                            Actif
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button type="submit" disabled={savePending} className="!text-xs">
                            {savePending ? 'Enregistrement…' : 'Enregistrer'}
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelEdit} className="!text-xs">
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={l.id}
                    className="border-b border-espresso-900/[0.06] dark:border-white/[0.06]"
                  >
                    <td className="py-3 pr-3 text-espresso-900/80 dark:text-cream-100/70">
                      {libelleTypeLieu(l.typeLieu)}
                    </td>
                    <td className="py-3 pr-3 font-medium text-espresso-900 dark:text-cream-50">{l.nom}</td>
                    <td className="py-3 pr-3 text-espresso-900/70 dark:text-cream-100/65">{l.ville ?? '—'}</td>
                    <td className="py-3 pr-3">{l.actif ? 'oui' : 'non'}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 !text-xs"
                          onClick={() => startEdit(l)}
                        >
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="!border-red-500/40 !px-3 !py-1.5 !text-xs !text-red-800 dark:!text-red-300/95"
                          onClick={() => setDeleteId(l.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                  </tbody>
                </table>
                <PaginationBar
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onPageChange={setListPage}
                />
              </>
            )}
          </>
        )}
      </CardShell>

      <TwoStepDeleteModal
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirmDelete={confirmDelete}
        pending={deletePending}
        itemLabel={deleting?.nom}
      />
    </div>
  )
}
