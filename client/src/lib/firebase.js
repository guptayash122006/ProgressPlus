// Replace with your Firebase project config from:
// Firebase Console → Project Settings → Your Apps → Web App → SDK setup
export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Google Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Auth helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

export const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)

export const logout = () => signOut(auth)

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

export const updateUserProfile = (user, data) => updateProfile(user, data)

export default app
