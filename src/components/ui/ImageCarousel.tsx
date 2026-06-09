import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageCarouselProps {
  images: string[]
  interval?: number
}

export function ImageCarousel({ images, interval = 2000 }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timer)
  }, [images.length, interval])

  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] ring-1 ring-espresso-900/10 dark:ring-white/10">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
          loading="lazy"
        />
      </AnimatePresence>
    </div>
  )
}
