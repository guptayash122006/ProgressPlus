import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import { useHabits } from '@/hooks/useData'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { pct } from '@/lib/utils'

export default function HabitsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: habits = [], isLoading } = useHabits()

  const done = habits.filter(h => h.completedToday).length
  const total = habits.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">My Habits</h2>
          <p className="text-sm text-slate-500 mt-0.5">{done}/{total} habits done today</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} /> New Habit
        </Button>
      </div>

      {/* Today summary bar */}
      {total > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">Today's Habit Progress</span>
            <span className="text-sm font-bold text-white">{pct(done, total)}%</span>
          </div>
          <div className="w-full h-3 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-gradient rounded-full transition-all duration-700"
              style={{ width: `${pct(done, total)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>{done} completed</span>
            <span>{total - done} remaining</span>
          </div>
        </div>
      )}

      {/* Tips for empty state */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="font-semibold text-white mb-2">Build your first habit</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Habits are recurring activities you want to do daily or weekly. Start small — even 1 habit per day compounds over time.
          </p>
          <Button onClick={() => setShowForm(true)} size="sm">Create First Habit</Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(habit => <HabitCard key={habit._id} habit={habit} />)}
          </div>
        </AnimatePresence>
      )}

      {/* Habit tips */}
      {habits.length > 0 && habits.length < 5 && (
        <div className="glass-card p-5 border-brand-500/15">
          <p className="text-sm text-slate-400">
            💡 <strong className="text-white">Pro tip:</strong> Start with 2–3 habits. Consistency beats intensity. Log your habits daily to build streaks!
          </p>
        </div>
      )}

      <HabitForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
