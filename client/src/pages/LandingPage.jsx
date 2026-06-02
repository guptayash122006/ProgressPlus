import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle, BarChart3, Repeat2, Trophy, Zap, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const features = [
  { icon: '✅', title: 'Smart Task Manager', desc: 'Create tasks with priority levels, categories, and due dates. Filter by Today, Upcoming, or Overdue.' },
  { icon: '🔥', title: 'Habit Tracker', desc: 'Build lasting habits with daily logging, streak tracking, and visual progress calendars.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Beautiful charts showing your daily, weekly, and monthly productivity performance.' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn XP, level up, unlock badges, and celebrate streak milestones to stay motivated.' },
  { icon: '🎯', title: 'Consistency Score', desc: 'Know exactly how consistent you are — no guesswork, just clear data-driven insights.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Built for speed. Add a task in 2 seconds, log a habit in one tap. No friction.' },
]

const faqs = [
  { q: 'Is ProgressPlus free?', a: 'Yes! ProgressPlus is completely free to use. Start tracking your tasks and habits today without any cost.' },
  { q: 'How is this different from a regular to-do app?', a: 'ProgressPlus goes beyond tasks. It tracks your consistency over time, builds habit streaks, gives you analytics on your productivity, and uses gamification (XP, levels, badges) to keep you motivated.' },
  { q: 'Can I track both tasks and habits?', a: 'Absolutely. Tasks are one-time items you complete, while habits are recurring activities you want to do daily or weekly. Both work together on your dashboard.' },
  { q: 'What is a Consistency Score?', a: 'Your Consistency Score measures how often you show up — it\'s calculated from how many days you actively complete tasks and habits vs. the total days tracked.' },
  { q: 'Is my data private?', a: 'Yes. Your data is stored securely in your own account. We use Firebase Authentication and encrypted MongoDB storage.' },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/4 transition-colors"
      >
        <span className="font-medium text-white text-sm">{q}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/6">{a}</div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="ambient-orb w-[600px] h-[600px] bg-brand-500/12 -top-40 -left-40" />
      <div className="ambient-orb w-[400px] h-[400px] bg-purple-500/10 top-1/2 -right-32" />
      <div className="ambient-orb w-[300px] h-[300px] bg-blue-500/8 bottom-40 left-1/4" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-white/6 backdrop-blur-md bg-surface-950/60 sticky top-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">ProgressPlus</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-3 py-2">Sign In</Link>
          <Link to="/register" className="btn-brand px-4 py-2 text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold mb-6 tracking-wide">
            <Zap size={12} /> PRODUCTIVITY TRACKER
          </div>

          <h1 className="font-display font-black text-5xl lg:text-7xl text-white leading-[1.05] mb-6 text-balance">
            Track Tasks.<br/>
            Build Habits.<br/>
            <span className="gradient-text">Master Consistency.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            ProgressPlus helps you manage daily tasks, build productive habits, and analyze your consistency — so you always know exactly how you're improving.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register" className="btn-brand px-8 py-3.5 text-base">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost px-8 py-3.5 text-base">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Free forever</div>
            <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> No credit card</div>
            <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Works offline</div>
          </div>
        </motion.div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true }}
          className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Fake browser bar */}
          <div className="bg-surface-900 px-4 py-3 border-b border-white/8 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="ml-4 flex-1 bg-white/6 rounded-md px-3 py-1 text-xs text-slate-600">progressplus.app/dashboard</div>
          </div>
          {/* Dashboard mini preview */}
          <div className="bg-surface-950 p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[['✅','12','Tasks Done','green'],['⏳','3','Remaining','orange'],['🔥','7','Day Streak','brand'],['⚡','78%','Score','blue']].map(([icon,val,label,color])=>(
                <div key={label} className={`glass-card p-4 border border-${color}-500/20`}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xl font-bold text-white font-display">{val}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 h-24 items-end">
              {[60,85,40,95,100,70,88].map((h,i)=>(
                <div key={i} className="bg-brand-500/20 rounded-t-lg relative overflow-hidden flex-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-brand-gradient rounded-t-lg" style={{height:`${h}%`}} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
                <span key={d} className="text-xs text-slate-600 flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="section-title mb-3">How it works</div>
        <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-12">
          Three simple steps to <span className="gradient-text">build momentum</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step:'01', icon:'✅', title:'Add Your Tasks', desc:'Create tasks with priority and category. Takes 5 seconds.' },
            { step:'02', icon:'🔥', title:'Complete & Log', desc:'Check off tasks and log your habits every day.' },
            { step:'03', icon:'📊', title:'Review Progress', desc:'See your consistency and productivity insights weekly.' },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ duration:0.5 }} viewport={{ once:true }}
              className="glass-card p-7 text-center relative"
            >
              <div className="absolute top-4 right-4 font-display font-black text-4xl text-white/4">{item.step}</div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <div className="section-title mb-3">Features</div>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-white">
            Everything you need to <span className="gradient-text">stay consistent</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ duration:0.4, delay: i*0.07 }} viewport={{ once:true }}
              className="glass-card-hover p-6"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <div className="section-title mb-3">FAQ</div>
          <h2 className="font-display font-bold text-3xl text-white">Common questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map(faq => <FAQ key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }}
          className="glass-card p-12 border-brand-500/20 shadow-glow"
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="font-display font-black text-3xl lg:text-4xl text-white mb-4">
            Start building your best self today.
          </h2>
          <p className="text-slate-400 mb-8">Free forever. No credit card required. Takes 30 seconds to get started.</p>
          <Link to="/register" className="btn-brand px-10 py-4 text-base">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-brand-400" />
          <span className="font-display font-bold text-sm gradient-text">ProgressPlus</span>
        </div>
        <p className="text-xs text-slate-600">Track Tasks. Build Habits. Master Consistency.</p>
      </footer>
    </div>
  )
}
