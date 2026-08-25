import React from 'react'
import { Mic, Volume2, VolumeX, MicOff, AlertCircle } from 'lucide-react'

interface VoiceWaveVisualizerProps {
  isListening: boolean
  isSpeaking: boolean
  transcript?: string
  error?: string | null
  onStopListening: () => void
  onStopSpeaking: () => void
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  isListening,
  isSpeaking,
  transcript,
  error,
  onStopListening,
  onStopSpeaking,
}) => {
  if (!isListening && !isSpeaking && !error) return null

  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-rose-950/80 border-t border-rose-500/40 text-rose-300 text-xs font-mono backdrop-blur-md animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span className="truncate">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-purple-950/90 border-t border-purple-500/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Pulsing Icon with Glow */}
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm ${
            isListening
              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 animate-pulse'
              : 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50'
          }`}
        >
          {isListening ? <Mic className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </div>

        {/* Dynamic Equalizer Bars Animation */}
        <div className="flex items-center gap-0.5 h-4">
          {[35, 75, 100, 60, 90, 45, 80, 50, 65, 85].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 sm:w-1 rounded-full ${
                isListening ? 'bg-rose-400 shadow-neon-red/50' : 'bg-cyan-400 shadow-neon-cyan/50'
              } animate-pulse`}
              style={{
                height: `${h}%`,
                animationDelay: `${i * 80}ms`,
                animationDuration: '550ms',
              }}
            />
          ))}
        </div>

        {/* State description */}
        <div className="truncate text-xs font-mono">
          <span className={isListening ? 'text-rose-300 font-semibold' : 'text-cyan-300 font-semibold'}>
            {isListening ? 'Listening (Speak into Mic)...' : 'Speaking Response...'}
          </span>
          {transcript && (
            <span className="text-slate-200 ml-2 italic text-[11px] truncate font-sans">
              "{transcript}"
            </span>
          )}
        </div>
      </div>

      {/* Action Stop / Mute Button */}
      <button
        type="button"
        onClick={isListening ? onStopListening : onStopSpeaking}
        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-colors shrink-0"
        title={isListening ? 'Stop Listening' : 'Stop Speaking'}
      >
        {isListening ? (
          <>
            <MicOff className="h-3 w-3 text-rose-400" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <VolumeX className="h-3 w-3 text-cyan-400" />
            <span>Mute</span>
          </>
        )}
      </button>
    </div>
  )
}
