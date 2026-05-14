import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

export function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}
