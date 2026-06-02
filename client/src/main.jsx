import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import AppRouter from '@/router'
import '@/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 min
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#161830',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#161830' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#161830' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
