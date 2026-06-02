import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const variants = {
  brand:   'btn-brand',
  ghost:   'btn-ghost',
  success: 'btn-success',
  danger:  'btn-danger',
  outline: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-brand-500/40 text-brand-400 text-sm font-semibold hover:bg-brand-500/10 transition-all duration-200 cursor-pointer',
}
const sizes = {
  sm:  'px-3.5 py-1.5 text-xs',
  md:  '',
  lg:  'px-7 py-3.5 text-base',
  xl:  'px-8 py-4 text-lg',
  icon:'p-2.5',
}

export default function Button({
  children, variant = 'brand', size = 'md', className = '',
  loading = false, disabled = false, type = 'button', onClick, fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  )
}
