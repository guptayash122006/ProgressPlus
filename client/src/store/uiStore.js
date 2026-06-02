import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  taskFormOpen: false,
  habitFormOpen: false,
  editingTask: null,
  editingHabit: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setTheme: (theme) => set({ theme }),
  openTaskForm: (task = null) => set({
    taskFormOpen: true,
    // Guard: reject DOM event objects or anything that isn't a plain task (with _id).
    // This prevents the MouseEvent that React passes when openTaskForm is used directly
    // as an onClick handler (e.g. onClick={openTaskForm}) from being stored as editingTask.
    editingTask: task && typeof task === 'object' && '_id' in task ? task : null,
  }),
  closeTaskForm: () => set({ taskFormOpen: false, editingTask: null }),
  openHabitForm: (habit = null) => set({ habitFormOpen: true, editingHabit: habit }),
  closeHabitForm: () => set({ habitFormOpen: false, editingHabit: null }),
}))
