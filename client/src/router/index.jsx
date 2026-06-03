import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import TasksPage from '@/pages/TasksPage'
import HabitsPage from '@/pages/HabitsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AchievementsPage from '@/pages/AchievementsPage'
import ProfilePage from '@/pages/ProfilePage'

// Loading
import Spinner from '@/components/ui/Spinner'

// Protected Route wrapper
function PrivateRoute({ children }) {
  const { user, loading, dbUser } = useAuthStore()
  console.log('[PRIVATE ROUTE] user:', user)
  console.log('[PRIVATE ROUTE] dbUser:', dbUser)
  console.log('[PRIVATE ROUTE] loading:', loading)
  console.log('[PRIVATE ROUTE] dbUser?.onboardingCompleted:', dbUser?.onboardingCompleted)
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!user) {
  console.log('[ONBOARDING ROUTE] → redirecting to /login (no user)')
  return <Navigate to="/login" replace />
}

if (dbUser?.onboardingCompleted) {
  console.log('[ONBOARDING ROUTE] → redirecting to /dashboard')
  return <Navigate to="/dashboard" replace />
}

console.log('[ONBOARDING ROUTE] → rendering children')
return children
}

// Public only (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading, dbUser } = useAuthStore()
  console.log('[PUBLIC ROUTE] user:', user)
  console.log('[PUBLIC ROUTE] dbUser:', dbUser)
  console.log('[PUBLIC ROUTE] loading:', loading)
  console.log('[PUBLIC ROUTE] dbUser?.onboardingCompleted:', dbUser?.onboardingCompleted)
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  // If authenticated, redirect to dashboard or onboarding based on onboarding status
  if (user && dbUser?.onboardingCompleted) {
    console.log('[PUBLIC ROUTE] → redirecting to /dashboard (user + onboarding done)')
    return <Navigate to="/dashboard" replace />
  }
  if (user) {
    console.log('[PUBLIC ROUTE] → redirecting to /onboarding (user exists, onboardingCompleted is falsy, dbUser:', JSON.stringify(dbUser), ')')
    return <Navigate to="/onboarding" replace />
  }
  console.log('[PUBLIC ROUTE] → rendering children (no user)')
  return children
}

// Onboarding route (must be logged in but not done onboarding)
function OnboardingRoute({ children }) {
  const { user, loading, dbUser } = useAuthStore()
  console.log('[ONBOARDING ROUTE] user:', user)
  console.log('[ONBOARDING ROUTE] dbUser:', dbUser)
  console.log('[ONBOARDING ROUTE] loading:', loading)
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!user) {
    console.log('[ONBOARDING ROUTE] → redirecting to /login (no user)')
    return <Navigate to="/login" replace />
  }
  console.log('[ONBOARDING ROUTE] → rendering children')
  return children
}

export default function AppRouter() {
  const { syncUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      console.log('[APP ROUTER] onAuthChange fired. firebaseUser:', firebaseUser)
      console.log('[APP ROUTER] firebaseUser?.uid:', firebaseUser?.uid)
      console.log('[APP ROUTER] firebaseUser?.email:', firebaseUser?.email)
      console.log('[APP ROUTER] calling syncUser...')
      syncUser(firebaseUser)
    })
    return () => unsub()
  }, [syncUser])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><AuthLayout><LoginPage /></AuthLayout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthLayout><RegisterPage /></AuthLayout></PublicRoute>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

        {/* App (Protected) */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><DashboardPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><DashboardLayout><TasksPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/habits"    element={<PrivateRoute><DashboardLayout><HabitsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><DashboardLayout><AchievementsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
