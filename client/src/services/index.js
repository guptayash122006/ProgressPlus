import api from '@/lib/api'

export const taskService = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
}

export const habitService = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  log: (id) => {
    console.log('[HABIT SERVICE] log() called with id:', id)
    console.log('[HABIT SERVICE] POST URL:', `/habits/${id}/log`)
    return api.post(`/habits/${id}/log`)
  },
  getLogs: (id, days = 30) => api.get(`/habits/${id}/logs`, { params: { days } }),
}

export const analyticsService = {
  weekly: () => api.get('/analytics/weekly'),
  monthly: () => api.get('/analytics/monthly'),
  summary: () => api.get('/analytics/summary'),
  saveDailyLog: (data) => api.post('/analytics/daily-log', data),
}

export const authService = {
  sync: (data) => api.post('/auth/sync', data),
  getProfile: () => api.get('/auth/profile'),
updateProfile: (data) => api.put('/auth/profile', data),  completeOnboarding: () => api.put('/api/auth/onboarding'),
}
