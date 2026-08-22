import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  Database,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useAuth } from '../hooks/useAuth'
import { productConfig } from '../config/productConfig'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name is required'),
  callsign: z.string().min(2, 'Callsign is required (e.g. SPECTRE-09)'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, isSupabaseConnected } = useAuth()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)

  const from = (location.state as any)?.from?.pathname || '/'

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'analyst@sentinelx.security',
      password: 'password123',
    },
  })

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      callsign: 'CYBER-OPS',
    },
  })

  const onLogin = async (data: LoginFormValues) => {
    setAuthError(null)
    setAuthSuccess(null)
    const res = await signIn(data.email, data.password)
    if (res.error) {
      setAuthError(res.error)
    } else {
      navigate(from, { replace: true })
    }
  }

  const onSignup = async (data: SignupFormValues) => {
    setAuthError(null)
    setAuthSuccess(null)
    const res = await signUp(data.email, data.password, data.fullName, data.callsign)
    if (res.error) {
      setAuthError(res.error)
    } else {
      setAuthSuccess('Analyst account initialized. You may now sign in.')
      setActiveTab('signin')
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-glow mb-2">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-100">
            {productConfig.brand.name} SOC Console
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            TACTICAL INCIDENT RESPONSE & COMPROMISE DETECTION
          </p>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant={isSupabaseConnected ? 'healthy' : 'medium'} className="text-[10px] font-mono">
              <Database className="h-3 w-3 mr-1" />
              {isSupabaseConnected ? 'SUPABASE BACKEND CONNECTED' : 'LOCAL DEMO BUFFER MODE'}
            </Badge>
          </div>
        </div>

        {/* Auth Card */}
        <Card variant="cyber" className="p-6 rounded-2xl shadow-2xl border-slate-700 space-y-5">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('signin')
                setAuthError(null)
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'signin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analyst Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup')
                setAuthError(null)
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-purple-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Clearance
            </button>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/30 text-xs text-red-300 flex items-start gap-2 animate-in fade-in-0">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in-0">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Analyst Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    {...loginRegister('email')}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="analyst@enterprise.corp"
                  />
                </div>
                {loginErrors.email && <p className="text-red-400 mt-1 text-[11px]">{loginErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Access Token / Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    {...loginRegister('password')}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                {loginErrors.password && <p className="text-red-400 mt-1 text-[11px]">{loginErrors.password.message}</p>}
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isLoginSubmitting}
                className="w-full text-xs font-semibold gap-2 h-10 shadow-cyan-glow-sm mt-2"
              >
                <span>Authenticate Session</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Analyst Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    {...signupRegister('fullName')}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
                    placeholder="Agent Sarah Jenkins"
                  />
                </div>
                {signupErrors.fullName && <p className="text-red-400 mt-1 text-[11px]">{signupErrors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tactical Callsign</label>
                <input
                  type="text"
                  {...signupRegister('callsign')}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
                  placeholder="GHOST-01"
                />
                {signupErrors.callsign && <p className="text-red-400 mt-1 text-[11px]">{signupErrors.callsign.message}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    {...signupRegister('email')}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
                    placeholder="s.jenkins@enterprise.corp"
                  />
                </div>
                {signupErrors.email && <p className="text-red-400 mt-1 text-[11px]">{signupErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    {...signupRegister('password')}
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                {signupErrors.password && <p className="text-red-400 mt-1 text-[11px]">{signupErrors.password.message}</p>}
              </div>

              <Button
                variant="ai"
                size="md"
                type="submit"
                isLoading={isSignupSubmitting}
                className="w-full text-xs font-semibold gap-2 h-10 shadow-purple-glow mt-2"
              >
                <span>Register Analyst Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[11px] font-mono text-cyan-400 hover:underline"
            >
              ← Return to SOC Overview Console
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
