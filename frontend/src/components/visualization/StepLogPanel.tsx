import React, { useRef, useEffect } from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { StepAction } from '../../types';
import { History, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StepLogPanel: React.FC = () => {
  const { steps, currentStepIndex, jumpToStep } = useAlgorithmStore();
  const activeStepRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active step
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStepIndex]);

  return (
    <div className="flex h-full select-none flex-col overflow-hidden rounded-xl border border-aurora-border bg-white shadow-aurora-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-aurora-border bg-aurora-bg px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-aurora-primary" />
          <span className="text-xs font-semibold text-aurora-text">Step log</span>
        </div>
        <span className="rounded border border-aurora-primary/20 bg-aurora-primary-soft px-2 py-0.5 font-mono text-[10px] font-bold text-aurora-primary">
          Step {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        <p className="px-1 pb-1 text-[10px] leading-relaxed text-aurora-muted">
          Click any row to jump to that step. Passed steps are dimmed.
        </p>
        {steps.map((step: StepAction, idx: number) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          const reason = step.reason;

          return (
            <div
              key={idx}
              ref={isActive ? activeStepRef : null}
              onClick={() => jumpToStep(idx)}
              className={cn(
                'group mb-1.5 flex cursor-pointer items-start gap-2.5 rounded-lg border p-2 text-xs transition-all',
                isActive
                  ? 'border-aurora-primary bg-aurora-primary-soft font-semibold text-aurora-text shadow-aurora-sm'
                  : isPassed
                    ? 'border-aurora-border/60 bg-aurora-bg/60 text-aurora-muted hover:bg-aurora-bg hover:text-aurora-text'
                    : 'border-transparent bg-white text-aurora-muted/70 hover:bg-aurora-bg hover:text-aurora-text'
              )}
            >
              {/* Step number badge */}
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold',
                  isActive
                    ? 'border-aurora-primary bg-aurora-primary text-white'
                    : 'border-aurora-border bg-aurora-bg text-aurora-muted'
                )}
              >
                {idx + 1}
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'truncate font-mono text-[10px] font-medium',
                      isActive ? 'text-aurora-primary' : 'text-aurora-muted'
                    )}
                  >
                    {reason?.action || step.type.toUpperCase()}
                  </span>
                  {reason?.rule && (
                    <span className="max-w-[120px] truncate rounded border border-aurora-border/60 bg-white px-1 py-0.2 font-mono text-[9px] text-aurora-muted">
                      {reason.rule}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 font-mono text-[11px] leading-tight text-aurora-text/90">
                  {reason?.why || step.message}
                </p>
              </div>

              {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 self-center text-aurora-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
