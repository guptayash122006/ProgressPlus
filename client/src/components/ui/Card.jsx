import { twMerge } from 'tailwind-merge'

export default function Card({ children, className = '', glow = false, hover = false }) {
  return (
    <div className={twMerge(
      'glass-card p-6',
      hover ? 'glass-card-hover' : '',
      glow ? 'shadow-glow border-brand-500/20' : '',
      className
    )}>
      {children}
    </div>
  )
}

export function StatCard({ icon, label, value, sub, color = 'brand', trend }) {
  const colors = {
    brand:  { bg: 'bg-brand-500/10',  text: 'text-brand-400',  border: 'border-brand-500/20' },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20' },
    pink:   { bg: 'bg-pink-500/10',   text: 'text-pink-400',   border: 'border-pink-500/20' },
  }
  const c = colors[color] || colors.brand

  return (
    <div className={`glass-card-hover p-5 border ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <span className={`text-xl ${c.text}`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold font-display text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400 font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
      {trend !== undefined && (
        <div className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  )
}
