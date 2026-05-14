import { type InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Input({ label, id, className = '', error, ...props }, ref) {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      <label
        htmlFor={fieldId}
        className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        className={`
          tt-field-outline w-full rounded-[calc(1.25rem-0.375rem)]
          transition-[transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          focus:shadow-soft
          ${className}
        `}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-red-700/90 dark:text-red-300/95">{error}</p>
      ) : null}
    </div>
  )
})
