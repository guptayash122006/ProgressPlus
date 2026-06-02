import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateHabit } from '@/hooks/useData'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  frequency: z.enum(['daily', 'weekly']),
})

const ICONS = ['💪','📚','🧘','🏃','💧','✍️','🎯','🎸','🌿','😴','🧠','🍎','🏋️','🎨','💻']
const COLORS = ['#7c5cfc','#22c55e','#f97316','#3b82f6','#ec4899','#f59e0b','#06b6d4','#a855f7']

export default function HabitForm({ open, onClose }) {
  const create = useCreateHabit()

  const { register, handleSubmit, watch, setValue, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { frequency: 'daily', icon: '⭐', color: '#7c5cfc' },
  })

  const icon = watch('icon')
  const color = watch('color')

  const onSubmit = async (data) => {
    await create.mutateAsync(data)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Habit" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Habit name"
          placeholder="e.g. Morning workout, Read 20 min..."
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Icon picker */}
        <div>
          <label className="form-label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(ic => (
              <button
                key={ic} type="button"
                onClick={() => setValue('icon', ic)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  icon === ic ? 'bg-brand-500/20 border border-brand-500/50 scale-110' : 'bg-white/6 border border-white/8 hover:bg-white/10'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="form-label">Color</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c} type="button"
                onClick={() => setValue('color', c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900 scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="form-label">Frequency</label>
          <div className="flex gap-2">
            {['daily', 'weekly'].map(f => (
              <button
                key={f} type="button"
                onClick={() => setValue('frequency', f)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  watch('frequency') === f
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-white/8 text-slate-500 hover:border-white/15'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button" fullWidth>Cancel</Button>
          <Button type="submit" fullWidth loading={create.isPending}>Create Habit</Button>
        </div>
      </form>
    </Modal>
  )
}
