import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar } from 'lucide-react'
import { useCreateTask, useUpdateTask } from '@/hooks/useData'
import { useUIStore } from '@/store/uiStore'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useEffect } from 'react'

const schema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.enum(['study', 'work', 'fitness', 'personal', 'health', 'custom']),
  dueDate: z.string().optional(),
})

const priorities = [
  { value: 'high',   label: '🔴 High',   cls: 'border-red-500/40 text-red-400 bg-red-500/10' },
  { value: 'medium', label: '🟡 Medium', cls: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { value: 'low',    label: '🟢 Low',    cls: 'border-green-500/40 text-green-400 bg-green-500/10' },
]
const categories = [
  { value: 'work',     label: '💼 Work' },
  { value: 'study',    label: '📚 Study' },
  { value: 'fitness',  label: '💪 Fitness' },
  { value: 'health',   label: '🏥 Health' },
  { value: 'personal', label: '🌟 Personal' },
  { value: 'custom',   label: '📌 Custom' },
]

export default function TaskForm({ open, onClose }) {
  const { editingTask } = useUIStore()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const isEdit = !!editingTask

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', category: 'personal' },
  })

  const priority = watch('priority')
  const category = watch('category')

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        category: editingTask.category || 'personal',
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0,10) : '',
      })
    } else {
      reset({ priority: 'medium', category: 'personal', title: '', description: '', dueDate: '' })
    }
  }, [editingTask, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // editingTask._id is guaranteed by the uiStore guard — only real task
        // objects (with _id) are stored as editingTask.
        await updateTask.mutateAsync({ id: editingTask._id, ...data })
      } else {
        await createTask.mutateAsync(data)
      }
      onClose()
    } catch {
      // Mutation errors are already handled by the onError callbacks in
      // useUpdateTask / useCreateTask (toast shown). Keep the form open.
    }
  }

  const loading = createTask.isPending || updateTask.isPending

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Task title"
          placeholder="What do you need to do?"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="form-label">Description (optional)</label>
          <textarea
            className="input-field resize-none h-20"
            placeholder="Add more details..."
            {...register('description')}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="form-label">Priority</label>
          <div className="flex gap-2">
            {priorities.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setValue('priority', p.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  priority === p.value ? p.cls : 'border-white/8 text-slate-500 hover:border-white/15'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="form-label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setValue('category', c.value)}
                className={`py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  category === c.value
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <Input
          label="Due date (optional)"
          type="date"
          icon={Calendar}
          {...register('dueDate')}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button" fullWidth>Cancel</Button>
          <Button type="submit" fullWidth loading={loading}>
            {isEdit ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
