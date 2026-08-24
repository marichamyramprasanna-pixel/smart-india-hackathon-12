import React, { useEffect, useState, useRef } from 'react'

export const ScrollVelocityBeam: React.FC = () => {
  const [velocity, setVelocity] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const beamRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const scrollTimeout = useRef<any>(null)

  useEffect(() => {
    let animId: number

    const handleScroll = () => {
      const now = Date.now()
      const currentScrollY = window.scrollY
      const dt = Math.max(1, now - lastScrollTime.current)
      const dy = Math.abs(currentScrollY - lastScrollY.current)
      const currentVelocity = Math.min(100, Math.round((dy / dt) * 50))

      setVelocity(currentVelocity)
      setIsScrolling(true)

      lastScrollY.current = currentScrollY
      lastScrollTime.current = now

      clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
        setVelocity(0)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout.current)
    }
  }, [])

  return (
    <>
      {/* 1. Scroll-Velocity Holographic Laser Scanner Beam */}
      <div
        ref={beamRef}
        className={`pointer-events-none fixed left-0 right-0 z-30 h-[2px] transition-opacity duration-200 ${
          isScrolling ? 'opacity-90' : 'opacity-0'
        }`}
        style={{
          top: `${Math.min(95, Math.max(5, (velocity * 2.5) % 90 + 5))}%`,
          background:
            velocity > 40
              ? 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.8) 20%, rgba(168, 85, 247, 0.9) 50%, rgba(0, 240, 255, 0.8) 80%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.6) 30%, rgba(168, 85, 247, 0.8) 50%, rgba(0, 240, 255, 0.6) 70%, transparent 100%)',
          boxShadow:
            velocity > 40
              ? '0 0 25px 4px rgba(239, 68, 68, 0.6), 0 0 10px 2px rgba(168, 85, 247, 0.8)'
              : '0 0 20px 3px rgba(0, 240, 255, 0.5), 0 0 10px 1px rgba(168, 85, 247, 0.5)',
        }}
      />

      {/* 2. Floating Live Scroll Velocity HUD Pill */}
      <div
        className={`pointer-events-none fixed bottom-6 left-6 z-40 px-3 py-1 rounded-full border border-cyan-500/40 bg-slate-950/90 text-cyan-300 text-[10px] font-mono shadow-neon-cyan/20 backdrop-blur-xl transition-all duration-300 flex items-center gap-2 ${
          isScrolling ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>WARP SPEED: {velocity * 12} PX/S</span>
        <span className="text-slate-600">|</span>
        <span className="text-purple-300">PARALLAX ON</span>
      </div>
    </>
  )
}
