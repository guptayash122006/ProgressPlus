import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Filter } from 'lucide-react'
import { useTasks } from '@/hooks/useData'
import { useUIStore } from '@/store/uiStore'
import TaskCard from '@/components/tasks/TaskCard'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ProgressBar from '@/components/ui/ProgressBar'
import { pct } from '@/lib/utils'

const FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'today',     label: '📅 Today' },
  { value: 'upcoming',  label: '🔮 Upcoming' },
  { value: 'completed', label: '✅ Completed' },
  { value: 'overdue',   label: '⚠️ Overdue' },
]

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { openTaskForm } = useUIStore()

  const { data: tasks = [], isLoading } = useTasks({
    filter: activeFilter === 'all' ? undefined : activeFilter,
    search: search || undefined,
    category: categoryFilter || undefined,
  })

  const done = tasks.filter(t => t.completed).length
  const total = tasks.length
  const score = pct(done, total)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">My Tasks</h2>
          <p className="text-sm text-slate-500 mt-0.5">{done}/{total} completed today</p>
        </div>
        <Button onClick={openTaskForm} size="sm">
          <Plus size={16} /> New Task
        </Button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <ProgressBar value={done} max={total} showPct label={`${activeFilter === 'all' ? 'Overall' : activeFilter} progress`} />
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === f.value
                ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                : 'bg-white/4 border border-white/8 text-slate-400 hover:bg-white/8 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-3 opacity-50">📋</div>
          <p className="text-slate-400 mb-4">
            {search ? 'No tasks match your search.' : 'No tasks yet.'}
          </p>
          <Button onClick={openTaskForm} size="sm">Add Your First Task</Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {tasks.map(task => <TaskCard key={task._id} task={task} />)}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
