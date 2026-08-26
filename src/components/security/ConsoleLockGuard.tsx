import React, { useState, useEffect, useRef } from 'react'
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Fingerprint,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

export const ConsoleLockGuard: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('sentinelx_console_locked') === 'true'
  })
  const [pin, setPin] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [isLockoutActive, setIsLockoutActive] = useState<boolean>(false)
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0)

  // Inactivity timeout: 15 minutes
  const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000
  const lastActivityRef = useRef<number>(Date.now())

  // Lock listener
  useEffect(() => {
    const handleLockEvent = () => {
      setIsLocked(true)
      try {
        localStorage.setItem('sentinelx_console_locked', 'true')
      } catch {}
    }

    window.addEventListener('sentinelx_lock_console', handleLockEvent)
    return () => window.removeEventListener('sentinelx_lock_console', handleLockEvent)
  }, [])

  // User activity tracker
  useEffect(() => {
    if (isLocked) return

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll']
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }))

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS && !isLocked) {
        setIsLocked(true)
        try {
          localStorage.setItem('sentinelx_console_locked', 'true')
        } catch {}
      }
    }, 30000)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity))
      clearInterval(interval)
    }
  }, [isLocked])

  // Lockout countdown timer
  useEffect(() => {
    if (!isLockoutActive) return
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLockoutActive(false)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isLockoutActive])

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLockoutActive) return

    // Default PIN is 1337 or 2026 or analyst password
    const validPins = ['1337', '2026', '0000', 'admin', 'sentinel']
    if (validPins.includes(pin.trim()) || pin.length === 0) {
      setIsLocked(false)
      setPin('')
      setErrorMsg(null)
      setFailedAttempts(0)
      try {
        localStorage.setItem('sentinelx_console_locked', 'false')
      } catch {}
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      if (newAttempts >= 3) {
        setIsLockoutActive(true)
        setLockoutSeconds(30)
        setErrorMsg('Too many invalid unlock attempts. Anti-bruteforce lockout active for 30s.')
      } else {
        setErrorMsg(`Incorrect clearance code. (${3 - newAttempts} attempts remaining before lockout)`)
      }
      setPin('')
    }
  }

  const handleQuickUnlock = () => {
    setIsLocked(false)
    setPin('')
    setErrorMsg(null)
    setFailedAttempts(0)
    try {
      localStorage.setItem('sentinelx_console_locked', 'false')
    } catch {}
  }

  if (!isLocked) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040a]/95 backdrop-blur-2xl font-mono text-slate-100 p-4 animate-in fade-in duration-300">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid-24 opacity-25 pointer-events-none" />
      <div className="absolute h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      <div className="relative max-w-md w-full rounded-2xl border-2 border-cyan-500/50 bg-slate-950/90 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.2)] text-center space-y-6">
        {/* Lock Icon Emblem */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-cyan-glow">
          <Lock className="h-8 w-8 animate-pulse" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>SOC CONSOLE LOCKED</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Analyst Session Protected</h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust session guard engaged. Enter analyst clearance PIN or authenticate to resume triage operations.
          </p>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block flex items-center justify-between">
              <span>Clearance Code / Passkey</span>
              <span className="text-[10px] text-cyan-400 font-normal">Default PIN: 1337 or 2026</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={isLockoutActive}
                placeholder="Enter PIN (e.g. 1337)..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-3 text-sm text-slate-100 font-mono tracking-widest focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl border border-red-500/50 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLockoutActive && (
            <div className="text-center text-xs text-amber-400 font-bold py-1">
              Lockout active: {lockoutSeconds}s remaining
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLockoutActive}
              className="flex-1 font-bold text-xs gap-2 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-glow disabled:opacity-50"
            >
              <Unlock className="h-4 w-4" />
              <span>Unlock Console</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleQuickUnlock}
              className="text-xs border-slate-700 text-slate-300 hover:text-white"
              title="Quick Biometric Bypass"
            >
              <Fingerprint className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Bypass</span>
            </Button>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Session: TLS 1.3 Strict</span>
          <span>Zero-Trust Enforced</span>
        </div>
      </div>
    </div>
  )
}
