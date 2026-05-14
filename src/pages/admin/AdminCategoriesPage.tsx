import { type FormEvent, useCallback, useEffect, useState } from 'react'
import * as adminCategoriesApi from '../../api/adminCategories'
import type { Categorie } from '../../api/types'
import { isAxiosApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { CardShell } from '../../components/ui/CardShell'
import { Input } from '../../components/ui/Input'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { TwoStepDeleteModal } from '../../components/ui/TwoStepDeleteModal'
import { useClientListFilter } from '../../hooks/useClientListFilter'
import { useToast } from '../../context/ToastContext'

const PAGE_SIZE = 8

function apiErr(err: unknown): string {
  if (isAxiosApiError(err) && err.response?.data && typeof err.response.data === 'object') {
    const m = (err.response.data as { message?: string }).message
    if (m) return m
  }
  return err instanceof Error ? err.message : 'Erreur'
}

export function AdminCategoriesPage() {
  const { push } = useToast()
  const [rows, setRows] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [listSearch, setListSearch] = useState('')
  const [listPage, setListPage] = useState(1)

  const [createNom, setCreateNom] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createPending, setCreatePending] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [savePending, setSavePending] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const refresh = useCallback(async () => {
    const res = await adminCategoriesApi.adminListCategories()
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

  const matchCategory = useCallback((c: Categorie, q: string) => {
    return (
      c.nom.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false)
    )
  }, [])

  const {
    filtered: filteredCategories,
    pageSlice,
    totalPages,
    totalItems,
    currentPage,
    rangeStart,
    rangeEnd,
  } = useClientListFilter(rows, listSearch, matchCategory, listPage, PAGE_SIZE)

  useEffect(() => {
    setListPage(1)
  }, [listSearch])

  useEffect(() => {
    if (currentPage !== listPage) setListPage(currentPage)
  }, [currentPage, listPage])

  useEffect(() => {
    setEditingId(null)
  }, [listSearch])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!createNom.trim()) return
    setCreatePending(true)
    try {
      const res = await adminCategoriesApi.adminCreateCategory({
        nom: createNom.trim(),
        description: createDesc.trim() || undefined,
      })
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Catégorie créée.', variant: 'success' })
      setCreateNom('')
      setCreateDesc('')
      await refresh()
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setCreatePending(false)
    }
  }

  function startEdit(c: Categorie) {
    setEditingId(c.id)
    setEditNom(c.nom)
    setEditDesc(c.description ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (editingId == null || !editNom.trim()) return
    setSavePending(true)
    try {
      const res = await adminCategoriesApi.adminUpdateCategory(editingId, {
        nom: editNom.trim(),
        description: editDesc.trim() || undefined,
      })
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Catégorie mise à jour.', variant: 'success' })
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
      const res = await adminCategoriesApi.adminDeleteCategory(deleteId)
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Catégorie supprimée.', variant: 'success' })
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
          Catégories
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Les catégories alimentent les formulaires de publication et les filtres publics.
        </p>
      </div>

      <CardShell>
        <form onSubmit={onCreate} className="space-y-5">
          <p className="tt-overline">Nouvelle catégorie</p>
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nom"
              value={createNom}
              onChange={(e) => setCreateNom(e.target.value)}
              required
              maxLength={100}
            />
            <Input
              label="Description"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              maxLength={255}
              placeholder="Optionnel"
            />
          </div>
          <Button type="submit" disabled={createPending}>
            {createPending ? 'Création…' : 'Créer'}
          </Button>
        </form>
      </CardShell>

      <CardShell className="overflow-x-auto">
        <p className="tt-overline mb-4">Liste</p>
        {loading ? (
          <p className="text-sm text-espresso-900/55">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-espresso-900/55">Aucune catégorie pour l’instant.</p>
        ) : (
          <>
            <div className="mb-4 max-w-md">
              <Input
                id="admin-cat-search"
                label="Rechercher"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Nom ou description…"
                autoComplete="off"
              />
            </div>
            {filteredCategories.length === 0 ? (
              <p className="text-sm text-espresso-900/55">
                Aucun résultat pour « {listSearch.trim()} ».
              </p>
            ) : (
              <>
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-espresso-900/10 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-900/55 dark:border-white/10 dark:text-cream-100/45">
                      <th className="pb-3 pr-4">Nom</th>
                      <th className="pb-3 pr-4">Description</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id} className="border-b border-accent/30 bg-accent/[0.06] dark:bg-accent/[0.08]">
                    <td colSpan={3} className="py-4 pr-4">
                      <form onSubmit={saveEdit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Nom"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            required
                            maxLength={100}
                          />
                          <Input
                            label="Description"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            maxLength={255}
                          />
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
                    key={c.id}
                    className="border-b border-espresso-900/[0.06] dark:border-white/[0.06]"
                  >
                    <td className="py-3 pr-4 font-medium text-espresso-900 dark:text-cream-50">{c.nom}</td>
                    <td className="py-3 pr-4 text-espresso-900/70 dark:text-cream-100/65">
                      {c.description ?? '—'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 !text-xs"
                          onClick={() => startEdit(c)}
                        >
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="!border-red-500/40 !px-3 !py-1.5 !text-xs !text-red-800 dark:!text-red-300/95"
                          onClick={() => setDeleteId(c.id)}
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
