import Sidebar from './Sidebar'
import Navbar from './Navbar'
import TaskForm from '@/components/tasks/TaskForm'
import { useUIStore } from '@/store/uiStore'

export default function DashboardLayout({ children }) {
  const { taskFormOpen, closeTaskForm } = useUIStore()

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
      {/* Global Task Form Modal */}
      <TaskForm open={taskFormOpen} onClose={closeTaskForm} />
    </div>
  )
}
