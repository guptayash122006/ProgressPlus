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
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
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
