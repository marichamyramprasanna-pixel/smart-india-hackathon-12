import React, { useEffect, useRef } from 'react'

export const CyberCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if device is touch-only
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let isHovered = false
    let isClicking = false
    let isVisible = false
    let animationFrameId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) {
        isVisible = true
        if (dotRef.current) dotRef.current.style.opacity = '1'
        if (ringRef.current) ringRef.current.style.opacity = '1'
      }

      // Check if hovering over clickable targets
      const target = e.target as HTMLElement | null
      if (target) {
        const clickable = target.closest(
          'button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-interactive]'
        )
        isHovered = Boolean(clickable)
      }
    }

    const onMouseDown = () => {
      isClicking = true
    }

    const onMouseUp = () => {
      isClicking = false
    }

    const onMouseLeave = () => {
      isVisible = false
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }

    const onMouseEnter = () => {
      isVisible = true
      if (dotRef.current) dotRef.current.style.opacity = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    // High-performance GPU render loop (Zero React re-renders)
    const renderLoop = () => {
      // Spring interpolation for smooth trailing
      ringX += (mouseX - ringX) * 0.2
      ringY += (mouseY - ringY) * 0.2

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${
          isClicking ? 1.6 : isHovered ? 1.3 : 1
        })`
        dotRef.current.style.backgroundColor = isClicking ? '#EF4444' : isHovered ? '#00F0FF' : '#38BDF8'
        dotRef.current.style.boxShadow = isClicking
          ? '0 0 10px 2px rgba(239, 68, 68, 0.9)'
          : isHovered
          ? '0 0 12px 3px rgba(0, 240, 255, 0.9)'
          : '0 0 8px 2px rgba(56, 189, 248, 0.6)'
      }

      if (ringRef.current) {
        const ringScale = isClicking ? 1.4 : isHovered ? 1.35 : 1
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`
        ringRef.current.style.borderColor = isClicking
          ? 'rgba(239, 68, 68, 0.85)'
          : isHovered
          ? 'rgba(0, 240, 255, 0.85)'
          : 'rgba(56, 189, 248, 0.35)'
        ringRef.current.style.backgroundColor = isClicking
          ? 'rgba(239, 68, 68, 0.12)'
          : isHovered
          ? 'rgba(0, 240, 255, 0.1)'
          : 'transparent'
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mouseenter', onMouseEnter)

    animationFrameId = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none" aria-hidden="true">
      {/* 1. Precision Center Laser Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0 will-change-transform"
        style={{
          transition: 'opacity 0.2s ease, background-color 0.15s ease, box-shadow 0.15s ease',
        }}
      />

      {/* 2. Fluid Cyber Reticle Aura Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 h-6 w-6 rounded-full border border-cyan-400/40 opacity-0 will-change-transform"
        style={{
          transition: 'opacity 0.2s ease, border-color 0.15s ease, background-color 0.15s ease',
          boxShadow: '0 0 12px -2px rgba(0, 240, 255, 0.35)',
        }}
      />
    </div>
  )
}
