import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, habitService, analyticsService } from '@/services'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

// =========== TASKS ===========
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.getAll(params).then(r => r.data.data),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  const { addXP } = useAuthStore()
  return useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created! +5 XP ⚡')
      addXP(5)
    },
    onError: () => toast.error('Failed to create task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => taskService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated!')
    },
    onError: () => toast.error('Failed to update task'),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete task'),
  })
}

export function useToggleTask() {
  const qc = useQueryClient()
  const { addXP } = useAuthStore()
  return useMutation({
    mutationFn: taskService.toggle,
    onSuccess: async (res) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      const task = res.data.data
      if (task.completed) {
        toast.success('Task completed! +10 XP 🎯')
        addXP(10)
      }
      // Snapshot today's counts so analytics & streak update immediately
      try { await analyticsService.saveDailyLog({}) } catch (_) {}
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: () => toast.error('Failed to update task'),
  })
}

// =========== HABITS ===========
export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => habitService.getAll().then(r => r.data.data),
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      toast.success('Habit created! 🔥')
    },
    onError: () => toast.error('Failed to create habit'),
  })
}

export function useLogHabit() {
  const qc = useQueryClient()
  const { addXP } = useAuthStore()
  return useMutation({
    mutationFn: (id) => {
      console.log('[USE LOG HABIT] mutationFn called with id:', id)
      console.log('[USE LOG HABIT] typeof id:', typeof id)
      console.log('[USE LOG HABIT] calling habitService.log(id)...')
      return habitService.log(id)
    },
    onSuccess: async (res) => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      // logHabit returns { data: { log, habit: { _id, streak, ... } } }
      const habit = res.data.data?.habit
      const streak = habit?.streak || 0
      const msgs = {
        7:  `🔥 7 Day Streak! You're on fire! +15 XP`,
        30: `🚀 30 Day Streak! Incredible! +15 XP`,
        100:`🏆 100 Day Streak! LEGENDARY! +15 XP`,
      }
      toast.success(msgs[streak] || `Habit logged! +15 XP ⚡`)
      addXP(15)
      // Snapshot today's counts so analytics & streak update immediately
      try { await analyticsService.saveDailyLog({}) } catch (_) {}
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (err) => {
      console.error('[USE LOG HABIT] onError:', err)
      console.error('[USE LOG HABIT] response status:', err?.response?.status)
      console.error('[USE LOG HABIT] response data:', err?.response?.data)
      toast.error('Failed to log habit')
    },
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      toast.success('Habit removed')
    },
    onError: () => toast.error('Failed to delete habit'),
  })
}

// =========== ANALYTICS ===========
export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'weekly'],
    queryFn: () => analyticsService.weekly().then(r => r.data.data),
  })
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'monthly'],
    queryFn: () => analyticsService.monthly().then(r => r.data.data),
  })
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.summary().then(r => r.data.data),
  })
}
