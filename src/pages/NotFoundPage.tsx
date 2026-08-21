import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '../components/common/Button'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/40 border border-red-500/40 text-red-400 shadow-red-glow">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-red-400">HTTP 404 // ROUTE NOT FOUND</span>
        <h1 className="text-xl font-display font-bold text-slate-100">
          Unrecognized Security Console Endpoint
        </h1>
        <p className="text-xs text-slate-400 max-w-sm">
          The requested forensic path or network entity does not exist in the active SOC directory.
        </p>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate('/')}
        className="gap-2 text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Command Center</span>
      </Button>
    </div>
  )
}
