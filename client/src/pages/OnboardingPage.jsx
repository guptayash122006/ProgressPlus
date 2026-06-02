import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'

const steps = [
  {
    emoji: '👋',
    title: 'Welcome to ProgressPlus',
    subtitle: 'Your personal productivity command center',
    description: 'ProgressPlus helps you track daily tasks, build lasting habits, and analyze your consistency — all in one beautiful dashboard.',
    color: 'from-brand-500/20 to-purple-500/10',
    border: 'border-brand-500/20',
    features: ['📅 Daily task management', '📊 Progress analytics', '🏆 Gamification & rewards'],
  },
  {
    emoji: '✅',
    title: 'Create Daily Tasks',
    subtitle: 'Break your goals into actionable steps',
    description: 'Add tasks with priorities (High/Medium/Low) and categories like Work, Health, Study, or Personal. Set due dates to stay on track.',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    features: ['🔴 High priority tasks', '📁 Category organization', '📅 Due date tracking'],
  },
  {
    emoji: '🔥',
    title: 'Build Daily Habits',
    subtitle: "Small steps compound into massive results",
    description: 'Create recurring habits — exercise, reading, meditation, coding. Log them daily and watch your streak grow.',
    color: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/20',
    features: ['🔥 Streak tracking', '📆 Daily logging', '💪 Habit momentum'],
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    subtitle: 'Data-driven insights into your productivity',
    description: 'See your daily, weekly, and monthly charts. Know your consistency score, accuracy rate, and which categories you excel in.',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/20',
    features: ['📈 Weekly charts', '🎯 Consistency score', '🔍 Category breakdown'],
  },
  {
    emoji: '🏆',
    title: 'Earn Achievements',
    subtitle: 'Stay motivated with gamification',
    description: 'Earn XP points, level up, and unlock badges as you complete tasks and build habits. Celebrate every milestone!',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/20',
    features: ['⚡ XP & Levels', '🎖 Badge collection', '🔥 Streak rewards'],
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const { completeOnboarding } = useAuthStore()
  const navigate = useNavigate()

  const step = steps[current]
  const isLast = current === steps.length - 1

  const next = () => {
    if (isLast) finish()
    else setCurrent(c => c + 1)
  }

  const finish = async () => {
    setLoading(true)
    await completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-6">
      {/* Ambient */}
      <div className="ambient-orb w-80 h-80 bg-brand-500/15 top-0 right-0 opacity-50" />
      <div className="ambient-orb w-60 h-60 bg-purple-500/10 bottom-0 left-0 opacity-40" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
          <Zap size={20} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl gradient-text">ProgressPlus</span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-surface-900/80 border ${step.border} rounded-3xl p-8 backdrop-blur-md shadow-card`}
          >
            {/* Step emoji */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center text-4xl mb-6 mx-auto`}>
              {step.emoji}
            </div>

            <h2 className="font-display font-bold text-2xl text-white text-center mb-2">{step.title}</h2>
            <p className="text-brand-400 text-sm font-medium text-center mb-4">{step.subtitle}</p>
            <p className="text-slate-400 text-center leading-relaxed mb-6">{step.description}</p>

            {/* Features */}
            <div className="space-y-2.5 mb-8">
              {step.features.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-base">{f.split(' ')[0]}</span>
                  <span>{f.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {current > 0 && (
                <Button variant="ghost" onClick={() => setCurrent(c => c - 1)} className="flex-shrink-0">
                  <ChevronLeft size={18} />
                </Button>
              )}
              <Button onClick={next} fullWidth loading={loading} size="lg">
                {isLast ? '🚀 Get Started' : 'Next'}
                {!isLast && <ChevronRight size={18} />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-brand-500' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button onClick={finish} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Skip onboarding →
          </button>
        </div>
      </div>
    </div>
  )
}
