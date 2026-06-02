import { Menu, Bell, Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard':    { title: 'Dashboard',    sub: 'Your daily command center' },
  '/tasks':        { title: 'Tasks',        sub: 'Manage and track your tasks' },
  '/habits':       { title: 'Habits',       sub: 'Build lasting daily habits' },
  '/analytics':   { title: 'Analytics',   sub: 'Insights into your productivity' },
  '/achievements': { title: 'Achievements', sub: 'Your progress and rewards' },
  '/profile':      { title: 'Profile',      sub: 'Manage your account' },
}

export default function Navbar() {
  const { toggleSidebar, openTaskForm } = useUIStore()
  const { dbUser } = useAuthStore()
  const { pathname } = useLocation()
  const page = pageTitles[pathname] || { title: 'ProgressPlus', sub: '' }

  return (
    <header className="sticky top-0 z-30 bg-surface-950/80 border-b border-white/8 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight">{page.title}</h1>
            {page.sub && <p className="text-xs text-slate-500 hidden sm:block">{page.sub}</p>}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Quick Add Task */}
          <button
            onClick={openTaskForm}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium hover:bg-brand-500/20 transition-all duration-200"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-brand-500/20 cursor-pointer hover:ring-brand-500/40 transition-all">
            {dbUser?.photoURL ? (
              <img src={dbUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white">
                {(dbUser?.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
