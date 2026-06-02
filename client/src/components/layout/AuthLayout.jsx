import { Link } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-900 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Ambient orbs */}
        <div className="ambient-orb w-96 h-96 bg-brand-500/20 -top-20 -left-20 opacity-60" />
        <div className="ambient-orb w-72 h-72 bg-purple-500/15 bottom-10 right-10 opacity-40" />

        <div className="relative z-10 text-center max-w-md">
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl shadow-glow">
              ⚡
            </div>
            <span className="font-display font-bold text-2xl gradient-text">ProgressPlus</span>
          </Link>

          <h2 className="font-display font-bold text-4xl text-white mb-4 leading-tight">
            Build habits that<br/>
            <span className="gradient-text">actually stick.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Track daily tasks, monitor your consistency, and analyze your progress — all in one beautiful dashboard.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['✅ Task Tracking', '🔥 Streak System', '📊 Analytics', '🏆 Achievements'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300 font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-lg">⚡</div>
          <span className="font-display font-bold text-xl gradient-text">ProgressPlus</span>
        </Link>

        <div className="w-full max-w-md animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  )
}
