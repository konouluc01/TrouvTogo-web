import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  LANDING_STRIP_VIDEO_POSTER,
  LANDING_STRIP_VIDEO_SRC,
} from '../../config/media'

/**
 * Bandeau vidéo pleine largeur (deuxième clip, allégé) — entre deux sections de la home.
 */
export function LandingStripVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion || failed) return
    el.play().catch(() => setFailed(true))
  }, [reduceMotion, failed])

  const showVideo = !reduceMotion && !failed

  return (
    <section
      className="relative overflow-hidden border-y border-espresso-900/8 dark:border-white/10"
      aria-label="Animation de la plateforme"
    >
      <div className="relative aspect-[2/1] min-h-[200px] w-full sm:aspect-[21/9] md:min-h-[280px]">
        {showVideo ? (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            loop
            poster={LANDING_STRIP_VIDEO_POSTER}
            preload="metadata"
            onError={() => setFailed(true)}
          >
            <source src={LANDING_STRIP_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <img
            src={LANDING_STRIP_VIDEO_POSTER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/50"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-2xl font-display text-2xl font-semibold leading-tight text-cream-50 drop-shadow-md sm:text-3xl md:text-4xl"
          >
            Chaque retour d’objet est une petite victoire collective.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
