import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser

  console.log("REQUEST URL:", config.url)
  console.log("CURRENT USER:", user)

  if (user) {
    const token = await user.getIdToken()

    console.log("TOKEN GENERATED:", !!token)

    config.headers.Authorization = `Bearer ${token}`
  }

  console.log("AUTH HEADER:", config.headers.Authorization)

  return config
})

// Handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      auth.signOut()
    }
    return Promise.reject(err)
  }
)

export default api
