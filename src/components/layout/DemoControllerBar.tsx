import React from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { cn } from '../../utils/cn'

export const DemoControllerBar: React.FC = () => {
  const {
    currentStageIndex,
    currentStage,
    isPlaying,
    totalStages,
    nextStage,
    prevStage,
    startScenario,
    pauseScenario,
    resetScenario,
    setStageIndex,
  } = useDemoScenario()

  return (
    <div className="border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md px-4 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Scenario Header & Stage Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" />
              DEMO SCENARIO
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-100 truncate">
                {currentStage.title}
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                [{currentStage.timeStr}]
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {currentStage.subtitle}
            </p>
          </div>
        </div>

        {/* Stage Timeline Stepper Dots */}
        <div className="hidden xl:flex items-center gap-1">
          {Array.from({ length: totalStages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStageIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-200 focus:outline-none',
                idx === currentStageIndex
                  ? 'w-7 bg-cyan-400 shadow-cyan-glow-sm'
                  : idx < currentStageIndex
                  ? 'w-3.5 bg-slate-600 hover:bg-slate-500'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              )}
              title={`Jump to Stage ${idx}`}
              aria-label={`Jump to Stage ${idx}`}
            />
          ))}
        </div>

        {/* Live Metrics Pill & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={currentStage.compromiseProbability >= 80 ? 'critical' : currentStage.compromiseProbability >= 40 ? 'high' : 'healthy'}
            pulse={currentStage.compromiseProbability >= 50}
            className="text-[10px] font-mono"
          >
            {currentStage.compromiseProbability >= 80 ? (
              <Flame className="h-3 w-3 mr-1" />
            ) : (
              <ShieldCheck className="h-3 w-3 mr-1" />
            )}
            Risk: {currentStage.compromiseProbability}%
          </Badge>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStage}
              disabled={currentStageIndex === 0}
              className="h-7 w-7 p-0"
              title="Previous Stage"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {isPlaying ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={pauseScenario}
                className="h-7 px-2 text-xs gap-1"
                title="Pause Simulation"
              >
                <Pause className="h-3 w-3" />
                <span className="hidden sm:inline">Pause</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={currentStageIndex === totalStages - 1 ? startScenario : () => startScenario()}
                className="h-7 px-2.5 text-xs gap-1 font-semibold"
                title="Auto Play Simulation"
              >
                <Play className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">Simulate</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={nextStage}
              disabled={currentStageIndex === totalStages - 1}
              className="h-7 w-7 p-0"
              title="Next Stage"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetScenario}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
              title="Reset to Baseline"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
