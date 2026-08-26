import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  X, 
  HelpCircle,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react'
import { cyberAudioService, isAudioMuted, toggleAudioMute } from '../../services/cyberAudioService'
import confetti from 'canvas-confetti'

interface WalkthroughStep {
  title: string
  page: string
  description: string
  actionLabel: string
  highlightEl?: string
}

const STEPS: WalkthroughStep[] = [
  {
    title: '1. Executive KPI Metrics & Load Controller',
    page: '/',
    description: 'Welcome to the SentinelX Autonomous SOC! Observe the real-time Circular Risk Gauge and Shannon entropy graphs. Try shifting the "Ingestion Load Slider" to simulate heavy packet streams.',
    actionLabel: 'Go to Dashboard',
  },
  {
    title: '2. Continuous Fleet Telemetry Onboarding',
    page: '/devices',
    description: 'Navigate to Fleet Inventory. SentinelX tracks agent telemetry. Register a new custom endpoint, search filter nodes, or decommissioning nodes to clean fleet inventory.',
    actionLabel: 'Go to Fleet Inventory',
  },
  {
    title: '3. 3D Spatial Network Topology visualizer',
    page: '/network-3d',
    description: 'Explore the high-fidelity WebGL 3D network topology. Click "3D Sliders" inside the toolbar to dynamically tune camera angles, node sizes, and packet speed multipliers.',
    actionLabel: 'Go to 3D Topology',
  },
  {
    title: '4. SOAR Port Isolation Containment (802.1X)',
    page: '/network-3d',
    description: 'Click any compromised node (e.g. Server-07) in the 3D space. Select the "1-Click Quarantine" action button inside the forensic panel to watch the wireframe cage spawn in real-time.',
    actionLabel: 'Explore Quarantine',
  },
  {
    title: '5. Emergency Incident Reports & STIX 2.1 Export',
    page: '/reports',
    description: 'Audit preparedness center. Click "Generate Live Report" to compile a SOC-2/ISO incident report. Export standard STIX 2.1 IOC threat feed JSON bundles for external sharing.',
    actionLabel: 'Go to Reports Hub',
  },
  {
    title: '6. AI Copilot Analyst workspace',
    page: '/ai-chat',
    description: 'Sentinel AI is a fully conversational natural language SOC analyst. Toggle custom page themes (Matrix Green, Neon Cyan) and prompt or speak to resolve incidents in real-time.',
    actionLabel: 'Go to AI Workspace',
  }
]

export const JuryWalkthroughPanel: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [muted, setMuted] = useState(isAudioMuted())

  // Play alarm/chime on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      cyberAudioService.playChime()
    }
  }, [isOpen, isMinimized])

  const handleNext = () => {
    cyberAudioService.playTick()
    if (currentStep < STEPS.length - 1) {
      const nextIdx = currentStep + 1
      setCurrentStep(nextIdx)
      navigate(STEPS[nextIdx].page)
    } else {
      // Completed Walkthrough! Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#A855F7', '#10B981']
      })
      cyberAudioService.playRestore()
      setIsMinimized(true)
    }
  }

  const handlePrev = () => {
    cyberAudioService.playTick()
    if (currentStep > 0) {
      const prevIdx = currentStep - 1
      setCurrentStep(prevIdx)
      navigate(STEPS[prevIdx].page)
    }
  }

  const executeStepAction = () => {
    cyberAudioService.playChime()
    navigate(STEPS[currentStep].page)
  }

  const toggleMuteState = () => {
    const newState = toggleAudioMute()
    setMuted(newState)
    if (!newState) {
      cyberAudioService.playTick()
    }
  }

  if (!isOpen) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          cyberAudioService.playTick()
          setIsMinimized(false)
        }}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-cyan-500/40 bg-slate-950/90 text-cyan-300 shadow-neon-cyan hover:bg-slate-900 transition-all font-mono text-[11px] font-bold tracking-wider"
      >
        <Compass className="h-4 w-4 animate-spin-slow text-cyan-400" />
        <span>JURY WALKTHROUGH GUIDE</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 w-80 p-4 rounded-xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-md shadow-2xl space-y-3 font-mono text-xs text-slate-200 transition-all animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Jury Walkthrough Panel</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Mute button */}
          <button
            onClick={toggleMuteState}
            className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
            title={muted ? 'Unmute Synthesized Chimes' : 'Mute Audio Chimes'}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
          </button>
          
          <button
            onClick={() => {
              cyberAudioService.playTick()
              setIsMinimized(true)
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
            title="Minimize guide"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              cyberAudioService.playTick()
              setIsOpen(false)
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
            title="Close guide"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Step details */}
      <div className="space-y-2">
        <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">
          Step {currentStep + 1} of {STEPS.length}
        </div>
        <h4 className="text-slate-100 font-bold text-[13px] leading-tight">
          {STEPS[currentStep].title}
        </h4>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          {STEPS[currentStep].description}
        </p>
      </div>

      {/* Action triggers */}
      <div className="pt-1.5 flex gap-2">
        <button
          onClick={executeStepAction}
          className="flex-1 py-1.5 px-3 rounded bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] uppercase transition-colors"
        >
          {STEPS[currentStep].actionLabel}
        </button>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-0.5 text-[10px] font-bold ${
            currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-0.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-200"
        >
          <span>{currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
