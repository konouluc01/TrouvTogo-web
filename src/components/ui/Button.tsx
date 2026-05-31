import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'secondary'

const variants: Record<Variant, string> = {
  primary:
    'bg-espresso-900 text-cream-50 shadow-soft hover:shadow-lg hover:-translate-y-px active:scale-[0.98] dark:bg-cream-100 dark:text-night-950 dark:hover:bg-cream-50',
  ghost:
    'bg-cream-200/60 text-espresso-900 ring-1 ring-espresso-900/5 hover:bg-cream-200 dark:bg-night-800/80 dark:text-cream-100 dark:ring-white/10 dark:hover:bg-night-800',
  outline:
    'bg-transparent text-espresso-900 ring-1 ring-espresso-900/15 hover:ring-espresso-900/30 dark:text-cream-100 dark:ring-cream-100/25 dark:hover:ring-cream-100/45',
  secondary:
    'bg-cream-200/60 text-espresso-900 ring-1 ring-espresso-900/5 hover:bg-cream-200 dark:bg-night-800/80 dark:text-cream-100 dark:ring-white/10 dark:hover:bg-night-800',
}

export function Button({
  className = '',
  variant = 'primary',
  children,
  trailing,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      className={`
        group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
        text-sm font-semibold tracking-tight
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        disabled:pointer-events-none disabled:opacity-40
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      <span>{children}</span>
      {trailing ? (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cream-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 dark:bg-night-950/15 dark:text-night-950"
        >
          {trailing}
        </span>
      ) : null}
    </button>
  )
}
