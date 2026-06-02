import { useAuthStore } from '@/store/authStore'
import { useAnalyticsSummary } from '@/hooks/useData'
import ProgressBar from '@/components/ui/ProgressBar'
import { levelFromXp, xpForLevel } from '@/lib/utils'

const ALL_BADGES = [
  { id: 'first_login',       icon: '🚀', name: 'First Login',         desc: 'Welcome to ProgressPlus!' },
  { id: 'first_task',        icon: '✅', name: 'First Task',          desc: 'Completed your first task' },
  { id: 'task_10',           icon: '🎯', name: 'Task Hunter',         desc: 'Completed 10 tasks' },
  { id: 'task_50',           icon: '💪', name: 'Task Warrior',        desc: 'Completed 50 tasks' },
  { id: 'task_100',          icon: '🏆', name: 'Task Master',         desc: 'Completed 100 tasks' },
  { id: 'streak_7',          icon: '🔥', name: 'On Fire',             desc: '7-day active streak' },
  { id: 'streak_30',         icon: '⚡', name: 'Unstoppable',         desc: '30-day active streak' },
  { id: 'streak_100',        icon: '🌟', name: 'Legendary',           desc: '100-day active streak' },
  { id: 'habit_first',       icon: '🌱', name: 'Habit Starter',       desc: 'Created your first habit' },
  { id: 'habit_complete_7',  icon: '💫', name: 'Habit Champion',      desc: 'Logged habits 7 days in a row' },
  { id: 'consistency_master',icon: '🎖', name: 'Consistency Master',  desc: 'Maintained 80%+ consistency for a week' },
  { id: 'productivity_pro',  icon: '🧠', name: 'Productivity Pro',    desc: 'Achieved 90%+ productivity score' },
]

const XP_MILESTONES = [
  { xp: 0,   level: 1,  label: 'Beginner' },
  { xp: 100, level: 2,  label: 'Explorer' },
  { xp: 200, level: 3,  label: 'Builder' },
  { xp: 400, level: 4,  label: 'Achiever' },
  { xp: 700, level: 5,  label: 'Warrior' },
  { xp: 1000,level: 6,  label: 'Champion' },
  { xp: 1500,level: 7,  label: 'Master' },
  { xp: 2000,level: 8,  label: 'Legend' },
]

export default function AchievementsPage() {
  const { dbUser } = useAuthStore()
  const { data: summary } = useAnalyticsSummary()

  const xp = dbUser?.gamification?.xp || 0
  const level = levelFromXp(xp)
  const xpInLevel = xp % 100
  const earnedBadges = dbUser?.gamification?.badges || []
  const streak = summary?.currentStreak || 0
const bestStreak = summary?.bestStreak || 0
  const currentMilestone = XP_MILESTONES.filter(m => level >= m.level).pop()

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* XP & Level Hero Card */}
      <div className="glass-card p-8 border-brand-500/20 shadow-glow text-center">
        <div className="w-24 h-24 rounded-3xl bg-brand-gradient mx-auto flex items-center justify-center text-4xl font-black text-white font-display mb-4 shadow-glow-lg">
          {level}
        </div>
        <h2 className="font-display font-black text-3xl gradient-text mb-1">Level {level}</h2>
        <p className="text-slate-400 mb-5">{currentMilestone?.label || 'Beginner'}</p>

        <div className="max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>{xpInLevel} / 100 XP</span>
            <span>Level {level + 1} →</span>
          </div>
          <ProgressBar value={xpInLevel} max={100} color="brand" size="lg" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-white font-display">{xp}</div>
            <div className="text-xs text-slate-500">Total XP</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-orange-400 font-display">🔥{streak}</div>
            <div className="text-xs text-slate-500">Current Streak</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-white font-display">{bestStreak}</div>
            <div className="text-xs text-slate-500">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Level Roadmap */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-4">Level Roadmap</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {XP_MILESTONES.map((m) => (
            <div
              key={m.level}
              className={`flex-shrink-0 text-center p-3 rounded-xl border transition-all ${
                level >= m.level
                  ? 'border-brand-500/40 bg-brand-500/10'
                  : 'border-white/8 opacity-40'
              }`}
            >
              <div className={`font-display font-black text-lg ${level >= m.level ? 'gradient-text' : 'text-slate-600'}`}>
                Lv{m.level}
              </div>
              <div className="text-xs text-slate-500 whitespace-nowrap">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Badge Collection</h3>
          <span className="text-sm text-slate-500">{earnedBadges.length}/{ALL_BADGES.length} earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id)
            return (
              <div
                key={badge.id}
                className={`glass-card p-4 text-center transition-all duration-300 ${
                  earned ? 'border-amber-500/25 bg-amber-500/5' : 'opacity-30 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className={`text-sm font-semibold mb-1 ${earned ? 'text-white' : 'text-slate-500'}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-slate-600">{badge.desc}</div>
                {earned && (
                  <div className="mt-2 text-xs text-amber-400 font-medium">✓ Earned</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* XP Guide */}
      <div className="glass-card p-6 border-green-500/15">
        <h3 className="font-display font-semibold text-white mb-4">How to Earn XP</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { action: 'Create a task', xp: '+5 XP', icon: '📝' },
            { action: 'Complete a task', xp: '+10 XP', icon: '✅' },
            { action: 'Log a habit', xp: '+15 XP', icon: '🔥' },
            { action: 'Complete onboarding', xp: '+50 XP', icon: '🚀' },
            { action: '7-day streak', xp: 'Badge', icon: '🔥' },
            { action: '100 tasks done', xp: 'Badge', icon: '🏆' },
          ].map(item => (
            <div key={item.action} className="flex items-center gap-3 p-3 rounded-xl bg-white/4">
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className="text-sm text-white font-medium">{item.action}</div>
                <div className="text-xs text-green-400 font-bold">{item.xp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
