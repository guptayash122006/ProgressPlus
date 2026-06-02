import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { Mail, Lock, Chrome } from 'lucide-react'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.success('Welcome back!')
    } catch (err) {
      const msg = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      }[err.code] || 'Failed to login. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Welcome!')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
        <p className="text-slate-400">Sign in to continue your progress journey.</p>
      </div>

      {/* Google Sign In */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-200 mb-5 disabled:opacity-50"
      >
        {googleLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-slate-600 font-medium">or sign in with email</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
