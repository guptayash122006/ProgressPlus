// Simple utility functions
export const clx = (...classes) =>
  classes.filter(Boolean).join(' ')

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export const pct = (done, total) =>
  total ? Math.round((done / total) * 100) : 0

export const xpForLevel = (level) => level * 100

export const levelFromXp = (xp) => Math.floor(xp / 100) + 1

export const categoryColor = (cat) => {
  const map = {
    work: '#3b82f6', study: '#a855f7', fitness: '#f97316',
    health: '#22c55e', personal: '#ec4899', custom: '#6b7280',
  }
  return map[cat] || '#6b7280'
}

export const priorityColor = (p) => {
  return { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }[p] || '#6b7280'
}

export const debounce = (fn, delay = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}
