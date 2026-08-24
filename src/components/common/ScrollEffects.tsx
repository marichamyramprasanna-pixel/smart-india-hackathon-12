import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export const ScrollEffects: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight
          if (totalHeight > 0) {
            const currentProgress = (window.scrollY / totalHeight) * 100
            setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
          }
          setShowBackToTop(window.scrollY > 280)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* 1. Glowing Neon Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-slate-900/40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 transition-all duration-75 ease-out shadow-neon-cyan"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Cyber 'Back to Top' Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 p-2.5 rounded-xl border border-cyan-500/40 bg-slate-950/90 text-cyan-300 shadow-neon-cyan/30 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-cyan-400 hover:text-white active:scale-95 flex items-center justify-center ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
        title="Scroll to top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </>
  )
}
