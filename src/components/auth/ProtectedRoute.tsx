import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BrainCircuit } from 'lucide-react'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isSupabaseConnected } = useAuth()
  const location = useLocation()

  // In demo mode without configured Supabase credentials, allow access to demonstrate prototype
  if (!isSupabaseConnected) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-cyan-glow animate-pulse">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <p className="text-xs font-mono text-cyan-300">Validating SOC Analyst Credentials...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
