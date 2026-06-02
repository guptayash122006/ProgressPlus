import { twMerge } from 'tailwind-merge'

export default function ProgressBar({ value = 0, max = 100, color = 'brand', size = 'md', label, showPct = false, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const colors = {
    brand: 'bg-brand-gradient shadow-[0_0_10px_rgba(124,92,252,0.4)]',
    green: 'bg-gradient-to-r from-green-500 to-emerald-400',
    orange:'bg-gradient-to-r from-orange-500 to-amber-400',
    blue:  'bg-gradient-to-r from-blue-500 to-cyan-400',
    pink:  'bg-gradient-to-r from-pink-500 to-rose-400',
  }

  return (
    <div className={className}>
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showPct && <span className="text-sm font-semibold text-white">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-white/6 rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${colors[color] || colors.brand} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
