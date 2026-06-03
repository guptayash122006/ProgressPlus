import { AnimatePresence, motion } from 'motion/react'
import { Plus, CheckSquare, Repeat2, BarChart3, Flame, Trophy, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasks, useHabits, useAnalyticsSummary } from '@/hooks/useData'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { StatCard } from '@/components/ui/Card'
import TaskCard from '@/components/tasks/TaskCard'
import HabitCard from '@/components/habits/HabitCard'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { pct } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid
} from 'recharts'
import { useWeeklyAnalytics } from '@/hooks/useData'
import { format } from 'date-fns'

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening']
function greeting() {
  const h = new Date().getHours()
  return h < 12 ? GREETINGS[0] : h < 17 ? GREETINGS[1] : GREETINGS[2]
}

export default function DashboardPage() {
  console.log("DASHBOARD PAGE RENDERED")
  const { dbUser } = useAuthStore()
  const { openTaskForm } = useUIStore()
  const { data: tasks = [], isLoading: tLoading } = useTasks({})
  const { data: habits = [], isLoading: hLoading } = useHabits()
  const { data: summary } = useAnalyticsSummary()
  const { data: weekly = [] } = useWeeklyAnalytics()

  const doneTasks = tasks.filter(t => t.completed).length
  const doneHabits = habits.filter(h => h.completedToday).length
  const streak = summary?.currentStreak || 0
  const level = dbUser?.gamification?.level || 1
  const xp = dbUser?.gamification?.xp || 0

  const weeklyChartData = weekly.map(d => ({
    name: format(new Date(d.date + 'T00:00:00'), 'EEE'),
    Score: d.productivityScore || 0,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">
            {greeting()}, {dbUser?.displayName?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {streak > 0
              ? `🔥 You're on a ${streak}-day streak! Keep it going.`
              : "Let's make today count. Start your first task!"}
          </p>
        </div>
        <Button onClick={openTaskForm} size="sm">
          <Plus size={16} /> Add Task
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="✅" label="Completed" value={doneTasks} color="green"
          sub={`of ${tasks.length} tasks`} />
        <StatCard icon="⏳" label="Remaining" value={tasks.length - doneTasks} color="orange"
          sub="tasks left" />
        <StatCard icon="🔥" label="Day Streak" value={streak} color="brand"
          sub="consecutive days" />
        <StatCard icon="⚡" label="Level" value={level} color="blue"
          sub={`${xp} XP total`} />
      </div>

      {/* Today's Progress */}
      {tasks.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-white text-sm">Today's Progress</span>
            <span className="text-xs text-slate-500">{pct(doneTasks, tasks.length)}%</span>
          </div>
          <ProgressBar value={doneTasks} max={tasks.length} size="md" showPct={false} />
          {doneTasks === tasks.length && tasks.length > 0 && (
            <p className="text-green-400 text-sm mt-3 font-medium">🎉 All tasks completed! Amazing work today!</p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Today's Tasks */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-white">My Tasks</h3>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {tLoading ? <Spinner /> :
            tasks.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <CheckSquare size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-3">No tasks yet. Create your first one!</p>
                <Button size="sm" onClick={openTaskForm}>Add First Task</Button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {tasks.slice(0, 6).map(task => <TaskCard key={task._id} task={task} />)}
                </div>
              </AnimatePresence>
            )
          }
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Habits Mini */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-white">Habits Today</h3>
              <Link to="/habits" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All <ArrowRight size={12} />
              </Link>
            </div>
            {hLoading ? <Spinner /> :
              habits.length === 0 ? (
                <div className="glass-card p-5 text-center">
                  <Repeat2 size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs mb-2">No habits yet.</p>
                  <Link to="/habits" className="text-brand-400 text-xs hover:underline">Create a habit →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.slice(0, 3).map(habit => (
                    <div key={habit._id} className="flex items-center justify-between glass-card p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{habit.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white truncate max-w-[120px]">{habit.name}</div>
                          <div className="text-xs text-orange-400 flex items-center gap-1">
                            <Flame size={10} /> {habit.streak}d
                          </div>
                        </div>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                        habit.completedToday ? 'bg-green-500/20 text-green-400' : 'bg-white/6 text-slate-600'
                      }`}>
                        {habit.completedToday ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Weekly Mini Chart */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">This Week</h3>
              <Link to="/analytics" className="text-xs text-brand-400 flex items-center gap-1">
                Details <ArrowRight size={12} />
              </Link>
            </div>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={weeklyChartData} barSize={16}>
                  <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background:'#161830', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'12px' }}
                    cursor={{ fill:'rgba(124,92,252,0.08)' }}
                  />
                  <Bar dataKey="Score" fill="#7c5cfc" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-24 flex items-center justify-center">
                <p className="text-xs text-slate-600">Log tasks to see chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to:'/tasks',        icon:<CheckSquare size={18}/>, label:'All Tasks',    color:'text-brand-400' },
          { to:'/habits',       icon:<Repeat2 size={18}/>,     label:'Habits',       color:'text-green-400' },
          { to:'/analytics',   icon:<BarChart3 size={18}/>,   label:'Analytics',   color:'text-blue-400' },
          { to:'/achievements', icon:<Trophy size={18}/>,      label:'Achievements', color:'text-amber-400' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
            <span className={item.color}>{item.icon}</span>
            <span className="text-xs font-medium text-slate-400">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
