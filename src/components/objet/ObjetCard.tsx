import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Objet } from '../../api/types'
import { formatMontantXof } from '../../lib/money'

function typeLabel(type: Objet['type']) {
  return type === 'PERDU' ? 'Perdu' : 'Trouvé'
}

export function ObjetCard({ objet, index = 0 }: { objet: Objet; index?: number }) {
  const cover = objet.photosUrls?.[0]
  const showRemiseBadge =
    objet.type === 'PERDU' &&
    objet.remiseMontant != null &&
    Number(objet.remiseMontant) > 0
  const remiseVal =
    showRemiseBadge && objet.remiseMontant != null ? Number(objet.remiseMontant) : 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{
        duration: 0.75,
        delay: index * 0.06,
        ease: [0.32, 0.72, 0, 1],
      }}
      className="group"
    >
      <div className="rounded-[2rem] bg-black/[0.025] p-1.5 ring-1 ring-espresso-900/[0.06] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1 group-hover:shadow-lg dark:bg-white/[0.04] dark:ring-white/[0.08]">
        <Link
          to={`/objets/${objet.id}`}
          className="block overflow-hidden rounded-[calc(2rem-0.375rem)] bg-cream-50 shadow-soft dark:bg-night-900/90"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-200 dark:bg-night-800">
            {showRemiseBadge ? (
              <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded-2xl border border-espresso-900/[0.08] bg-cream-50/92 px-3 py-2 shadow-soft backdrop-blur-md ring-1 ring-espresso-900/[0.05] dark:border-white/12 dark:bg-night-900/88 dark:ring-white/[0.08]">
                <p className="text-[9px] font-semibold uppercase leading-none tracking-[0.18em] text-accent dark:text-emerald-300/95">
                  Remise
                </p>
                <p className="mt-1 font-display text-sm font-semibold tabular-nums leading-tight text-espresso-900 dark:text-cream-50">
                  {formatMontantXof(remiseVal)}
                </p>
              </div>
            ) : null}
            {cover ? (
              <img
                src={cover}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-sm text-espresso-900/35 dark:text-cream-100/30">
                Aucune photo
              </div>
            )}
          </div>
          <div className="space-y-2 p-5 text-left">
            <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent dark:bg-accent/25">
              {typeLabel(objet.type)}
            </span>
            <h3 className="font-display text-lg font-semibold leading-snug text-espresso-900 line-clamp-2 dark:text-cream-50">
              {objet.titre}
            </h3>
            {objet.localisation ? (
              <p className="text-sm text-espresso-900/55 dark:text-cream-100/50">{objet.localisation}</p>
            ) : null}
          </div>
        </Link>
      </div>
    </motion.article>
  )
}
