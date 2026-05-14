import { motion } from 'framer-motion'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { HERO_VIDEO_POSTER, HERO_VIDEO_SRC } from '../../config/media'

export function HeroVideo({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion || videoFailed) return
    el.play().catch(() => setVideoFailed(true))
  }, [reduceMotion, videoFailed])

  const showVideo = !reduceMotion && !videoFailed

  return (
    <div className={`relative min-h-[min(100dvh,880px)] overflow-hidden sm:min-h-[min(100dvh,940px)] ${className}`}>
      <div className="absolute inset-0" aria-hidden>
        {showVideo ? (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
            autoPlay
            muted
            playsInline
            loop
            poster={HERO_VIDEO_POSTER}
            preload="metadata"
            onError={() => setVideoFailed(true)}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <img
            src={HERO_VIDEO_POSTER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Lisibilité + harmonisation clair / sombre */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-cream-100 dark:via-black/55 dark:to-night-950"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/25" />
        <motion.div
          className="pointer-events-none absolute -right-24 top-1/4 hidden h-[280px] w-[280px] rounded-full bg-accent/25 blur-[80px] sm:block sm:h-[360px] sm:w-[360px] md:-right-20 md:h-[420px] md:w-[420px] md:blur-[100px]"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
