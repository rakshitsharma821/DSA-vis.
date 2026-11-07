import React, { useState, useRef, useEffect } from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ComplexityChart } from './ComplexityChart';
import { StepLogPanel } from './StepLogPanel';
import { getAlgorithmCode } from '../../data/algorithmCode';
import {
  Code2,
  FileText,
  Activity,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
  History,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ExplanationPanel: React.FC = () => {
  const { currentAlgorithm, steps, currentStepIndex, isPlaying } = useAlgorithmStore();
  const currentStep = steps[currentStepIndex] || steps[0];
  const pseudocode = currentAlgorithm.pseudocode || [];
  const complexity = currentAlgorithm.complexity;
  const activeLine = currentStep?.codeLine || 1;
  const isHashing = currentAlgorithm.category === 'hashing';

  // Active tab state & auto-switch to code on Play
  const [activeTab, setActiveTab] = useState<string>('pseudocode');
  useEffect(() => {
    if (isPlaying) {
      setActiveTab('pseudocode');
    }
  }, [isPlaying]);

  // Code language tab
  const [codeLanguage, setCodeLanguage] = useState<'pseudo' | 'cpp' | 'java' | 'python'>('pseudo');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active line auto-scroll ref
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLine, codeLanguage]);

  const codeImplementations = getAlgorithmCode(currentAlgorithm.id, currentAlgorithm.name);

  const handleCopyCode = () => {
    let textToCopy = '';
    if (codeLanguage === 'pseudo') {
      textToCopy = pseudocode.join('\n');
    } else {
      textToCopy = codeImplementations[codeLanguage] || '';
    }
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleSelectQuiz = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanation((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-aurora-border select-none overflow-hidden font-mono text-xs">
      {/* Step explanation header */}
      <div className="border-b border-aurora-border bg-aurora-bg p-2.5 sm:p-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Terminal className="w-3.5 h-3.5 text-aurora-primary shrink-0" />
            <span className="font-bold tracking-tight text-[11px] text-aurora-text uppercase shrink-0">
              Step explanation
            </span>
            {currentStep?.reason?.action && (
              <span className="text-aurora-primary font-bold text-[10px] truncate max-w-[260px] hidden sm:inline">
                › {currentStep.reason.action}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="gap-1 font-mono text-[10px] bg-white border-aurora-border py-0 text-aurora-muted">
              <Sparkles className="w-3 h-3 text-aurora-primary" />
              Step {currentStepIndex + 1}/{steps.length}
            </Badge>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[10px] font-bold uppercase',
                currentStep?.type === 'found' || currentStep?.type === 'complete'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentStep?.type === 'compare'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : currentStep?.type === 'swap'
                  ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200'
                  : 'bg-aurora-primary-soft text-aurora-primary border border-aurora-primary/20'
              )}
            >
              {currentStep?.type || 'idle'}
            </span>
          </div>
        </div>

        {/* Live message */}
        <div className="mt-1.5 space-y-0.5">
          {currentStep?.reason?.action && (
            <div className="text-[11px] font-bold text-aurora-primary flex items-center gap-1">
              <span>›</span>
              <span className="break-words">{currentStep.reason.action}</span>
            </div>
          )}
          <p className="text-xs font-medium leading-relaxed text-aurora-text max-h-16 overflow-y-auto break-words">
            {currentStep?.message || 'Press Play or Step Forward to run the algorithm.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className={cn('grid w-full h-8 mb-2.5 shrink-0 bg-aurora-bg border border-aurora-border', isHashing ? 'grid-cols-6' : 'grid-cols-5')}>
            <TabsTrigger value="pseudocode" className="gap-1 px-1 text-[11px] data-[state=active]:bg-white data-[state=active]:text-aurora-primary">
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-1 px-1 text-[11px] data-[state=active]:bg-white data-[state=active]:text-aurora-primary">
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="explanation" className="gap-1 px-1 text-[11px] data-[state=active]:bg-white data-[state=active]:text-aurora-primary">
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="complexity" className="gap-1 px-1 text-[11px] data-[state=active]:bg-white data-[state=active]:text-aurora-primary">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="gap-1 px-1 text-[11px] data-[state=active]:bg-white data-[state=active]:text-aurora-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            {isHashing && (
              <TabsTrigger value="examples" className="gap-1 px-1 text-[11px] text-amber-700 font-semibold data-[state=active]:bg-white">
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Examples</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* TAB: STEP LOG */}
          <TabsContent value="log" className="flex-1 min-h-0 overflow-y-auto mt-0">
            <StepLogPanel />
          </TabsContent>

          {/* TAB 1: CODE PANEL (Complete Runnable Code) */}
          <TabsContent value="pseudocode" className="flex-1 min-h-0 flex flex-col mt-0 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-aurora-border bg-aurora-bg/50 text-aurora-text overflow-hidden">
              {/* Sticky Language Switcher & Copy Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-1 p-2 bg-white border-b border-aurora-border shrink-0">
                <div className="flex items-center gap-1">
                  {(['pseudo', 'cpp', 'java', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={cn(
                        'px-2 py-1 rounded transition-colors uppercase font-semibold text-[10px] cursor-pointer',
                        codeLanguage === lang
                          ? 'bg-aurora-primary text-white shadow-xs'
                          : 'text-aurora-muted hover:text-aurora-text hover:bg-aurora-bg'
                      )}
                    >
                      {lang === 'pseudo' ? 'Pseudocode' : lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-aurora-muted hidden sm:inline">
                    Line {activeLine}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1 text-aurora-muted hover:text-aurora-primary hover:bg-aurora-primary-soft"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-aurora-secondary" />
                        <span className="text-aurora-secondary">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Scrollable Code Area with Auto-Scroll to Active Line */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 text-xs leading-relaxed">
                {codeLanguage === 'pseudo' ? (
                  <pre className="space-y-0.5">
                    {pseudocode.map((line, idx) => {
                      const lineNum = idx + 1;
                      const isCurrent = lineNum === activeLine;
                      return (
                        <div
                          key={idx}
                          ref={isCurrent ? activeLineRef : null}
                          className={cn(
                            'flex items-center px-2 py-0.5 rounded transition-all duration-200',
                            isCurrent
                              ? 'bg-aurora-primary-soft text-aurora-primary font-bold border-l-4 border-aurora-primary'
                              : 'text-aurora-text/75 hover:text-aurora-text'
                          )}
                        >
                          <span className="w-6 shrink-0 text-aurora-muted/50 text-[10px] select-none text-right mr-3 font-mono">
                            {lineNum}
                          </span>
                          <span className="break-all whitespace-pre-wrap">{line}</span>
                        </div>
                      );
                    })}
                  </pre>
                ) : (
                  <pre className="space-y-0.5">
                    {(codeImplementations[codeLanguage] || '').split('\n').map((codeRow, idx) => {
                      const lineNum = idx + 1;
                      const isCurrent = lineNum === activeLine;
                      return (
                        <div
                          key={idx}
                          ref={isCurrent ? activeLineRef : null}
                          className={cn(
                            'flex items-center px-2 py-0.5 rounded transition-all duration-200',
                            isCurrent
                              ? 'bg-aurora-primary-soft text-aurora-primary font-bold border-l-4 border-aurora-primary'
                              : 'text-aurora-text/80 hover:text-aurora-text'
                          )}
                        >
                          <span className="w-6 shrink-0 text-aurora-muted/50 text-[10px] select-none text-right mr-3 font-mono">
                            {lineNum}
                          </span>
                          <span className="break-all whitespace-pre-wrap">{codeRow}</span>
                        </div>
                      );
                    })}
                  </pre>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: EXPLANATION */}
          <TabsContent value="explanation" className="flex-1 min-h-0 overflow-y-auto mt-0 space-y-3 pr-1">
            <div className="p-3 rounded-xl bg-aurora-bg border border-aurora-border">
              <h4 className="text-xs font-semibold text-aurora-text flex items-center gap-1.5 mb-1.5">
                <Info className="w-3.5 h-3.5 text-aurora-primary" />
                How it works
              </h4>
              <p className="text-xs text-aurora-muted leading-relaxed font-sans">
                {currentAlgorithm.explanation}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-aurora-border">
              <h4 className="text-xs font-semibold text-aurora-text mb-2">At a glance</h4>
              <ul className="text-xs text-aurora-muted space-y-1 font-sans">
                <li>Level: <strong className="text-aurora-text">{currentAlgorithm.difficulty}</strong></li>
                <li>Family: <strong className="text-aurora-text">{currentAlgorithm.categoryName}</strong></li>
                <li>Average time: <strong className="font-mono text-aurora-primary">{complexity.time.average}</strong></li>
                <li>Auxiliary space: <strong className="font-mono text-aurora-secondary">{complexity.space.worst}</strong></li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-aurora-accent-soft border border-aurora-accent/20">
              <h4 className="text-xs font-semibold text-aurora-text mb-1">What to notice in the trace</h4>
              <p className="text-[11px] text-aurora-muted leading-relaxed font-sans">
                Watch which values the algorithm keeps and which it discards. The
                highlighted operation is the only thing that changed on this step.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentAlgorithm.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] bg-aurora-bg text-aurora-muted">
                  #{tag}
                </Badge>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: COMPLEXITY & METRICS */}
          <TabsContent value="complexity" className="flex-1 min-h-0 overflow-y-auto mt-0 space-y-3 pr-1">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-aurora-text">Asymptotic bounds</h4>
              <p className="text-[10px] leading-relaxed text-aurora-muted font-sans">
                Big-O describes how work grows with input size, not a runtime in seconds.
                Auxiliary space counts extra memory beyond the input.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Best Time</span>
                  <span className="font-mono font-bold text-foreground text-sm">{complexity.time.best}</span>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Average Time</span>
                  <span className="font-mono font-bold text-primary text-sm">{complexity.time.average}</span>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Worst Time</span>
                  <span className="font-mono font-bold text-destructive text-sm">{complexity.time.worst}</span>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Auxiliary Space</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{complexity.space.worst}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card">
              <h4 className="text-xs font-semibold text-foreground mb-1">
                Live Operations Timeline
              </h4>
              <p className="text-[10px] text-muted-foreground mb-2">
                Comparisons (amber) and Swaps (fuchsia) plotted over execution steps.
              </p>
              <ComplexityChart />
            </div>
          </TabsContent>

          {/* TAB 4: LEARN & QUIZ MODE */}
          <TabsContent value="learn" className="flex-1 min-h-0 overflow-y-auto mt-0 space-y-3 pr-1 font-sans">
            <div className="p-3 rounded-xl bg-aurora-primary-soft border border-aurora-primary/20">
              <h4 className="text-xs font-semibold text-aurora-primary flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4" />
                Check your understanding
              </h4>
              <p className="text-xs text-aurora-muted leading-relaxed font-sans">
                Use these prompts before you move on. If you can answer them without the
                animation, you understand the algorithm, not just the picture.
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-aurora-text font-sans">
                <li>1. What does the algorithm guarantee after each step?</li>
                <li>2. Which input makes it do the most work?</li>
                <li>3. Why is the highlighted move safe?</li>
              </ul>
            </div>

            {/* Real-Life Analogy Card */}
            {currentAlgorithm.realLifeExample && (
              <div className="p-3.5 rounded-xl bg-aurora-accent-soft border border-aurora-accent/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-aurora-text">
                  <Sparkles className="w-4 h-4 text-aurora-accent" />
                  <span>Connect it to something familiar</span>
                </div>
                <p className="text-xs text-aurora-text/80 leading-relaxed font-sans">
                  {currentAlgorithm.realLifeExample}
                </p>
              </div>
            )}

            {currentAlgorithm.quiz && currentAlgorithm.quiz.length > 0 ? (
              <div className="space-y-3">
                {currentAlgorithm.quiz.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const answered = selected !== undefined;
                  const isCorrect = selected === q.correctAnswer;

                  return (
                    <div
                      key={qIdx}
                      className="p-3 rounded-lg border border-border bg-card space-y-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-foreground">{q.question}</span>
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnVariant: 'outline' | 'default' | 'destructive' = 'outline';
                          let customClass = '';

                          if (answered) {
                            if (optIdx === q.correctAnswer) {
                              customClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
                            } else if (isOptionSelected) {
                              customClass = 'border-destructive bg-destructive/10 text-destructive';
                            } else {
                              customClass = 'opacity-50';
                            }
                          } else if (isOptionSelected) {
                            btnVariant = 'default';
                          }

                          return (
                            <Button
                              key={optIdx}
                              variant={btnVariant}
                              size="sm"
                              disabled={answered}
                              className={cn(
                                'w-full justify-start text-left text-xs h-auto py-2 px-3 whitespace-normal',
                                customClass
                              )}
                              onClick={() => handleSelectQuiz(qIdx, optIdx)}
                            >
                              <span className="font-mono font-bold mr-2 text-[10px] opacity-70">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </Button>
                          );
                        })}
                      </div>

                      {answered && showExplanation[qIdx] && (
                        <div
                          className={cn(
                            'p-2.5 rounded-md text-xs border flex items-start gap-2',
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-destructive/10 border-destructive/30 text-destructive'
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block mb-0.5">
                              {isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                            <span className="text-[11px] leading-relaxed opacity-90">
                              {q.explanation}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </TabsContent>

          {/* TAB 5: HASHING EXAMPLE QUESTIONS */}
          {isHashing && (
            <TabsContent value="examples" className="flex-1 min-h-0 overflow-y-auto mt-0 space-y-3 pr-1 font-sans">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                  Classic Hashing Interview Problems
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  Explore how hash tables achieve O(1) average time lookups to solve top interview problems. Click any problem to run it live on the visualizer board.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'insert-collisions',
                    title: '1. Insert 15, 25, 35 into Size-10 Table',
                    summary: 'Demonstrates consecutive collisions at slot 5 (15 % 10 = 5, 25 % 10 = 5, 35 % 10 = 5) and resolution via linear probe sequences.',
                    time: 'O(1) avg / O(n) worst',
                    space: 'O(n)',
                    actionId: 'insert-collisions',
                  },
                  {
                    id: 'two-sum',
                    title: '2. Two Sum using Hash Map',
                    summary: 'Given nums = [2, 7, 11, 15] and target = 9, look up complement (target - num) in O(1) time per element to find indices [0, 1].',
                    time: 'O(n) single pass',
                    space: 'O(n)',
                    actionId: 'two-sum',
                  },
                  {
                    id: 'count-distinct',
                    title: '3. Count Distinct Elements (HashSet)',
                    summary: 'Given arr = [4, 2, 7, 2, 4, 9, 7], inserts elements into a HashSet to filter duplicates in O(1) time per item, yielding 4 unique elements.',
                    time: 'O(n)',
                    space: 'O(n)',
                    actionId: 'count-distinct',
                  },
                  {
                    id: 'first-unique',
                    title: '4. First Non-Repeating Character',
                    summary: 'Build a character frequency hash map in first pass, then return first character whose frequency count equals 1.',
                    time: 'O(n)',
                    space: 'O(1) / O(alphabet)',
                    actionId: 'count-distinct',
                  },
                  {
                    id: 'subarray-sum',
                    title: '5. Subarray Sum Equals K',
                    summary: 'Maintains running prefix sums in a frequency map to count continuous subarrays whose sum equals target K in O(n) time.',
                    time: 'O(n)',
                    space: 'O(n)',
                    actionId: 'two-sum',
                  },
                ].map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3 rounded-xl border border-border bg-card shadow-xs space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-foreground">{prob.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {prob.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prob.summary}
                    </p>
                    <div className="pt-1 flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold gap-1.5 hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => {
                          const store = useAlgorithmStore.getState();
                          if (currentAlgorithm.id !== 'hash-example-questions') {
                            store.setAlgorithm('hash-example-questions');
                          }
                          setTimeout(() => {
                            useAlgorithmStore.getState().setInput({ question: prob.actionId });
                          }, 50);
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Run on Visualizer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
