import { motion } from 'motion/react'
import { CheckCircle2, Flame, Plus, Trash2 } from 'lucide-react'
import { useLogHabit, useDeleteHabit } from '@/hooks/useData'

const HABIT_ICONS = ['💪','📚','🧘','🏃','💧','✍️','🎯','🎸','🌿','😴','🧠','🍎']

export default function HabitCard({ habit }) {
  const log = useLogHabit()
  const remove = useDeleteHabit()
  const isDone = habit.completedToday

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group glass-card-hover p-5 relative overflow-hidden ${isDone ? 'border-green-500/20' : ''}`}
    >
      {/* Background glow on done */}
      {isDone && (
        <div className="absolute inset-0 bg-green-500/4 pointer-events-none rounded-2xl" />
      )}

      {/* Delete button */}
      <button
        onClick={() => remove.mutate(habit._id)}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <Trash2 size={13} />
      </button>

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${habit.color}20`, border: `1px solid ${habit.color}40` }}
        >
          {habit.icon || '⭐'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{habit.name}</div>
          <div className="text-xs text-slate-500 capitalize">{habit.frequency}</div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Flame size={14} className={habit.streak > 0 ? 'text-orange-400' : 'text-slate-600'} />
          <span className={`text-sm font-bold ${habit.streak > 0 ? 'text-orange-400' : 'text-slate-600'}`}>
            {habit.streak} day{habit.streak !== 1 ? 's' : ''}
          </span>
          {habit.streak >= 7 && <span className="text-xs text-orange-300">🔥</span>}
        </div>
        <div className="text-xs text-slate-600">{habit.totalCompletions} total</div>
      </div>

      {/* Log button */}
      <button
        onClick={() => {
          console.log('[HABIT CARD] Log Today clicked')
          console.log('[HABIT CARD] habit._id:', habit._id)
          console.log('[HABIT CARD] habit:', habit)
          console.log('[HABIT CARD] isDone:', isDone)
          if (!isDone) {
            console.log('[HABIT CARD] calling log.mutate with id:', habit._id)
            log.mutate(habit._id)
          }
        }}
        disabled={isDone || log.isPending}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
          isDone
            ? 'bg-green-500/15 text-green-400 border border-green-500/25 cursor-default'
            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 hover:border-brand-500/40'
        }`}
      >
        {isDone ? (
          <><CheckCircle2 size={15} /> Done today!</>
        ) : (
          <><Plus size={15} /> Log today</>
        )}
      </button>
    </motion.div>
  )
}
