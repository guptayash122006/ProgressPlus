import { useWeeklyAnalytics, useMonthlyAnalytics, useAnalyticsSummary } from '@/hooks/useData'
import { StatCard } from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-900 border border-white/10 rounded-xl p-3 text-xs shadow-card">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: weekly = [], isLoading: wLoading } = useWeeklyAnalytics()
  const { data: monthly = [], isLoading: mLoading } = useMonthlyAnalytics()
  const { data: summary, isLoading: sLoading } = useAnalyticsSummary()

  const isLoading = wLoading || sLoading

  if (isLoading) return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>

  const consistency = summary ? Math.round((summary.activeDays / 7) * 100) : 0
  const accuracy = summary?.accuracy || 0

  const weeklyChartData = weekly.map(d => ({
    name: format(new Date(d.date + 'T00:00:00'), 'EEE'),
    Tasks: d.tasksDone,
    Habits: d.habitsDone,
    Score: d.productivityScore || 0,
  }))

  const monthlyChartData = monthly.slice(-14).map(d => ({
    name: format(new Date(d.date + 'T00:00:00'), 'MMM d'),
    Score: d.productivityScore || 0,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎯" label="Consistency" value={`${consistency}%`} color="brand"
          sub="Days active this week" />
        <StatCard icon="✅" label="Accuracy" value={`${accuracy}%`} color="green"
          sub="Tasks completed vs added" />
        <StatCard icon="🔥" label="Best Streak" value={`${summary?.longestStreak || 0}d`} color="orange"
          sub="Consecutive days" />
        <StatCard icon="⚡" label="Productivity" value={`${summary?.avgScore || 0}%`} color="blue"
          sub="Average score" />
      </div>

      {/* Scores */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="font-display font-semibold text-white">Performance Breakdown</h3>
        <ProgressBar value={consistency} label="Consistency (Days Active)" showPct color="brand" size="md" />
        <ProgressBar value={accuracy} label="Accuracy (Task Completion)" showPct color="green" size="md" />
        <ProgressBar value={summary?.habitRate || 0} label="Habit Completion Rate" showPct color="orange" size="md" />
      </div>

      {/* Weekly Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-5">This Week — Tasks & Habits</h3>
        {weeklyChartData.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Log some tasks to see your weekly chart!</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              <Bar dataKey="Tasks" fill="#7c5cfc" radius={[4,4,0,0]} maxBarSize={32} />
              <Bar dataKey="Habits" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Line Chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-5">Productivity Score — Last 14 Days</h3>
        {monthlyChartData.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Keep logging tasks to see your trend!</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="Score" stroke="#7c5cfc"
                strokeWidth={2.5} dot={{ fill: '#7c5cfc', r: 4 }}
                activeDot={{ r: 6, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly Summary Message */}
      <div className="glass-card p-6 text-center border-brand-500/15">
        <div className="text-4xl mb-3">
          {consistency >= 80 ? '🏆' : consistency >= 50 ? '💪' : '🌱'}
        </div>
        <h3 className="font-display font-semibold text-white text-lg mb-2">
          {consistency >= 80 ? 'Exceptional week!' : consistency >= 50 ? 'Good momentum!' : 'Building habits!'}
        </h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {consistency >= 80
            ? `Outstanding! ${consistency}% consistency with ${accuracy}% accuracy. You're building powerful habits that compound over time.`
            : consistency >= 50
            ? `Good progress! ${consistency}% consistency. Focus on showing up every day — even small wins matter.`
            : `Every journey starts somewhere. Add tasks daily and log your habits to start building your streak!`
          }
        </p>
      </div>
    </div>
  )
}
