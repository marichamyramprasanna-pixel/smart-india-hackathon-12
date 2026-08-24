import React, { useEffect, useState } from 'react'

export const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only enable on non-touch devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)

    // Check hover targets (buttons, links, inputs, cards)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovered(true)
      } else {
        setIsHovered(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Smooth lerp trailing animation
  useEffect(() => {
    let animationFrameId: number

    const updateTrailing = () => {
      setTrailingPos((prev) => {
        const dx = position.x - prev.x
        const dy = position.y - prev.y
        return {
          x: prev.x + dx * 0.22,
          y: prev.y + dy * 0.22,
        }
      })
      animationFrameId = requestAnimationFrame(updateTrailing)
    }

    animationFrameId = requestAnimationFrame(updateTrailing)
    return () => cancelAnimationFrame(animationFrameId)
  }, [position])

  if (!isVisible) return null

  return (
    <>
      {/* 1. Precise Laser Dot Target */}
      <div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicking ? '10px' : isHovered ? '6px' : '4px',
          height: isClicking ? '10px' : isHovered ? '6px' : '4px',
          backgroundColor: isClicking ? '#EF4444' : isHovered ? '#00F0FF' : '#38BDF8',
          boxShadow: isClicking
            ? '0 0 12px 3px rgba(239, 68, 68, 0.9)'
            : isHovered
            ? '0 0 12px 3px rgba(0, 240, 255, 0.9)'
            : '0 0 8px 2px rgba(56, 189, 248, 0.7)',
        }}
      />

      {/* 2. Fluid Cyber Reticle / Trailing Aura Ring */}
      <div
        className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150 ease-out"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isClicking ? '44px' : isHovered ? '36px' : '24px',
          height: isClicking ? '44px' : isHovered ? '36px' : '24px',
          borderColor: isClicking
            ? 'rgba(239, 68, 68, 0.8)'
            : isHovered
            ? 'rgba(0, 240, 255, 0.8)'
            : 'rgba(56, 189, 248, 0.35)',
          backgroundColor: isClicking
            ? 'rgba(239, 68, 68, 0.15)'
            : isHovered
            ? 'rgba(0, 240, 255, 0.12)'
            : 'rgba(6, 182, 212, 0.03)',
          boxShadow: isHovered
            ? '0 0 20px -2px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.2)'
            : '0 0 10px -2px rgba(56, 189, 248, 0.2)',
          backdropFilter: isHovered ? 'blur(1px)' : 'none',
        }}
      />
    </>
  )
}
