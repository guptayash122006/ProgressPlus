import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { resetPassword } from '@/lib/firebase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch {
      toast.error('Could not send reset email. Check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Reset password</h1>
        <p className="text-slate-400">Enter your email and we'll send you a reset link.</p>
      </div>

      {sent ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📬</div>
          <h3 className="font-semibold text-white text-lg mb-2">Check your inbox</h3>
          <p className="text-slate-400 text-sm mb-6">We sent a reset link to <strong className="text-white">{email}</strong></p>
          <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">← Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
          <Button type="submit" fullWidth loading={loading} size="lg">Send Reset Link</Button>
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">← Back to login</Link>
          </p>
        </form>
      )}
    </div>
  )
}
