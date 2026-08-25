import React, { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Zap,
  Radio,
  Compass,
  Layers,
  Check,
  ChevronUp,
  Sliders,
  Activity,
  EyeOff,
} from 'lucide-react'

export type ScrollFXMode = 'matrix' | 'hyperspace' | 'radar' | 'tactical' | 'chromatic' | 'off'
export type FXIntensity = 'subtle' | 'moderate' | 'vivid'

interface FXOption {
  id: ScrollFXMode
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  badge: string
}

const FX_OPTIONS: FXOption[] = [
  {
    id: 'matrix',
    label: 'Cyber Matrix Rain & Sparks',
    desc: 'Glowing cybernetic code streams & neon particle sparks on scroll',
    icon: Sparkles,
    badge: 'MATRIX',
  },
  {
    id: 'hyperspace',
    label: 'Hyperspace Starfield',
    desc: 'Ambient star streaks with dynamic scroll acceleration',
    icon: Zap,
    badge: 'WARP',
  },
  {
    id: 'radar',
    label: 'Holographic Radar Sweep',
    desc: 'Tactical radar scanner beam & live telemetry visualizer',
    icon: Radio,
    badge: 'RADAR',
  },
  {
    id: 'tactical',
    label: 'Tactical HUD Pitch Ladder',
    desc: 'Military-grade elevation & altitude telemetry HUD',
    icon: Compass,
    badge: 'HUD',
  },
  {
    id: 'chromatic',
    label: 'Chromatic Shockwave Flare',
    desc: 'Dynamic RGB edge flare pulse on high-velocity scroll',
    icon: Layers,
    badge: 'CHROMA',
  },
  {
    id: 'off',
    label: 'Effects Disabled (Off)',
    desc: 'Clean minimal background; top progress bar only',
    icon: EyeOff,
    badge: 'OFF',
  },
]

const INTENSITY_SETTINGS: Record<FXIntensity, { label: string; multiplier: number; canvasAlpha: number }> = {
  subtle: { label: 'Subtle', multiplier: 0.5, canvasAlpha: 0.35 },
  moderate: { label: 'Moderate', multiplier: 0.85, canvasAlpha: 0.65 },
  vivid: { label: 'Vivid', multiplier: 1.25, canvasAlpha: 0.95 },
}

const MATRIX_CHARS = '0123456789ABCDEF⚡λ§ΔΨΩ0xAFNETSECλπ∅∞∆∇'.split('')

export const ScrollParticleMatrix: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentMode, setCurrentMode] = useState<ScrollFXMode>('matrix')
  const [intensity, setIntensity] = useState<FXIntensity>('moderate')
  const [menuOpen, setMenuOpen] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDepth, setScrollDepth] = useState(0)

  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentVelocityRef = useRef(0)
  const scrollDirectionRef = useRef<'down' | 'up'>('down')
  const modeRef = useRef<ScrollFXMode>(currentMode)
  const intensityRef = useRef<FXIntensity>(intensity)

  useEffect(() => {
    modeRef.current = currentMode
  }, [currentMode])

  useEffect(() => {
    intensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    const savedMode = localStorage.getItem('sentinelx_scroll_fx') as ScrollFXMode | null
    const savedIntensity = localStorage.getItem('sentinelx_scroll_intensity') as FXIntensity | null
    if (savedMode && FX_OPTIONS.some((opt) => opt.id === savedMode)) {
      setCurrentMode(savedMode)
    } else {
      setCurrentMode('matrix')
    }
    if (savedIntensity && INTENSITY_SETTINGS[savedIntensity]) {
      setIntensity(savedIntensity)
    } else {
      setIntensity('moderate')
    }
  }, [])

  const handleSelectMode = (mode: ScrollFXMode) => {
    setCurrentMode(mode)
    localStorage.setItem('sentinelx_scroll_fx', mode)
  }

  const handleSelectIntensity = (val: FXIntensity) => {
    setIntensity(val)
    localStorage.setItem('sentinelx_scroll_intensity', val)
  }

  // Scroll listener for velocity calculation
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const currentScrollY = window.scrollY
      const dt = Math.max(1, now - lastScrollTime.current)
      const dy = currentScrollY - lastScrollY.current
      const absDy = Math.abs(dy)

      const instantVelocity = Math.min(100, Math.round((absDy / dt) * 55))
      currentVelocityRef.current = instantVelocity
      scrollDirectionRef.current = dy >= 0 ? 'down' : 'up'

      setVelocity(instantVelocity)
      setIsScrolling(true)
      setScrollDepth(Math.round(currentScrollY))

      lastScrollY.current = currentScrollY
      lastScrollTime.current = now

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
        setVelocity(0)
        currentVelocityRef.current = 0
      }, 160)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  // Canvas rendering
  useEffect(() => {
    if (currentMode === 'off') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Mode 1: Hyperspace Stars
    const STAR_COUNT = 65
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * width,
      pz: 0,
      color: Math.random() > 0.6 ? '#00f0ff' : Math.random() > 0.3 ? '#a855f7' : '#38bdf8',
    }))

    // Mode 2: Cyber Matrix Rain (Full screen columns with glowing heads)
    const columnCount = Math.max(14, Math.floor(width / 48))
    const matrixDrops = Array.from({ length: columnCount }, (_, i) => {
      return {
        x: (i + 0.5) * (width / columnCount),
        y: Math.random() * -height,
        speed: 1.2 + Math.random() * 2.2,
        length: Math.floor(6 + Math.random() * 10),
        chars: Array.from({ length: 16 }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
        fontSize: 12,
        opacity: 0.25 + Math.random() * 0.35,
      }
    })

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
      maxLife: number
      life: number
    }> = []

    // Mode 3: Radar
    let radarSweep = 0

    let lastTime = performance.now()

    const render = (time: number) => {
      const dt = Math.min(50, time - lastTime) / 1000
      lastTime = time

      ctx.clearRect(0, 0, width, height)
      const rawVel = currentVelocityRef.current
      const curIntensity = INTENSITY_SETTINGS[intensityRef.current] || INTENSITY_SETTINGS.moderate
      const vel = rawVel * curIntensity.multiplier
      const mode = modeRef.current

      // 1. HYPERSPACE
      if (mode === 'hyperspace') {
        const speedMultiplier = 20 + vel * 12
        const cx = width / 2
        const cy = height / 2

        ctx.save()
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i]
          star.pz = star.z
          star.z -= speedMultiplier * dt * 20

          if (star.z <= 0) {
            star.z = width
            star.pz = star.z
            star.x = (Math.random() - 0.5) * width * 1.5
            star.y = (Math.random() - 0.5) * height * 1.5
          }

          const k = 220 / star.z
          const px = star.x * k + cx
          const py = star.y * k + cy

          const pk = 220 / star.pz
          const prevX = star.x * pk + cx
          const prevY = star.y * pk + cy

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const alpha = Math.min(0.75, (1 - star.z / width) * (0.3 + (vel / 100) * 0.6)) * curIntensity.multiplier
            ctx.strokeStyle = star.color
            ctx.lineWidth = Math.max(1, (1 - star.z / width) * 2)
            ctx.globalAlpha = alpha

            ctx.beginPath()
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(px, py)
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      // 2. CYBER MATRIX RAIN & PARTICLE SPARKS
      else if (mode === 'matrix') {
        const boost = 1 + (vel / 100) * 2.8

        ctx.save()
        for (let i = 0; i < matrixDrops.length; i++) {
          const drop = matrixDrops[i]
          drop.y += drop.speed * boost

          if (drop.y - drop.length * drop.fontSize > height) {
            drop.y = Math.random() * -120
            drop.speed = 1.2 + Math.random() * 2.0
            // Randomize characters on recycle
            drop.chars = Array.from({ length: 16 }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)])
          }

          ctx.font = `bold ${drop.fontSize}px 'JetBrains Mono', monospace`

          for (let j = 0; j < drop.length; j++) {
            const charY = drop.y - j * drop.fontSize
            if (charY < -20 || charY > height + 20) continue

            const isHead = j === 0
            const isSecond = j === 1
            const charAlpha = (isHead ? 0.95 : isSecond ? 0.65 : drop.opacity * (1 - j / drop.length)) * curIntensity.multiplier

            if (isHead) {
              ctx.fillStyle = `rgba(0, 240, 255, ${charAlpha})`
              ctx.shadowColor = 'rgba(0, 240, 255, 0.8)'
              ctx.shadowBlur = 8
            } else if (isSecond) {
              ctx.fillStyle = `rgba(168, 85, 247, ${charAlpha})`
              ctx.shadowBlur = 4
            } else {
              ctx.fillStyle = `rgba(16, 185, 129, ${charAlpha})`
              ctx.shadowBlur = 0
            }

            ctx.fillText(drop.chars[j] || '0', drop.x, charY)
          }
        }
        ctx.restore()

        // Kinetic Particle Sparks emitted on scroll motion
        if (vel > 5) {
          const sparkCount = Math.min(6, Math.floor(vel / 12) + 1)
          for (let s = 0; s < sparkCount; s++) {
            particles.push({
              x: Math.random() * width,
              y: scrollDirectionRef.current === 'down' ? height - Math.random() * 80 : Math.random() * 80,
              vx: (Math.random() - 0.5) * 4,
              vy: (scrollDirectionRef.current === 'down' ? -1 : 1) * (2 + Math.random() * 6),
              size: Math.random() * 2.5 + 1.2,
              alpha: 0.85 * curIntensity.multiplier,
              maxLife: 35,
              life: 35,
              color: Math.random() > 0.6 ? '#00f0ff' : Math.random() > 0.3 ? '#a855f7' : '#10b981',
            })
          }
        }

        // Render & update particles
        ctx.save()
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.life -= 1
          p.alpha = (p.life / p.maxLife) * 0.85 * curIntensity.multiplier

          if (p.life <= 0) {
            particles.splice(i, 1)
            continue
          }

          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // 3. RADAR
      else if (mode === 'radar') {
        radarSweep = (radarSweep + 0.008 + (vel / 100) * 0.025) % 1
        const sweepY = radarSweep * height

        const gradient = ctx.createLinearGradient(0, sweepY - 20, 0, sweepY + 20)
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0)')
        gradient.addColorStop(0.5, `rgba(0, 240, 255, ${0.15 * curIntensity.multiplier})`)
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, sweepY - 20, width, 40)

        // Mini audio bars along bottom
        const barCount = 32
        const barWidth = width / barCount
        ctx.fillStyle = `rgba(0, 240, 255, ${0.3 * curIntensity.multiplier})`

        for (let b = 0; b < barCount; b++) {
          const freq = Math.sin(b * 0.4 + time * 0.005) * 0.5 + 0.5
          const barHeight = 3 + freq * (6 + (vel / 100) * 16)
          ctx.fillRect(b * barWidth + 3, height - barHeight, barWidth - 6, barHeight)
        }
      }

      // 4. TACTICAL HUD
      else if (mode === 'tactical') {
        const cx = width / 2
        const cy = height / 2
        const hudAlpha = 0.2 * curIntensity.multiplier

        ctx.save()
        ctx.strokeStyle = `rgba(0, 240, 255, ${hudAlpha})`
        ctx.lineWidth = 1

        // Minimal crosshair
        ctx.beginPath()
        ctx.moveTo(cx - 24, cy)
        ctx.lineTo(cx - 6, cy)
        ctx.moveTo(cx + 6, cy)
        ctx.lineTo(cx + 24, cy)
        ctx.moveTo(cx, cy - 24)
        ctx.lineTo(cx, cy - 6)
        ctx.moveTo(cx, cy + 6)
        ctx.lineTo(cx, cy + 24)
        ctx.stroke()

        // Telemetry note
        ctx.font = "10px 'JetBrains Mono', monospace"
        ctx.fillStyle = `rgba(0, 240, 255, ${0.5 * curIntensity.multiplier})`
        ctx.fillText(`ALT: ${Math.round(window.scrollY)}M`, 20, height - 35)
        ctx.fillText(`VEL: ${Math.round(rawVel * 12)}PX/S`, 20, height - 20)
        ctx.restore()
      }

      // 5. CHROMATIC FLARE
      else if (mode === 'chromatic') {
        if (vel > 15) {
          const flareAlpha = Math.min(0.35, (vel / 100) * 0.45) * curIntensity.multiplier

          const gradTop = ctx.createLinearGradient(0, 0, 0, 45)
          gradTop.addColorStop(0, `rgba(0, 240, 255, ${flareAlpha})`)
          gradTop.addColorStop(1, 'rgba(0, 240, 255, 0)')
          ctx.fillStyle = gradTop
          ctx.fillRect(0, 0, width, 45)

          const gradBottom = ctx.createLinearGradient(0, height, 0, height - 45)
          gradBottom.addColorStop(0, `rgba(168, 85, 247, ${flareAlpha})`)
          gradBottom.addColorStop(1, 'rgba(168, 85, 247, 0)')
          ctx.fillStyle = gradBottom
          ctx.fillRect(0, height - 45, width, 45)
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentMode, intensity])

  const activeOption = FX_OPTIONS.find((opt) => opt.id === currentMode) || FX_OPTIONS[0]

  return (
    <>
      {/* Background Interactive FX Canvas */}
      {currentMode !== 'off' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-85 transition-opacity duration-500"
        />
      )}

      {/* Floating Scroll FX Control Switcher */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="relative">
          {/* Collapsible Options Drawer */}
          {menuOpen && (
            <div className="absolute bottom-12 left-0 w-72 rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  SCROLL VISUAL EFFECTS
                </span>
                <span className="text-[9px] text-purple-300 font-bold px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30">
                  {activeOption.badge}
                </span>
              </div>

              {/* Mode Selection List */}
              <div className="space-y-1">
                {FX_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = opt.id === currentMode

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectMode(opt.id)}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-neon-cyan/20'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-100">{opt.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Intensity Controls */}
              {currentMode !== 'off' && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    EFFECT INTENSITY
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['subtle', 'moderate', 'vivid'] as FXIntensity[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleSelectIntensity(lvl)}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          intensity === lvl
                            ? 'bg-purple-500/25 text-purple-200 border-purple-500/50 shadow-purple-glow-sm'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {lvl.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Pill Toggle Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-slate-950/90 text-cyan-300 text-xs font-mono shadow-neon-cyan/25 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-400 hover:text-white active:scale-95 ${
              isScrolling ? 'ring-2 ring-cyan-400/40 shadow-neon-cyan' : ''
            }`}
            title="Configure Scroll Visual Effects"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
            <span className="font-semibold">{activeOption.label}</span>
            {isScrolling && (
              <span className="text-[10px] text-purple-300 font-bold border-l border-slate-700 pl-1.5">
                {velocity * 12} px/s
              </span>
            )}
            <ChevronUp className={`h-3 w-3 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </>
  )
}
