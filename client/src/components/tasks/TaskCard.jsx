import { motion } from 'motion/react'
import { Pencil, Trash2, Circle, CheckCircle2, Calendar } from 'lucide-react'
import { useToggleTask, useDeleteTask } from '@/hooks/useData'
import { useUIStore } from '@/store/uiStore'
import { formatDate } from '@/lib/utils'

const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-green-500' }

export default function TaskCard({ task }) {
  const toggle = useToggleTask()
  const remove = useDeleteTask()
  const { openTaskForm } = useUIStore()

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 hover:border-white/15 hover:-translate-y-px ${
        task.completed
          ? 'bg-surface-900/40 border-white/4 opacity-60'
          : 'bg-surface-900/80 border-white/8 hover:bg-surface-800/80'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggle.mutate(task._id)}
        disabled={toggle.isPending}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
      >
        {task.completed ? (
          <CheckCircle2 size={20} className="text-green-400" />
        ) : (
          <Circle size={20} className="text-slate-600 hover:text-brand-400 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${priorityDot[task.priority] || 'bg-slate-500'}`} />
          <span className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
          <span className={`tag tag-${task.category}`}>{task.category}</span>
          <span className={`tag tag-${task.priority}`}>{task.priority}</span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar size={11} />
              {formatDate(task.dueDate)}
              {isOverdue && ' · Overdue'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!task.completed && (
          <button
            onClick={() => openTaskForm(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
          >
            <Pencil size={13} />
          </button>
        )}
        <button
          onClick={() => remove.mutate(task._id)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}
