import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,           // Firebase user object
      dbUser: null,         // MongoDB user document
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setDbUser: (dbUser) => set({ dbUser }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      // Sync Firebase user to MongoDB
      syncUser: async (firebaseUser) => {
        console.log('[SYNC USER] called with firebaseUser:', firebaseUser)
        console.log('[SYNC USER] firebaseUser?.uid:', firebaseUser?.uid)
        console.log('[SYNC USER] firebaseUser?.email:', firebaseUser?.email)
        if (!firebaseUser) {
          console.log('[SYNC USER] no firebaseUser → clearing store (user=null, dbUser=null, loading=false)')
          set({ user: null, dbUser: null, loading: false, initialized: true })
          return
        }
        console.log('[SYNC USER] setting user in store, calling /auth/sync...')
        set({ user: firebaseUser })
        try {
          const { data } = await api.post('/auth/sync', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          })
          console.log('[SYNC USER] /auth/sync response data:', data)
          console.log('[SYNC USER] dbUser to be stored (data.data):', data.data)
          console.log('[SYNC USER] onboardingCompleted:', data.data?.onboardingCompleted)
          set({ dbUser: data.data, loading: false, initialized: true })
          console.log('[SYNC USER] store updated → loading=false, initialized=true')
        } catch (err) {
          console.error('[SYNC USER] /auth/sync error:', err)
          console.log('[SYNC USER] store updated after error → loading=false, initialized=true, dbUser unchanged')
          set({ loading: false, initialized: true })
        }
      },

      // Complete onboarding
      completeOnboarding: async () => {
        const { user } = get()
        try {
          // Send user data in body for fallback auth when Firebase not configured
          const { data } = await api.put('/auth/onboarding', {
            uid: user?.uid,
            email: user?.email,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
          })
          set({ dbUser: data.data })
        } catch (err) {
          console.error('completeOnboarding error:', err)
        }
      },

      // Update gamification (XP, level, badges)
      addXP: (amount) => {
        const { dbUser } = get()
        if (!dbUser) return
        const newXP = (dbUser.gamification?.xp || 0) + amount
        const newLevel = Math.floor(newXP / 100) + 1
        set({
          dbUser: {
            ...dbUser,
            gamification: { ...dbUser.gamification, xp: newXP, level: newLevel },
          },
        })
      },

      logout: () => set({ user: null, dbUser: null }),
    }),
    {
      name: 'pp-auth',
      partialize: (s) => ({ dbUser: s.dbUser }),
    }
  )
)
