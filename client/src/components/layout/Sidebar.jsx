import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, CheckSquare, Repeat2, BarChart3, Trophy, User,
  Zap, LogOut, X, ChevronRight, Flame
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { logout } from '@/lib/firebase'
import ProgressBar from '@/components/ui/ProgressBar'
import { levelFromXp, xpForLevel } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',        icon: CheckSquare,      label: 'Tasks' },
  { to: '/habits',       icon: Repeat2,          label: 'Habits' },
  { to: '/analytics',   icon: BarChart3,        label: 'Analytics' },
  { to: '/achievements', icon: Trophy,           label: 'Achievements' },
]

function SidebarContent({ onClose }) {
  const { dbUser } = useAuthStore()
  const navigate = useNavigate()
  const xp = dbUser?.gamification?.xp || 0
  const level = levelFromXp(xp)
  const xpForNext = xpForLevel(level)
  const xpProgress = xp % 100
  const streak = dbUser?.gamification?.currentStreak || 0

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">ProgressPlus</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User XP card */}
      <div className="mx-3 mt-4 p-3.5 rounded-xl bg-brand-500/8 border border-brand-500/15">
        <div className="flex items-center gap-2.5 mb-2.5">
          {dbUser?.photoURL ? (
            <img src={dbUser.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold">
              {(dbUser?.displayName || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{dbUser?.displayName || 'User'}</div>
            <div className="text-xs text-brand-400 font-medium">Level {level}</div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
              <Flame size={14} />
              {streak}
            </div>
          )}
        </div>
        <ProgressBar value={xpProgress} max={100} size="sm" color="brand" />
        <div className="text-xs text-slate-500 mt-1">{xpProgress}/100 XP to Level {level+1}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="section-title px-2 mb-3">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-brand-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div className="p-3 border-t border-white/8 space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive ? 'bg-brand-500/15 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-white/6'
            }`
          }
        >
          <User size={18} />
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900/80 border-r border-white/8 backdrop-blur-md h-screen sticky top-0 z-40 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-full w-72 bg-surface-900 border-r border-white/10 z-50 lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
