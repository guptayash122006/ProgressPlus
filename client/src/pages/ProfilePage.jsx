import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTasks, useHabits, useAnalyticsSummary } from '@/hooks/useData'
import { authService } from '@/services'
import { updateUserProfile } from '@/lib/firebase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { StatCard } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { User, Mail, Edit3 } from 'lucide-react'

export default function ProfilePage() {
  const { user, dbUser, setDbUser } = useAuthStore()
  const { data: tasks = [] } = useTasks()
  const { data: habits = [] } = useHabits()
  const { data: summary } = useAnalyticsSummary()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dbUser?.displayName || '')
  const [loading, setLoading] = useState(false)

  const doneTasks = tasks.filter(t => t.completed).length

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      await updateUserProfile(user, { displayName: name })
      const { data } = await authService.updateProfile({ displayName: name })
      setDbUser(data.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="glass-card p-8 text-center">
        <div className="relative inline-block mb-4">
          {dbUser?.photoURL ? (
            <img src={dbUser.photoURL} alt="avatar" className="w-24 h-24 rounded-3xl ring-4 ring-brand-500/30" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-brand-gradient flex items-center justify-center text-4xl font-black text-white ring-4 ring-brand-500/30">
              {(dbUser?.displayName || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>

        {editing ? (
          <div className="max-w-xs mx-auto space-y-3">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" icon={User} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)} fullWidth size="sm">Cancel</Button>
              <Button onClick={saveProfile} loading={loading} fullWidth size="sm">Save</Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-2xl text-white mb-1">{dbUser?.displayName || 'User'}</h2>
            <p className="text-slate-400 text-sm mb-4 flex items-center justify-center gap-1.5">
              <Mail size={13} /> {dbUser?.email}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Edit3 size={14} /> Edit Name
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="✅" label="Tasks Completed" value={summary?.completedTasks || doneTasks} color="green" />
        <StatCard icon="🔥" label="Current Streak" value={`${dbUser?.gamification?.currentStreak || 0}d`} color="orange" />
        <StatCard icon="⚡" label="Total XP" value={dbUser?.gamification?.xp || 0} color="brand" />
        <StatCard icon="🏆" label="Badges Earned" value={dbUser?.gamification?.badges?.length || 0} color="blue" />
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold text-white">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2.5 border-b border-white/6">
            <span className="text-sm text-slate-400">Email</span>
            <span className="text-sm text-white font-medium">{dbUser?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-white/6">
            <span className="text-sm text-slate-400">Member since</span>
            <span className="text-sm text-white font-medium">
              {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-white/6">
            <span className="text-sm text-slate-400">Login method</span>
            <span className="text-sm text-white font-medium">
              {user?.providerData?.[0]?.providerId === 'google.com' ? '🔵 Google' : '📧 Email'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-slate-400">Theme</span>
            <span className="text-sm text-white font-medium">🌙 Dark</span>
          </div>
        </div>
      </div>
    </div>
  )
}
