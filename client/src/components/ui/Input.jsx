import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Input = forwardRef(function Input({
  label, error, hint, icon: Icon, className = '', type = 'text', ...props
}, ref) {
  return (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Icon size={16} className="text-slate-500" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={twMerge(
            'input-field',
            Icon ? 'pl-10' : '',
            error ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/15' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
})

export default Input
