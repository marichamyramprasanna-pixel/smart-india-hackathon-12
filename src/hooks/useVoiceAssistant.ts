import { useState, useEffect, useRef, useCallback } from 'react'

export interface VoiceAssistantState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  isSupported: boolean
  autoSpeak: boolean
  hasMicPermission: boolean | null
  error: string | null
  startListening: () => void
  stopListening: () => void
  speakText: (text: string) => void
  stopSpeaking: () => void
  toggleAutoSpeak: () => void
}

// Clean markdown syntax for crisp, natural voice reading
function cleanMarkdownForSpeech(md: string): string {
  return md
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[-*•]\s+/g, '')
    .replace(/[>_~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Play futuristic cyber audio feedback chimes
function playCyberChime(type: 'start' | 'stop' | 'success') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    if (type === 'start') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'stop') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(780, now)
      osc.frequency.exponentialRampToValueAtTime(390, now + 0.12)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'success') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.setValueAtTime(660, now + 0.08)
      osc.frequency.setValueAtTime(990, now + 0.16)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export function useVoiceAssistant(onTranscriptComplete?: (text: string) => void): VoiceAssistantState {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem('sentinelx_voice_autospeak') === 'true'
  })
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const transcriptBufferRef = useRef<string>('')
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([])

  // Load and cache voices
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasSpeechRecognition =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const hasSpeechSynthesis = 'speechSynthesis' in window

    setIsSupported(hasSpeechRecognition || hasSpeechSynthesis)

    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis

      const updateVoices = () => {
        if (!synthRef.current) return
        const available = synthRef.current.getVoices()
        if (available && available.length > 0) {
          voicesRef.current = available
        }
      }

      updateVoices()
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = updateVoices
      }
    }

    return () => {
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current)
      if (synthRef.current) synthRef.current.cancel()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
      }
    }
  }, [])

  // Initialize Speech Recognition instance
  const initRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return null

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setHasMicPermission(true)
        setError(null)
        playCyberChime('start')
      }

      recognition.onresult = (event: any) => {
        let currentText = ''
        let isFinalResult = false

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          currentText += item[0].transcript
          if (item.isFinal) isFinalResult = true
        }

        transcriptBufferRef.current = currentText
        setTranscript(currentText)

        if (isFinalResult && currentText.trim()) {
          playCyberChime('success')
          if (onTranscriptComplete) {
            onTranscriptComplete(currentText.trim())
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.warn('[Voice Assistant] Speech Recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setHasMicPermission(false)
          setError('Microphone access denied. Please allow microphone permissions in your browser.')
        } else if (event.error === 'no-speech') {
          // User didn't speak in time
        } else {
          setError(`Voice input notice: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        playCyberChime('stop')
        const finalBuff = transcriptBufferRef.current.trim()
        if (finalBuff && onTranscriptComplete) {
          // In case isFinal did not trigger before end
          onTranscriptComplete(finalBuff)
          transcriptBufferRef.current = ''
        }
      }

      return recognition
    } catch (err) {
      console.warn('[Voice Assistant] Failed creating recognition instance:', err)
      return null
    }
  }, [onTranscriptComplete])

  const stopSpeaking = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current)
      keepAliveTimerRef.current = null
    }
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
    activeUtterancesRef.current = []
  }, [])

  const startListening = useCallback(() => {
    stopSpeaking()
    setError(null)
    setTranscript('')
    transcriptBufferRef.current = ''

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {}
      }
      const instance = initRecognition()
      if (instance) {
        recognitionRef.current = instance
        instance.start()
      } else {
        setError('Speech Recognition is not supported by your current browser. Please try Chrome or Edge.')
      }
    } catch (err: any) {
      console.warn('[Voice Assistant] startListening exception:', err)
      setError(err?.message || 'Could not start microphone')
    }
  }, [initRecognition, stopSpeaking])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
    }
    setIsListening(false)
  }, [])

  const speakText = useCallback(
    (rawText: string) => {
      if (!synthRef.current) return
      stopSpeaking()

      const cleaned = cleanMarkdownForSpeech(rawText)
      if (!cleaned) return

      // Chrome speech synthesis resume hack (keeps speech engine alive)
      synthRef.current.cancel()
      synthRef.current.resume()

      // Split into concise sentences to avoid Chromium 15-second speech stall
      const sentences = cleaned.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleaned]
      const queue: SpeechSynthesisUtterance[] = []

      // Pick best English voice
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synthRef.current.getVoices()
      const preferredVoice =
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        voices.find((v) => (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('David')) && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0]

      sentences.forEach((sentence, index) => {
        const textChunk = sentence.trim()
        if (!textChunk) return

        const utterance = new SpeechSynthesisUtterance(textChunk)
        utterance.rate = 1.04
        utterance.pitch = 1.0
        utterance.lang = 'en-US'

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        if (index === 0) {
          utterance.onstart = () => {
            setIsSpeaking(true)
          }
        }

        if (index === sentences.length - 1) {
          utterance.onend = () => {
            setIsSpeaking(false)
            if (keepAliveTimerRef.current) {
              clearInterval(keepAliveTimerRef.current)
              keepAliveTimerRef.current = null
            }
          }
          utterance.onerror = () => {
            setIsSpeaking(false)
            if (keepAliveTimerRef.current) {
              clearInterval(keepAliveTimerRef.current)
              keepAliveTimerRef.current = null
            }
          }
        }

        queue.push(utterance)
      })

      // Prevent garbage collection bug in Chrome
      activeUtterancesRef.current = queue
      ;(window as any)._sentinelActiveUtterances = queue

      // Keep-alive timer for Chromium
      keepAliveTimerRef.current = setInterval(() => {
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.pause()
          synthRef.current.resume()
        } else {
          if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current)
        }
      }, 10000)

      queue.forEach((u) => {
        if (synthRef.current) synthRef.current.speak(u)
      })
    },
    [stopSpeaking]
  )

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      const next = !prev
      localStorage.setItem('sentinelx_voice_autospeak', String(next))
      if (!next) {
        stopSpeaking()
      } else {
        // Test chime
        playCyberChime('success')
      }
      return next
    })
  }, [stopSpeaking])

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    autoSpeak,
    hasMicPermission,
    error,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleAutoSpeak,
  }
}
