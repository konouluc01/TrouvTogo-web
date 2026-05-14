import { type HTMLAttributes, type ReactNode } from 'react'

export function CardShell({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-[2rem] bg-black/[0.025] p-1.5 ring-1 ring-espresso-900/[0.06] dark:bg-white/[0.04] dark:ring-white/[0.08] ${className}`}
      {...props}
    >
      <div
        className={`
          h-full rounded-[calc(2rem-0.375rem)] bg-cream-50/90 p-6 shadow-soft
          shadow-[var(--shadow-inner-highlight)] dark:bg-night-900/85 dark:shadow-none
        `}
      >
        {children}
      </div>
    </div>
  )
}
