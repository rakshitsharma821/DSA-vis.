import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Compass,
  Layers,
  ArrowRight,
  HelpCircle,
  Sliders,
  Terminal,
  Grid,
  Network,
  CheckCircle2,
  Clock,
  Zap,
  Code2,
  BookOpen,
  Lock,
  User,
  Shield,
} from 'lucide-react';
import { categories, fullCatalog } from '../algorithms/registry';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { NavView } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  slidingWindowSteps,
  dpKnapsackSteps,
  avlTreeSteps,
  dijkstraSteps,
  ObservatoryStep,
} from '../data/observatorySteps';

interface HomePageProps {
  onNavigate: (view: NavView) => void;
  onOpenCommandPalette: () => void;
}

type ParadigmTab = 'pointer' | 'dp' | 'tree' | 'graph';

const paradigmMap: Record<ParadigmTab, { name: string; algoId: string; steps: ObservatoryStep[] }> = {
  pointer: { name: 'Sliding Window', algoId: 'sliding-window-max', steps: slidingWindowSteps },
  dp: { name: 'DP Matrix (0/1 Knapsack)', algoId: 'knapsack-01-table', steps: dpKnapsackSteps },
  tree: { name: 'Balanced AVL Tree', algoId: 'avl-tree-rotations', steps: avlTreeSteps },
  graph: { name: 'Dijkstra Shortest Path', algoId: 'dijkstra-shortest', steps: dijkstraSteps },
};

/** Valid catalog ids used by the home topic shortcuts. */
const HOME_FEATURED: Record<string, string> = {
  arrays: 'two-pointers-sum',
  strings: 'palindrome-check',
  'linked-list': 'linked-list-reversal',
  stack: 'stack-operations',
  trees: 'tree-traversals-all',
  graphs: 'graph-bfs-dfs',
  recursion: 'tower-of-hanoi',
  searching: 'binary-search',
  sorting: 'bubble-sort',
  dp: 'knapsack-01-table',
};

/**
 * Centered lock card rendered over the blurred preview. It is the only
 * interactive layer while the preview is gated, so it sits outside the
 * `inert` subtree and stays fully keyboard reachable.
 */
const PreviewLockCard: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
  <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/70 bg-white/85 px-6 py-7 text-center shadow-aurora-md backdrop-blur-xl sm:px-8">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-primary-soft text-aurora-primary ring-1 ring-aurora-primary/25 shadow-[0_0_30px_rgba(99,91,255,0.45)]">
      <Lock className="h-6 w-6" strokeWidth={2.2} />
    </span>
    <h3 className="mt-4 font-heading text-xl font-extrabold tracking-tight text-aurora-text sm:text-2xl">
      Unlock Interactive Learning
    </h3>
    <p className="mx-auto mt-2.5 max-w-sm text-[13px] leading-relaxed text-aurora-muted">
      Sign in to explore step-by-step algorithm visualizations, understand code
      execution and interact with every learning tool.
    </p>
    <button
      type="button"
      onClick={onSignIn}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-aurora-primary px-6 py-3 font-label-md text-sm font-bold text-white shadow-[0_14px_28px_-14px_rgba(99,91,255,0.95)] transition-all hover:bg-aurora-primary-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <Lock className="h-4 w-4" />
      <span>Sign In to Explore</span>
    </button>
    <button
      type="button"
      onClick={onSignIn}
      className="mt-3 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-aurora-primary-ink transition-colors hover:text-aurora-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      Create your free account
    </button>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenCommandPalette,
}) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [activeParadigm, setActiveParadigm] = useState<ParadigmTab>('pointer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(4); // Default to Peak step of Sliding Window
  const { setAlgorithm } = useAlgorithmStore();

  const handleProtectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginModal('user');
      return;
    }
    action();
  };

  const currentConfig = paradigmMap[activeParadigm];
  const currentSteps = currentConfig.steps;
  const safeStepIndex = Math.min(stepIndex, currentSteps.length - 1);
  const currentStep = currentSteps[safeStepIndex];

  // Playback timer for the active paradigm showcase
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= currentSteps.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [isPlaying, currentSteps.length]);

  const handleSwitchParadigm = (tab: ParadigmTab) => {
    setActiveParadigm(tab);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleLaunchTopic = (algoId: string) => {
    setAlgorithm(algoId);
    onNavigate('visualizer');
  };

  /*
   * Live Visualizer Preview is a premium, sign-in gated surface.
   * The frosted overlay is a *visual* restriction only, so the underlying
   * subtree also gets the native `inert` attribute: that removes it from the
   * tab order and blocks pointer/keyboard interaction while it stays visible.
   * Auth state still comes from the existing AuthContext — there is no local
   * or fake login flag here.
   */
  const previewStageRef = useRef<HTMLDivElement>(null);
  const previewLocked = !isAuthenticated;

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage) return;
    if (previewLocked) {
      stage.setAttribute('inert', '');
    } else {
      stage.removeAttribute('inert');
    }
  }, [previewLocked]);

  return (
    <div className="relative w-full overflow-hidden min-h-screen bg-aurora-bg text-aurora-text font-body-md select-none">
      {/* Soft Aurora atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-aurora-primary/8 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-[28rem] h-80 w-80 rounded-full bg-aurora-secondary/8 blur-[100px]" />

      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-8 pt-12 pb-16">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-aurora-sm mb-6 border border-aurora-border">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-aurora-secondary animate-pulse" />
            <span className="font-code-sm text-xs text-aurora-secondary uppercase font-bold tracking-wider">
              Aurora Learning
            </span>
            <span className="text-aurora-border">•</span>
            <span className="font-label-md text-xs text-aurora-muted font-medium">
              Interactive DSA, explained step by step
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-aurora-text max-w-4xl text-balance leading-tight">
            See every step.{' '}
            <br className="hidden sm:inline" />
            <span className="text-aurora-primary">
              Understand every decision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-base sm:text-lg text-aurora-muted max-w-3xl mt-4 text-balance">
            AlgoViz turns data structures and algorithms into a slow, inspectable trace.
            Follow the pointer, read the reason, and build a mental model you can reuse
            in interviews and exams.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={() => handleProtectedAction(() => onNavigate('topics'))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-aurora-primary text-white rounded-xl font-label-lg text-sm font-bold shadow-[0_14px_30px_-14px_rgba(99,91,255,0.9)] hover:bg-aurora-primary-ink active:scale-[0.98] transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Start learning</span>
            </button>
            <button
              onClick={() => handleProtectedAction(() => onNavigate('solver'))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-aurora-text rounded-xl font-label-lg text-sm font-bold shadow-aurora-sm hover:border-aurora-primary/30 hover:text-aurora-primary border border-aurora-border active:scale-[0.98] transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-aurora-primary" />
              <span>Solve a problem</span>
            </button>
            <button
              onClick={() => handleProtectedAction(() => onNavigate('compare'))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-aurora-text rounded-xl font-label-lg text-sm font-bold shadow-aurora-sm hover:border-aurora-primary/30 hover:text-aurora-primary border border-aurora-border active:scale-[0.98] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-aurora-accent" />
              <span>Compare approaches</span>
            </button>
          </div>

          {/* Stats Strip — derived from the real catalog */}
          <div className="w-full max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/80 backdrop-blur-md rounded-2xl p-2.5 shadow-aurora-sm border border-aurora-border">
            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-aurora-bg">
              <span className="font-headline-lg text-2xl font-black text-aurora-primary">{categories.length}</span>
              <span className="font-label-md text-xs text-aurora-muted">Curriculum topics</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-aurora-bg">
              <span className="font-headline-lg text-2xl font-black text-aurora-secondary">{fullCatalog.length}</span>
              <span className="font-label-md text-xs text-aurora-muted">Guided visualizers</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-aurora-bg">
              <span className="font-headline-lg text-2xl font-black text-aurora-primary">{categories.filter((c) => c.part === 'ds').length}</span>
              <span className="font-label-md text-xs text-aurora-muted">Structure topics</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-aurora-bg">
              <span className="font-headline-lg text-2xl font-black text-aurora-accent">{categories.filter((c) => c.part === 'algo').length}</span>
              <span className="font-label-md text-xs text-aurora-muted">Algorithm families</span>
            </div>
          </div>

          {/* Dedicated Sign In Portal Gateway - Visible when not logged in */}
          {!isAuthenticated && (
            <div className="w-full max-w-4xl mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-aurora-border shadow-aurora-md text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aurora-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-primary-soft text-aurora-primary font-code-sm text-xs font-bold uppercase tracking-wider mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign in to start</span>
                  </div>
                  <h2 className="font-display-lg text-2xl font-extrabold text-aurora-text">
                    Your AlgoViz learning space
                  </h2>
                  <p className="font-body-sm text-xs sm:text-sm text-aurora-muted mt-1">
                    Sign in to open {fullCatalog.length} step-by-step visualizers,
                    Compare &amp; Learn, Contests, and the AI problem solver.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Student Portal Card */}
                <div
                  onClick={() => openLoginModal('user')}
                  className="p-5 rounded-2xl bg-aurora-bg border border-aurora-border hover:border-aurora-primary/40 hover:shadow-aurora-sm transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-aurora-primary-soft text-aurora-primary flex items-center justify-center mb-3">
                      <User className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-aurora-text group-hover:text-aurora-primary transition-colors">
                      Student sign in
                    </h3>
                    <p className="font-body-sm text-xs text-aurora-muted mt-1.5 leading-relaxed">
                      Use your college ID and password, or register with your college
                      email OTP. Your session keeps the last algorithm you opened.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-aurora-primary text-white font-label-md text-xs font-bold shadow-sm flex items-center justify-center gap-2 group-hover:bg-aurora-primary-ink"
                  >
                    <span>Sign in as student</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Faculty & Admin Portal Card */}
                <div
                  onClick={() => openLoginModal('admin')}
                  className="p-5 rounded-2xl bg-aurora-bg border border-aurora-border hover:border-aurora-secondary/40 hover:shadow-aurora-sm transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-aurora-secondary-soft text-aurora-secondary flex items-center justify-center mb-3">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-aurora-text group-hover:text-aurora-secondary transition-colors">
                      Faculty &amp; admin sign in
                    </h3>
                    <p className="font-body-sm text-xs text-aurora-muted mt-1.5 leading-relaxed">
                      Administrator access for student registrations, class sections,
                      and the management console.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-aurora-secondary hover:bg-[#159c8e] text-white font-label-md text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Sign in as admin</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HERO PREVIEW SHOWCASE: Multi-Paradigm Interactive Observatory */}
          <div className="w-full max-w-5xl mt-12 bg-white rounded-3xl shadow-aurora-md border border-aurora-border overflow-hidden text-left flex flex-col">
            {/* Top Control Header & Algorithm Selector */}
            <div className="w-full border-b border-aurora-border bg-aurora-bg px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-aurora-secondary" />
                <span className="font-code-sm text-xs font-bold uppercase tracking-wider text-aurora-primary">
                  Live visualizer preview
                </span>
                <span className="text-aurora-border hidden sm:inline">•</span>
                <span className="font-body-sm text-xs text-aurora-muted hidden sm:inline">
                  Choose an algorithm — sign in to run it interactively
                </span>
              </div>

              {/* Algorithm selector: one clean horizontal row, scrolls on small screens */}
              <div
                role="group"
                aria-label="Choose the algorithm shown in the preview"
                className="mt-3.5 flex w-full min-w-0 items-center gap-2.5 overflow-x-auto pb-1 sm:justify-between sm:pb-0"
              >
                {(['pointer', 'dp', 'tree', 'graph'] as const).map((tab) => {
                  const info = paradigmMap[tab];
                  const isActive = activeParadigm === tab;
                  const TabIcon =
                    tab === 'pointer'
                      ? Sliders
                      : tab === 'dp'
                        ? Grid
                        : tab === 'tree'
                          ? Network
                          : Compass;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleSwitchParadigm(tab)}
                      aria-pressed={isActive}
                      className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 font-label-md text-[13px] font-bold transition-all duration-200 active:scale-[0.97] ${
                        isActive
                          ? 'border-aurora-primary bg-aurora-primary text-white shadow-[0_12px_24px_-14px_rgba(99,91,255,0.95)]'
                          : 'border-aurora-border bg-white text-aurora-text shadow-aurora-sm hover:-translate-y-px hover:border-aurora-primary/40 hover:bg-aurora-primary-soft hover:text-aurora-primary-ink'
                      }`}
                    >
                      <TabIcon
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-aurora-primary'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{info.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observatory Stage Body — frosted + locked for signed-out visitors */}
            <div className="relative">
              <div
                ref={previewStageRef}
                aria-hidden={previewLocked ? true : undefined}
                className="p-4 sm:p-6 lg:p-7 relative min-h-[440px] flex flex-col justify-between bg-aurora-bg/40"
              >
              <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                {/* LEFT: INTERACTIVE ALGORITHM CANVAS */}
                <div className="flex-1 min-w-0 flex flex-col justify-between bg-white rounded-2xl p-4 sm:p-5 shadow-aurora-sm border border-aurora-border">
                  {/* Visual Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-aurora-border">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-sm sm:text-base font-bold text-aurora-text">
                        {currentStep.title}
                      </span>
                      <span className="font-code-sm text-xs px-2.5 py-0.5 bg-aurora-primary-soft text-aurora-primary-ink border border-aurora-primary/25 rounded-md font-semibold">
                        {currentStep.badge}
                      </span>
                    </div>
                    <span className="font-code-sm text-xs font-bold text-aurora-secondary-ink bg-aurora-secondary-soft border border-aurora-secondary/25 px-2.5 py-0.5 rounded-full">
                      {currentStep.metric}
                    </span>
                  </div>

                  {/* 1. SLIDING WINDOW CANVAS */}
                  {activeParadigm === 'pointer' && (
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-8 max-w-full px-2">
                        {currentStep.data.array.map((num: number, idx: number) => {
                          const inWindow = idx >= currentStep.data.windowStart && idx <= currentStep.data.windowEnd;
                          const isL = idx === currentStep.data.windowStart;
                          const isR = idx === currentStep.data.windowEnd;
                          const isIncoming = currentStep.data.incoming === num && isR;
                          const isOutgoing = currentStep.data.outgoing === num && idx === currentStep.data.windowStart - 1;

                          return (
                            <div key={idx} className="flex flex-col items-center relative select-none">
                              {/* Left Pointer Pill */}
                              {isL && (
                                <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-aurora-secondary-ink text-white font-code-sm text-[10px] font-extrabold shadow-md animate-bounce">
                                  L
                                </span>
                              )}
                              {/* Right Pointer Pill */}
                              {isR && (
                                <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-aurora-primary text-white font-code-sm text-[10px] font-extrabold shadow-md animate-bounce">
                                  R
                                </span>
                              )}

                              {/* Index */}
                              <span className={`font-code-sm text-[11px] mb-1.5 ${inWindow ? 'text-aurora-primary-ink font-bold' : 'text-aurora-muted'}`}>
                                [{idx}]
                              </span>

                              {/* Number Card */}
                              <div
                                className={`w-11 sm:w-13 h-14 sm:h-16 rounded-2xl flex items-center justify-center font-code-lg text-base sm:text-lg font-black border transition-all duration-300 ${
                                  inWindow
                                    ? 'bg-aurora-primary-soft text-aurora-primary-ink border-aurora-primary shadow-md scale-105 ring-2 ring-aurora-primary/30'
                                    : 'bg-aurora-bg text-aurora-text border-aurora-border'
                                }`}
                              >
                                {num}
                              </div>

                              {/* Outgoing/Incoming indicators */}
                              {isOutgoing && (
                                <span className="mt-1 text-[10px] font-mono text-rose-500 font-bold animate-pulse">
                                  -drop
                                </span>
                              )}
                              {isIncoming && (
                                <span className="mt-1 text-[10px] font-mono text-emerald-500 font-bold animate-pulse">
                                  +add
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Status Summary Banner */}
                      <div className="w-full max-w-lg mt-3 p-3 rounded-xl bg-aurora-bg border border-aurora-border flex flex-wrap items-center justify-between gap-2 font-code-sm text-xs">
                        <span className="text-aurora-text">
                          Window: <strong className="text-aurora-primary-ink">[{currentStep.data.windowStart}..{currentStep.data.windowEnd}]</strong> (Sum: <strong>{currentStep.data.currentSum}</strong>)
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-aurora-primary-soft text-aurora-primary-ink font-bold border border-aurora-primary/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-aurora-primary" />
                          <span>Global Peak: {currentStep.data.maxSum}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. DP MATRIX CANVAS */}
                  {activeParadigm === 'dp' && (
                    <div className="flex-1 flex flex-col justify-center overflow-x-auto py-2">
                      <div className="min-w-[460px] text-center font-code-sm text-xs">
                        {/* Header Row */}
                        <div className="grid grid-cols-9 gap-1 mb-1 font-bold">
                          <div className="text-outline p-1.5">item \ w</div>
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => (
                            <div key={w} className="p-1.5 bg-surface-container-low dark:bg-white/5 rounded-md text-on-surface-variant dark:text-white/70">
                              {w}
                            </div>
                          ))}
                        </div>

                        {/* 4 Rows */}
                        {currentStep.data.table.map((row: (number | null)[], rIdx: number) => {
                          const itemLabels = ['0 (Base)', '1 (w:2, v:12)', '2 (w:3, v:18)', '3 (w:4, v:14)'];
                          return (
                            <div key={rIdx} className="grid grid-cols-9 gap-1 mb-1 items-center">
                              <div className="text-[10px] font-bold text-outline text-left px-1 truncate" title={itemLabels[rIdx]}>
                                {itemLabels[rIdx]}
                              </div>
                              {row.map((cellVal: number | null, cIdx: number) => {
                                const isActive = currentStep.data.activeRow === rIdx && currentStep.data.activeCol === cIdx;
                                const isSkip = currentStep.data.skipCell && currentStep.data.skipCell[0] === rIdx && currentStep.data.skipCell[1] === cIdx;
                                const isTake = currentStep.data.takeCell && currentStep.data.takeCell[0] === rIdx && currentStep.data.takeCell[1] === cIdx;
                                const isSelected = currentStep.data.selectedItems && ((rIdx === 3 && cIdx === 7) || (rIdx === 2 && cIdx === 3));

                                return (
                                  <div
                                    key={cIdx}
                                    className={`p-2 rounded-lg font-mono text-xs transition-all duration-200 ${
                                      isActive
                                        ? 'bg-primary-container text-white font-extrabold ring-4 ring-primary/40 shadow-lg scale-105'
                                        : isSelected
                                        ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400'
                                        : isTake
                                        ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500'
                                        : isSkip
                                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500'
                                        : cellVal !== null
                                        ? 'bg-surface-container-low dark:bg-white/5 text-on-surface dark:text-white/80'
                                        : 'bg-surface-container-lowest dark:bg-white/[0.02] text-outline-variant border border-dashed border-outline-variant/30'
                                    }`}
                                  >
                                    {cellVal !== null ? cellVal : '·'}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* Recurrence Rule Banner */}
                      <div className="mt-3 p-2.5 rounded-xl bg-surface-container dark:bg-white/5 flex flex-wrap items-center justify-between gap-2 font-code-sm text-xs">
                        <span className="text-on-surface dark:text-white/90">
                          dp[i][w] = max( dp[i-1][w], val[i] + dp[i-1][w - wt[i]] )
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {currentStep.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3. BALANCED TREE CANVAS */}
                  {activeParadigm === 'tree' && (
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[240px] py-2">
                      <svg className="w-full h-56 max-w-lg stroke-outline-variant dark:stroke-white/30 stroke-2">
                        {currentStep.data.edges.map((edge: { from: number; to: number }, idx: number) => {
                          const nFrom = currentStep.data.nodes.find((n: any) => n.id === edge.from);
                          const nTo = currentStep.data.nodes.find((n: any) => n.id === edge.to);
                          if (!nFrom || !nTo) return null;
                          return (
                            <line
                              key={idx}
                              x1={nFrom.x}
                              y1={nFrom.y}
                              x2={nTo.x}
                              y2={nTo.y}
                              className={edge.from === 45 || edge.from === 60 ? 'stroke-primary dark:stroke-purple-400 stroke-[2.5px]' : ''}
                            />
                          );
                        })}
                      </svg>

                      {/* HTML Nodes positioned over SVG */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-56 max-w-lg">
                          {currentStep.data.nodes.map((node: any) => {
                            const isImbalanced = node.bf === -2;
                            const isPivot = node.status === 'pivot' || node.status === 'rotatedRoot';

                            return (
                              <div
                                key={node.id}
                                style={{ left: `${node.x - 22}px`, top: `${node.y - 22}px` }}
                                className={`absolute w-11 h-11 rounded-full flex flex-col items-center justify-center font-code-sm text-xs font-black shadow-md transition-all duration-300 pointer-events-auto ${
                                  isImbalanced
                                    ? 'bg-rose-600 text-white ring-4 ring-rose-400/50 scale-110'
                                    : isPivot
                                    ? 'bg-primary-container text-white ring-4 ring-primary/40 scale-105'
                                    : 'bg-surface-container-low dark:bg-white/10 text-on-surface dark:text-white border border-outline-variant/40'
                                }`}
                              >
                                <span>{node.val}</span>
                                <span className={`text-[9px] ${isImbalanced ? 'text-rose-200' : 'text-outline dark:text-white/60'}`}>
                                  {node.bf >= 0 ? `+${node.bf}` : node.bf}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tree Status Banner */}
                      <div className="w-full max-w-md mt-2 p-2.5 rounded-xl bg-surface-container dark:bg-white/5 flex items-center justify-between font-code-sm text-xs">
                        <span className="text-on-surface dark:text-white/80">
                          Invariant: Height-Balanced (|BF| &le; 1)
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          currentStep.data.nodes.some((n: any) => n.bf === -2)
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {currentStep.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 4. GRAPH FRONTIER CANVAS */}
                  {activeParadigm === 'graph' && (
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[240px] py-2">
                      <svg className="w-full h-56 max-w-lg stroke-outline-variant dark:stroke-white/20 stroke-2">
                        {/* Static Edges with weights */}
                        <line x1="80" y1="130" x2="220" y2="60" className={currentStep.data.relaxedEdges.includes('A-C') ? 'stroke-primary stroke-[3px]' : ''} />
                        <line x1="80" y1="130" x2="220" y2="200" className={currentStep.data.relaxedEdges.includes('A-B') ? 'stroke-primary stroke-[3px]' : ''} />
                        <line x1="220" y1="60" x2="360" y2="60" className={currentStep.data.relaxedEdges.includes('C-D') ? 'stroke-primary stroke-[3px]' : ''} />
                        <line x1="360" y1="60" x2="480" y2="130" className={currentStep.data.relaxedEdges.includes('D-E') ? 'stroke-primary stroke-[3px]' : ''} />
                        <line x1="220" y1="200" x2="480" y2="130" className={currentStep.data.relaxedEdges.includes('B-E') ? 'stroke-emerald-500 stroke-[3.5px]' : ''} />

                        {/* Edge weight labels */}
                        <text x="140" y="85" className="fill-primary font-mono text-xs font-bold">4</text>
                        <text x="140" y="180" className="fill-outline font-mono text-xs">7</text>
                        <text x="290" y="50" className="fill-primary font-mono text-xs font-bold">2</text>
                        <text x="430" y="85" className="fill-outline font-mono text-xs">6</text>
                        <text x="360" y="180" className="fill-emerald-500 font-mono text-xs font-bold">3</text>
                      </svg>

                      {/* HTML Nodes positioned over SVG */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-56 max-w-lg">
                          {[
                            { id: 'A', x: 80, y: 130 },
                            { id: 'C', x: 220, y: 60 },
                            { id: 'B', x: 220, y: 200 },
                            { id: 'D', x: 360, y: 60 },
                            { id: 'E', x: 480, y: 130 },
                          ].map((node) => {
                            const isSettled = currentStep.data.settled.includes(node.id);
                            const isActive = currentStep.data.activeNode === node.id;
                            const dist = currentStep.data.distances[node.id];

                            return (
                              <div
                                key={node.id}
                                style={{ left: `${node.x - 20}px`, top: `${node.y - 20}px` }}
                                className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center font-code-sm text-xs font-bold shadow-md transition-all duration-300 pointer-events-auto ${
                                  isSettled
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                    : isActive
                                    ? 'bg-primary-container text-white ring-4 ring-primary/40 scale-110'
                                    : 'bg-surface-container-low dark:bg-white/10 text-on-surface dark:text-white border border-outline-variant/30'
                                }`}
                              >
                                <span>{node.id}</span>
                                <span className="text-[9px] opacity-80">{dist}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Priority Queue Strip */}
                      <div className="w-full max-w-md mt-2 p-2.5 rounded-xl bg-surface-container dark:bg-white/5 flex items-center justify-between font-code-sm text-xs">
                        <span className="text-on-surface dark:text-white/80">
                          Priority Queue: [ {currentStep.data.pq.map((p: any) => `(${p.node}, ${p.dist})`).join(', ') || 'EMPTY'} ]
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/30">
                          {currentStep.badge}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: STEP TRACE PANEL */}
                <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col bg-white text-aurora-text rounded-2xl border border-aurora-border shadow-aurora-sm overflow-hidden font-mono text-xs">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-aurora-bg border-b border-aurora-border shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-aurora-primary" />
                      <span className="text-[11px] font-semibold text-aurora-text tracking-tight">
                        Step trace
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-aurora-primary-soft text-aurora-primary font-bold text-[10px] uppercase tracking-wider">
                      Step {safeStepIndex + 1}/{currentSteps.length}
                    </span>
                  </div>

                  {/* Current operation */}
                  <div className="px-3.5 py-2 bg-white border-b border-aurora-border flex items-center gap-2 text-[11px] font-bold">
                    <span className="text-aurora-muted select-none">$</span>
                    <span className="text-aurora-primary shrink-0">operation &gt;</span>
                    <span className="text-aurora-secondary font-mono truncate">{currentStep.terminalCmd}</span>
                  </div>

                  {/* Pseudocode with highlighted line */}
                  <div className="p-3 bg-white border-b border-aurora-border space-y-0.5 overflow-x-auto text-[11px] leading-relaxed">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-aurora-muted mb-1 flex items-center justify-between">
                      <span>Pseudocode</span>
                      <span className="text-aurora-primary">Line {currentStep.codeLine}</span>
                    </div>
                    {currentStep.pseudocode.map((line, idx) => {
                      const lineNo = idx + 1;
                      const isCurrent = lineNo === currentStep.codeLine;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                            isCurrent
                              ? 'bg-aurora-primary-soft text-aurora-primary border-l-2 border-aurora-primary font-bold'
                              : 'text-aurora-muted hover:text-aurora-text'
                          }`}
                        >
                          <span className="w-5 shrink-0 text-aurora-muted/50 text-right mr-2 select-none font-mono">
                            {lineNo}
                          </span>
                          <span className="whitespace-pre">{line}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Variables for this step */}
                  <div className="p-3 bg-aurora-bg/60 border-b border-aurora-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-aurora-muted mb-1.5 flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-aurora-secondary" />
                      <span>Variables in this step</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                      {Object.entries(currentStep.liveVariables).map(([k, v]) => (
                        <div key={k} className="p-1.5 rounded-lg bg-white border border-aurora-border flex items-center justify-between">
                          <span className="text-aurora-muted">{k}:</span>
                          <span className="font-bold text-aurora-secondary truncate ml-1">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why & rule callout */}
                  <div className="p-3 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-aurora-accent mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Why this step?</span>
                      </div>
                      <p className="text-[11px] text-aurora-text leading-relaxed font-sans font-medium">
                        {currentStep.action}
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-aurora-primary-soft border border-aurora-primary/15 text-[11px] text-aurora-text font-mono">
                        <span className="text-aurora-primary font-bold mr-1">Rule:</span>
                        <span>{currentStep.rule}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-aurora-border flex items-center justify-between text-[10px] text-aurora-muted">
                      <span>
                        Status: <strong className="text-aurora-secondary">trace active</strong>
                      </span>
                      <span className="font-sans font-medium">Read the rule first</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Playback Scrubber & Live Controls */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 dark:border-white/10 flex flex-col items-stretch gap-3">
                {!isAuthenticated && (
                  <div className="w-full p-2.5 rounded-xl bg-primary/10 dark:bg-purple-950/40 border border-primary/20 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-primary dark:text-purple-300 font-medium">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Sign in required to run interactive scrubbing, edit code &amp; test custom inputs.</span>
                    </div>
                    <button
                      onClick={() => openLoginModal('user')}
                      className="px-3.5 py-1 rounded-full bg-primary text-white font-bold text-[11px] shadow-xs hover:opacity-95 cursor-pointer shrink-0"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProtectedAction(() => setStepIndex((prev) => Math.max(0, prev - 1)))}
                      disabled={safeStepIndex === 0}
                      className="w-9 h-9 rounded-full bg-surface-container-lowest dark:bg-white/10 text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30 dark:border-white/10 disabled:opacity-40"
                      title="Previous Step"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleProtectedAction(() => setIsPlaying(!isPlaying))}
                      className="px-4 py-1.5 rounded-full bg-primary-container text-white flex items-center gap-1.5 font-label-md text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'Pause' : 'Play Trace'}</span>
                    </button>
                    <button
                      onClick={() => handleProtectedAction(() => setStepIndex((prev) => Math.min(currentSteps.length - 1, prev + 1)))}
                      disabled={safeStepIndex === currentSteps.length - 1}
                      className="w-9 h-9 rounded-full bg-surface-container-lowest dark:bg-white/10 text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30 dark:border-white/10 disabled:opacity-40"
                      title="Next Step"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleProtectedAction(() => {
                        setIsPlaying(false);
                        setStepIndex(0);
                      })}
                      className="w-9 h-9 rounded-full bg-surface-container-lowest dark:bg-white/10 text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30 dark:border-white/10"
                      title="Reset to Step 1"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrubber slider bar */}
                  <div className="flex-1 w-full max-w-md flex items-center gap-3">
                    <span className="font-code-sm text-xs font-bold text-primary dark:text-purple-300 shrink-0">
                      Step {safeStepIndex + 1} / {currentSteps.length}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={currentSteps.length - 1}
                      value={safeStepIndex}
                      onChange={(e) => {
                        handleProtectedAction(() => {
                          setIsPlaying(false);
                          setStepIndex(Number(e.target.value));
                        });
                      }}
                      className="w-full accent-primary h-2 bg-surface-container-low dark:bg-white/10 rounded-full cursor-pointer"
                    />
                  </div>

                  {/* Direct Launch Button */}
                  <button
                    onClick={() => handleProtectedAction(() => handleLaunchTopic(currentConfig.algoId))}
                    className="inline-flex items-center gap-1.5 font-label-md text-xs text-primary dark:text-purple-300 font-bold hover:underline cursor-pointer bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                  >
                    <span>Open {currentConfig.name} in the Observatory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Frosted-glass lock overlay — a visual gate only, auth stays in AuthContext */}
            {previewLocked && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-white/45 via-white/55 to-white/70 backdrop-blur-[12px]"
                />
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-4">
                  <PreviewLockCard onSignIn={() => openLoginModal('user')} />
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Learning method */}
      <section className="relative w-full px-4 sm:px-8 py-16 bg-white/60 border-y border-aurora-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-code-sm text-xs text-aurora-secondary font-bold uppercase tracking-widest">
              A simple study loop
            </span>
            <h2 className="font-display-lg text-2xl sm:text-3xl font-extrabold mt-1 text-aurora-text">
              How to learn with AlgoViz
            </h2>
            <p className="font-body-md text-sm text-aurora-muted mt-2">
              Watching an animation is not learning by itself. This three-pass loop turns
              each trace into a mental model you can reuse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-aurora-sm border border-aurora-border hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-aurora-primary-soft text-aurora-primary flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-aurora-text">
                Start with the idea
              </h3>
              <p className="font-body-sm text-xs text-aurora-muted mt-2 leading-relaxed">
                Open a topic and read its analogy and sub-topics first. Predict how the
                algorithm should behave before you look at a single animation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-aurora-sm border border-aurora-border hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-aurora-secondary-soft text-aurora-secondary flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-aurora-text">
                Step, don't just play
              </h3>
              <p className="font-body-sm text-xs text-aurora-muted mt-2 leading-relaxed">
                Use the step controls and read the reason for each operation. Ask what
                changed, which invariant still holds, and what the algorithm will do next.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-aurora-sm border border-aurora-border hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-aurora-accent-soft text-aurora-accent flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-aurora-text">
                Explain it back
              </h3>
              <p className="font-body-sm text-xs text-aurora-muted mt-2 leading-relaxed">
                Compare two approaches or solve a fresh problem. If you can justify each
                move without the animation, you own the idea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular starting points */}
      <section className="relative w-full px-4 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-code-sm text-xs text-aurora-primary font-bold uppercase tracking-wider">
                Recommended entry points
              </span>
              <h2 className="font-display-lg text-2xl sm:text-3xl font-extrabold text-aurora-text mt-1">
                Popular starting points
              </h2>
              <p className="font-body-sm text-sm text-aurora-muted mt-1">
                Four foundations and four algorithm families from the {categories.length}
                -topic curriculum.
              </p>
            </div>
            <button
              onClick={() => handleProtectedAction(() => onNavigate('topics'))}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:border-aurora-primary/30 hover:text-aurora-primary text-aurora-text rounded-xl font-label-lg text-xs font-bold transition-all cursor-pointer border border-aurora-border shadow-aurora-sm"
            >
              <span>Browse all {categories.length} topics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ...categories.filter((c) => c.part === 'ds').slice(0, 4),
              ...categories.filter((c) => c.part === 'algo').slice(0, 4),
            ].map((cat) => {
              const catAlgos = fullCatalog.filter((a) => a.category === cat.id);
              const featured =
                catAlgos.find((algo) => algo.id === HOME_FEATURED[cat.id]) ?? catAlgos[0];
              const count = catAlgos.length;
              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    handleProtectedAction(() =>
                      handleLaunchTopic(featured?.id ?? 'bubble-sort'),
                    )
                  }
                  className="bg-white rounded-2xl p-5 shadow-aurora-sm border border-aurora-border hover:border-aurora-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-code-sm text-[10px] px-2 py-0.5 bg-aurora-bg text-aurora-muted rounded-full font-semibold">
                        {cat.part === 'ds' ? 'Foundation' : 'Algorithm'}
                      </span>
                      <span className="font-code-sm text-[10px] text-aurora-secondary font-bold">
                        {count} {count === 1 ? 'visualizer' : 'visualizers'}
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-base font-bold text-aurora-text group-hover:text-aurora-primary transition-colors">
                      {cat.title.replace(/^\d+\.\s*/, '')}
                    </h4>
                    <p className="font-body-sm text-xs text-aurora-muted mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-aurora-border flex items-center justify-between gap-2 text-xs text-aurora-primary font-bold">
                    <span className="truncate">
                      Start with {featured?.name ?? cat.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The reasoning spotlight */}
      <section className="relative w-full px-4 sm:px-8 py-16 bg-gradient-to-b from-white/40 to-aurora-bg">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-aurora-md border border-aurora-border flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-aurora-primary text-white flex items-center justify-center shadow-[0_14px_30px_-16px_rgba(99,91,255,0.9)] mb-6">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-display-lg text-2xl sm:text-4xl font-extrabold text-aurora-text text-center">
            Every step answers “why?”
          </h2>
          <p className="font-body-lg text-sm sm:text-base text-aurora-muted max-w-2xl mt-4 leading-relaxed text-center">
            A highlight tells you what changed. The reason tells you why it was allowed.
            Each trace connects the visible move to the rule and invariant behind it.
          </p>

          <div className="mt-7 grid w-full gap-3 sm:grid-cols-3">
            {[
              {
                title: 'The rule',
                body: 'Which comparison, pointer move or write the algorithm just performed.',
              },
              {
                title: 'The invariant',
                body: 'What must stay true for the next step to be correct.',
              },
              {
                title: 'The consequence',
                body: 'How the move narrows the search or builds the final answer.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-aurora-bg p-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-aurora-primary">
                  {item.title}
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-aurora-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() => handleProtectedAction(() => onNavigate('visualizer'))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-aurora-primary text-white rounded-xl font-label-lg text-sm font-bold shadow-[0_14px_30px_-14px_rgba(99,91,255,0.9)] hover:bg-aurora-primary-ink transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Open the Observatory</span>
            </button>
            <button
              onClick={() => handleProtectedAction(() => onNavigate('topics'))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-aurora-bg text-aurora-text rounded-xl font-label-lg text-sm font-bold hover:bg-aurora-primary-soft hover:text-aurora-primary border border-aurora-border transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse the curriculum</span>
            </button>
          </div>

          <p className="mt-6 text-center text-[11px] font-medium text-aurora-muted">
            Study tip: pause before each step and predict it. Prediction is where the
            learning happens.
          </p>
        </div>
      </section>
    </div>
  );
};
