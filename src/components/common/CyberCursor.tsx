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
        if (dotRef.current) dotRef.current.style.opacity = '0.6'
        if (ringRef.current) ringRef.current.style.opacity = '0.3'
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
      if (dotRef.current) dotRef.current.style.opacity = '0.6'
      if (ringRef.current) ringRef.current.style.opacity = '0.3'
    }

    // High-performance GPU render loop with reduced subtlety
    const renderLoop = () => {
      // Spring interpolation for smooth trailing
      ringX += (mouseX - ringX) * 0.25
      ringY += (mouseY - ringY) * 0.25

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${
          isClicking ? 1.2 : isHovered ? 1.15 : 1
        })`
        dotRef.current.style.backgroundColor = isClicking ? '#EF4444' : isHovered ? '#00F0FF' : '#38BDF8'
        dotRef.current.style.boxShadow = isHovered
          ? '0 0 6px 1px rgba(0, 240, 255, 0.4)'
          : '0 0 3px 0.5px rgba(56, 189, 248, 0.3)'
      }

      if (ringRef.current) {
        const ringScale = isClicking ? 1.15 : isHovered ? 1.2 : 1
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`
        ringRef.current.style.borderColor = isClicking
          ? 'rgba(239, 68, 68, 0.4)'
          : isHovered
          ? 'rgba(0, 240, 255, 0.35)'
          : 'rgba(56, 189, 248, 0.15)'
        ringRef.current.style.backgroundColor = isClicking
          ? 'rgba(239, 68, 68, 0.04)'
          : isHovered
          ? 'rgba(0, 240, 255, 0.03)'
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
      {/* 1. Subtle Precision Micro-Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 h-1 w-1 rounded-full opacity-0 will-change-transform"
        style={{
          transition: 'opacity 0.2s ease, background-color 0.15s ease, box-shadow 0.15s ease',
        }}
      />

      {/* 2. Soft Faint Micro-Aura Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full border border-cyan-400/20 opacity-0 will-change-transform"
        style={{
          transition: 'opacity 0.2s ease, border-color 0.15s ease, background-color 0.15s ease',
          boxShadow: '0 0 6px -1px rgba(0, 240, 255, 0.15)',
        }}
      />
    </div>
  )
}
