import { useRef, useState, type ChangeEvent } from 'react'
import * as uploadApi from '../../api/upload'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'

const MAX_PHOTOS = 6
const MAX_FILE_MB = 5

interface ObjetPhotosFieldProps {
  urls: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
}

export function ObjetPhotosField({
  urls,
  onChange,
  disabled,
  onBusyChange,
}: ObjetPhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { push } = useToast()
  const [uploading, setUploading] = useState(false)

  function setBusy(v: boolean) {
    setUploading(v)
    onBusyChange?.(v)
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index))
  }

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    const list = Array.from(files)
    e.target.value = ''

    if (urls.length + list.length > MAX_PHOTOS) {
      push({
        message: `Vous pouvez ajouter au maximum ${MAX_PHOTOS} photos.`,
        variant: 'error',
      })
      return
    }

    for (const f of list) {
      if (!f.type.startsWith('image/')) {
        push({
          message: `Fichier non pris en charge (images uniquement) : ${f.name}`,
          variant: 'error',
        })
        return
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        push({
          message: `Fichier trop lourd (max. ${MAX_FILE_MB} Mo) : ${f.name}`,
          variant: 'error',
        })
        return
      }
    }

    setBusy(true)
    try {
      const res = await uploadApi.uploadImages(list)
      if (!res.success || !res.data?.urls?.length) {
        throw new Error(res.message || 'Téléversement impossible')
      }
      const next = [...urls, ...res.data.urls].slice(0, MAX_PHOTOS)
      onChange(next)
    } catch (err) {
      push({
        message: err instanceof Error ? err.message : 'Téléversement échoué',
        variant: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 text-left">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80">
          Photos
        </p>
        <p className="mt-1 text-xs text-espresso-900/60 dark:text-cream-100/50">
          Aperçu des images de l’annonce. Ajoutez ou retirez des photos (jusqu’à{' '}
          {MAX_PHOTOS}, {MAX_FILE_MB} Mo max. par fichier). Les adresses techniques
          sont gérées automatiquement après envoi.
        </p>
      </div>

      {urls.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, i) => (
            <li
              key={`${i}-${url.slice(-24)}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-200 dark:bg-night-800"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => removeAt(i)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-night-950/80 text-lg font-light leading-none text-cream-50 opacity-0 shadow-md transition-opacity duration-200 hover:bg-red-600/90 group-hover:opacity-100 disabled:pointer-events-none"
                aria-label="Retirer cette photo"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-espresso-900/15 bg-cream-100/50 px-4 py-6 text-center text-sm text-espresso-900/55 dark:border-white/15 dark:bg-night-900/40 dark:text-cream-100/50">
          Aucune photo pour l’instant — ajoutez-en pour illustrer l’annonce.
        </p>
      )}

      {urls.length < MAX_PHOTOS ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            multiple
            className="sr-only"
            onChange={onFiles}
            disabled={disabled || uploading}
            aria-label="Choisir des images à envoyer"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Téléversement…' : 'Ajouter des photos'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
