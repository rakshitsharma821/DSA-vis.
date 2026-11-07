import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepAction } from '../../types';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import {
  Sparkles,
  ChevronDown,
  Bot,
  Scale,
  ArrowRightLeft,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface WhyPopupProps {
  step: StepAction;
  onAskAI?: (stepReason: string) => void;
  // Optional anchor reference or target index
  activeAnchorIndex?: number | null;
}

export const WhyPopup: React.FC<WhyPopupProps> = ({ step, onAskAI }) => {
  const { isPlaying, speed, whyDisplayMode } = useAlgorithmStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  const reason = step.reason;
  const stepType = step.type;

  // In Minimal mode, only show why popups on key decision steps
  const isKeyStep = ['compare', 'swap', 'found', 'discard', 'rotate', 'mismatch', 'complete'].includes(stepType);
  const shouldRender = whyDisplayMode === 'beginner' || isKeyStep;

  // Duration in play mode scales with speed
  useEffect(() => {
    setVisible(true);
    setIsExpanded(false);

    if (isPlaying) {
      // In fast play, show briefly then fade
      const displayMs = Math.max(900, 2200 / speed);
      const timer = setTimeout(() => {
        if (isPlaying) {
          setVisible(false);
        }
      }, displayMs);
      return () => clearTimeout(timer);
    }
  }, [step, isPlaying, speed]);

  if (!shouldRender || !visible || !reason) {
    return null;
  }

  // Light Aurora styling per step type: colour, border and soft gradient
  const getTypeConfig = () => {
    switch (stepType) {
      case 'compare':
        return {
          icon: Scale,
          color: 'text-amber-600',
          border: 'border-amber-200',
          bg: 'from-amber-50 to-white',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'swap':
        return {
          icon: ArrowRightLeft,
          color: 'text-fuchsia-600',
          border: 'border-fuchsia-200',
          bg: 'from-fuchsia-50 to-white',
          badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        };
      case 'found':
      case 'sorted':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600',
          border: 'border-emerald-200',
          bg: 'from-emerald-50 to-white',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'discard':
        return {
          icon: Trash2,
          color: 'text-slate-600',
          border: 'border-slate-200',
          bg: 'from-slate-50 to-white',
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      case 'mismatch':
        return {
          icon: ShieldAlert,
          color: 'text-rose-600',
          border: 'border-rose-200',
          bg: 'from-rose-50 to-white',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'backtrack':
        return {
          icon: ShieldAlert,
          color: 'text-violet-600',
          border: 'border-violet-200',
          bg: 'from-violet-50 to-white',
          badge: 'bg-violet-50 text-violet-700 border-violet-200',
        };
      case 'pointer':
        return {
          icon: ArrowRight,
          color: 'text-cyan-600',
          border: 'border-cyan-200',
          bg: 'from-cyan-50 to-white',
          badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      default:
        return {
          icon: Sparkles,
          color: 'text-indigo-600',
          border: 'border-indigo-200',
          bg: 'from-indigo-50 to-white',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="relative z-20 mx-auto my-2 w-full max-w-xl select-none">
      {/* Hidden ARIA announcer for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {reason.action}: {reason.why} Triggered by rule {reason.rule}.
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${stepType}-${step.codeLine}-${reason.action}`}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={cn(
            'relative overflow-hidden rounded-xl border bg-gradient-to-b p-3.5 shadow-aurora-md',
            config.bg,
            config.border
          )}
        >
          {/* Subtle pointer anchor arrow */}
          <div className="absolute -top-1.5 left-8 h-3 w-3 rotate-45 border-l border-t border-inherit bg-white" />

          {/* Top Row: Action Chip + Condition Rule Badge */}
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
              <span className={cn('rounded border px-2 py-0.5 font-mono text-[11px] font-semibold', config.badge)}>
                {reason.action}
              </span>
            </div>

            <div className="flex items-center gap-1 rounded border border-aurora-border bg-white/80 px-2 py-0.5 font-mono text-[10px] text-aurora-muted">
              <span className="text-aurora-muted/70">Rule:</span>
              <span className="font-medium text-aurora-text">{reason.rule}</span>
            </div>
          </div>

          {/* Reason in a plain sentence with real values */}
          <p className="mb-2 text-xs font-medium leading-snug tracking-tight text-aurora-text sm:text-sm">
            {reason.why}
          </p>

          {/* Bottom Bar: "More why" expander + "Ask AI about this step" button */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-aurora-border/80 pt-1">
            {reason.details ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex cursor-pointer items-center gap-1 text-[11px] text-aurora-muted transition-colors hover:text-aurora-primary"
              >
                <span>{isExpanded ? 'Less' : 'More why'}</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 text-aurora-muted/70 transition-transform group-hover:text-aurora-primary',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
            ) : (
              <span />
            )}

            {onAskAI && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 cursor-pointer gap-1 px-2 font-mono text-[10px] text-aurora-primary hover:bg-aurora-primary-soft hover:text-aurora-primary-ink"
                onClick={() => onAskAI(`Explain step: ${reason.action}. Why: ${reason.why} (Rule: ${reason.rule})`)}
              >
                <Bot className="h-3 w-3" />
                <span>Ask AI about this step</span>
              </Button>
            )}
          </div>

          {/* Deeper intuition expanded view */}
          <AnimatePresence>
            {isExpanded && reason.details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-2 overflow-hidden border-t border-aurora-border/80 pt-2"
              >
                <p className="rounded-lg border border-aurora-border bg-white/80 p-2 font-mono text-[11px] leading-relaxed text-aurora-muted">
                  {reason.details}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
