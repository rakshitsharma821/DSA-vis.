import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Keyboard,
  Volume2,
  VolumeX,
  PauseCircle,
} from 'lucide-react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

export const PlaybackControls: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    soundMuted,
    autoPauseImportant,
    whyDisplayMode,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStep,
    reset,
    setSpeed,
    toggleSound,
    toggleAutoPause,
    setWhyDisplayMode,
  } = useAlgorithmStore();

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, reset, toggleSound]);

  // Interval-driven auto playback based on speed
  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 1000; // 1 second at 1x
    const intervalTime = Math.max(25, Math.floor(baseDelay / speed));

    const timer = setInterval(() => {
      stepForward();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, stepForward]);

  return (
    <div className="relative z-30 flex w-full select-none flex-col gap-2 border-t border-aurora-border bg-white px-3 py-2.5 shadow-[0_-8px_24px_-20px_rgba(23,37,84,0.35)] sm:px-4">
      {/* Progress scrubber */}
      <div className="flex w-full items-center gap-2.5 sm:gap-3">
        <span className="w-auto shrink-0 rounded-md bg-aurora-primary-soft px-2 py-0.5 font-mono text-[11px] font-bold text-aurora-primary">
          Step {currentStepIndex + 1}
          <span className="text-aurora-primary/50">/{totalSteps}</span>
        </span>
        <div className="relative flex-1">
          <Slider
            min={0}
            max={Math.max(0, totalSteps - 1)}
            step={1}
            value={[currentStepIndex]}
            onValueChange={([val]) => jumpToStep(val)}
            className="w-full cursor-pointer py-1"
            aria-label="Jump to step"
          />
        </div>
        <span className="w-9 shrink-0 text-right font-mono text-[11px] font-semibold text-aurora-muted">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Transport */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-aurora-border bg-white text-aurora-muted hover:bg-aurora-bg hover:text-aurora-text"
                  onClick={reset}
                  aria-label="Reset the trace"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to step 1 (R)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-aurora-border bg-white text-aurora-text hover:bg-aurora-bg disabled:opacity-40"
                  onClick={stepBackward}
                  disabled={currentStepIndex <= 0}
                  aria-label="Previous step"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step back (←)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-aurora-primary px-4 font-bold text-white shadow-[0_8px_18px_-10px_rgba(99,91,255,0.9)] transition-all hover:bg-aurora-primary-ink active:scale-[0.98]"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="ml-0.5 h-4 w-4 fill-current" />
                <span>{currentStepIndex >= totalSteps - 1 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </Button>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-aurora-border bg-white text-aurora-text hover:bg-aurora-bg disabled:opacity-40"
                  onClick={stepForward}
                  disabled={currentStepIndex >= totalSteps - 1}
                  aria-label="Next step"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step forward (→)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 cursor-pointer border border-aurora-primary/25 px-2 font-mono text-[10px] text-aurora-primary hover:bg-aurora-primary-soft xl:flex"
                  onClick={() => {
                    for (let i = currentStepIndex + 1; i < steps.length; i++) {
                      const st = steps[i];
                      const isBt =
                        (st.type as string) === 'backtrack' ||
                        st.reason?.action.toLowerCase().includes('backtrack') ||
                        st.reason?.rule.toLowerCase().includes('undo') ||
                        st.reason?.action.toLowerCase().includes('undo');
                      if (isBt) {
                        jumpToStep(i);
                        return;
                      }
                    }
                  }}
                  disabled={currentStepIndex >= totalSteps - 1}
                >
                  <span>Skip backtrack</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump forward to the next backtrack or undo phase</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 cursor-pointer border border-aurora-secondary/30 px-2 font-mono text-[10px] text-aurora-secondary hover:bg-aurora-secondary-soft xl:flex"
                  onClick={() => jumpToStep(totalSteps - 1)}
                  disabled={currentStepIndex >= totalSteps - 1}
                >
                  <span>Skip to solution</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump straight to the final step</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Display options */}
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 cursor-pointer rounded-lg border transition-all',
                    soundMuted
                      ? 'border-aurora-border text-aurora-muted/60 hover:text-aurora-text'
                      : 'border-aurora-secondary/30 bg-aurora-secondary-soft text-aurora-secondary'
                  )}
                  onClick={toggleSound}
                  aria-label={soundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
                >
                  {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{soundMuted ? 'Unmute sound (M)' : 'Mute sound (M)'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 cursor-pointer gap-1.5 rounded-lg border px-2.5 font-mono text-xs transition-all',
                    autoPauseImportant
                      ? 'border-aurora-accent/40 bg-aurora-accent-soft text-aurora-accent'
                      : 'border-aurora-border text-aurora-muted hover:text-aurora-text'
                  )}
                  onClick={toggleAutoPause}
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Auto-pause key steps</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pause automatically when an item is found, swapped, or rotated</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center rounded-lg border border-aurora-border bg-aurora-bg p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setWhyDisplayMode('beginner')}
              className={cn(
                'cursor-pointer rounded-md px-2 py-0.5 transition-colors',
                whyDisplayMode === 'beginner'
                  ? 'bg-white font-semibold text-aurora-primary shadow-sm'
                  : 'text-aurora-muted hover:text-aurora-text'
              )}
              title="Show the full reasoning for every step"
            >
              Why: all
            </button>
            <button
              onClick={() => setWhyDisplayMode('minimal')}
              className={cn(
                'cursor-pointer rounded-md px-2 py-0.5 transition-colors',
                whyDisplayMode === 'minimal'
                  ? 'bg-white font-semibold text-aurora-primary shadow-sm'
                  : 'text-aurora-muted hover:text-aurora-text'
              )}
              title="Show only the short justification"
            >
              Minimal
            </button>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-aurora-muted">
            <Gauge className="h-3.5 w-3.5 text-aurora-secondary" />
            <span className="hidden font-medium sm:inline">Speed</span>
            <span className="w-9 font-mono font-semibold text-aurora-text">{speed}x</span>
          </div>

          <div className="w-20 sm:w-28">
            <Slider
              min={0.25}
              max={20}
              step={0.25}
              value={[speed]}
              onValueChange={([val]) => setSpeed(val)}
              aria-label="Playback speed"
            />
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {[1, 2, 5, 20].map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 cursor-pointer rounded px-1.5 font-mono text-[11px]',
                  speed === s
                    ? 'bg-aurora-secondary-soft text-aurora-secondary'
                    : 'text-aurora-muted hover:text-aurora-text'
                )}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </Button>
            ))}
          </div>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden cursor-help items-center gap-1 rounded-md border border-aurora-border bg-aurora-bg px-2 py-1 text-[11px] text-aurora-muted lg:flex">
                  <Keyboard className="h-3.5 w-3.5 text-aurora-primary" />
                  <span>Shortcuts</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="space-y-1 border-aurora-border bg-white text-xs text-aurora-text">
                <div><strong>Space</strong>: play / pause</div>
                <div><strong>← / →</strong>: step back / forward</div>
                <div><strong>R</strong>: reset</div>
                <div><strong>M</strong>: toggle sound</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
