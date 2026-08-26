/**
 * FUTURISTIC CYBER AUDIO SYNTHESIZER SERVICE
 * Generates custom diagnostic synthesized chimes using Web Audio API.
 * Adheres to browser auto-play policies.
 */

let isMuted = false

export function toggleAudioMute(): boolean {
  isMuted = !isMuted
  try {
    localStorage.setItem('sentinelx_audio_muted', isMuted ? 'true' : 'false')
  } catch {}
  return isMuted
}

export function isAudioMuted(): boolean {
  try {
    const val = localStorage.getItem('sentinelx_audio_muted')
    if (val !== null) return val === 'true'
  } catch {}
  return isMuted
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return null
  return new AudioCtx()
}

export const cyberAudioService = {
  /**
   * Quick futuristic click/hover tick
   */
  playTick() {
    if (isAudioMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.06)
  },

  /**
   * Soft transition slide chime
   */
  playChime() {
    if (isAudioMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659.25, now) // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2) // C6

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start()
    osc2.start()
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.25)
  },

  /**
   * Heavy mechanical security shut (quarantine)
   */
  playQuarantine() {
    if (isAudioMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const noise = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.linearRampToValueAtTime(40, now + 0.4)

    noise.type = 'triangle'
    noise.frequency.setValueAtTime(90, now)
    noise.frequency.exponentialRampToValueAtTime(30, now + 0.3)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    noise.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    noise.start()
    osc.stop(now + 0.45)
    noise.stop(now + 0.45)
  },

  /**
   * Uplifting restoration chime
   */
  playRestore() {
    if (isAudioMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(330, now)
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.25)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.3)
  },

  /**
   * Warning alarm / critical threat siren
   */
  playAlarm() {
    if (isAudioMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.linearRampToValueAtTime(800, now + 0.15)
    osc.frequency.linearRampToValueAtTime(600, now + 0.3)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.linearRampToValueAtTime(0.05, now + 0.25)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(now + 0.35)
  },
}
