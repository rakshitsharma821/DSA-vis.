import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  School,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowDownUp,
  ArrowRightLeft,
  ArrowUpDown,
  Cpu,
  GitCommit,
  GitFork,
  GitMerge,
  Grid,
  Hash,
  LayoutGrid,
  Network,
  Repeat,
  Split,
  Table,
  Type,
  Undo2,
  Zap,
  BookOpen,
  Play,
  RotateCcw,
  Compass,
  SlidersHorizontal,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { categories, fullCatalog } from '../algorithms/registry';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { NavView } from '../components/layout/Navbar';

interface TopicsPageProps {
  onNavigate: (view: NavView) => void;
  onOpenCommandPalette: () => void;
}

type ScopeFilter = 'all' | 'ds' | 'algo';
type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * The first visualizer we recommend for each topic. These ids exist in
 * `fullCatalog`, so launching never falls back to an unrelated algorithm.
 */
const FEATURED_ALGORITHM: Record<string, string> = {
  arrays: 'two-pointers-sum',
  strings: 'palindrome-check',
  'linked-list': 'linked-list-reversal',
  stack: 'stack-operations',
  queue: 'queue-operations',
  trees: 'tree-traversals-all',
  graphs: 'graph-bfs-dfs',
  hashing: 'hash-table-chaining',
  heap: 'heap-dual-view',
  trie: 'trie-prefix-tree',
  'disjoint-set': 'disjoint-set-union',
  matrix: 'matrix-spiral-order',
  recursion: 'tower-of-hanoi',
  searching: 'binary-search',
  sorting: 'bubble-sort',
  'divide-and-conquer': 'divide-conquer-merge',
  dp: 'knapsack-01-table',
  greedy: 'activity-selection-opt',
  backtracking: 'n-queens-solver',
  'bit-manipulation': 'bit-manipulation',
};

const ICONS: Record<string, React.ElementType> = {
  ArrowDownUp,
  ArrowRightLeft,
  ArrowUpDown,
  Cpu,
  GitCommit,
  GitFork,
  GitMerge,
  Grid,
  Hash,
  Layers,
  LayoutGrid,
  Network,
  Repeat,
  Search,
  Sparkles,
  Split,
  Table,
  Type,
  Undo2,
  Zap,
};

const LEVEL_RANK: Record<string, number> = {
  Beginner: 0,
  Easy: 0,
  Intermediate: 1,
  Medium: 1,
  Advanced: 2,
  Hard: 2,
};

const LEVEL_LABEL: Record<LevelFilter, string> = {
  all: 'All levels',
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
};

const START_HERE = [
  {
    step: '01',
    title: 'Read the mental model',
    body: 'Each topic card gives you the core idea, a real-world analogy, and the sub-topics you will meet inside the visualizer.',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Watch one trace slowly',
    body: 'Open the Observatory and step forward one operation at a time. Read the reason before you press play.',
    icon: Play,
  },
  {
    step: '03',
    title: 'Test the idea',
    body: 'Rebuild the approach in Compare & Learn or the Problem Solver, then explain the invariant in your own words.',
    icon: CheckCircle2,
  },
];

export const TopicsPage: React.FC<TopicsPageProps> = ({
  onNavigate,
  onOpenCommandPalette,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const { setAlgorithm } = useAlgorithmStore();

  // Shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('curriculum-search');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const catalogByCategory = useMemo(() => {
    const map = new Map<string, typeof fullCatalog>();
    for (const category of categories) {
      map.set(
        category.id,
        fullCatalog.filter((algo) => algo.category === category.id),
      );
    }
    return map;
  }, []);

  const handleLaunchTopic = (catId: string) => {
    const catAlgos = catalogByCategory.get(catId) ?? [];
    const featured =
      catAlgos.find((algo) => algo.id === FEATURED_ALGORITHM[catId]) ??
      catAlgos[0];

    if (!featured) return;
    setAlgorithm(featured.id);
    onNavigate('visualizer');
  };

  const levelMatches = (difficulty: string) => {
    if (levelFilter === 'all') return true;
    return LEVEL_RANK[difficulty] === LEVEL_RANK[levelFilter];
  };

  const filteredCategories = categories.filter((cat) => {
    if (scopeFilter !== 'all' && cat.part !== scopeFilter) return false;

    const catAlgos = catalogByCategory.get(cat.id) ?? [];
    if (levelFilter !== 'all' && !catAlgos.some((a) => levelMatches(a.difficulty))) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.realLifeAnalogy.toLowerCase().includes(query) ||
      cat.subtopics.some((topic) => topic.toLowerCase().includes(query)) ||
      catAlgos.some((algo) => algo.name.toLowerCase().includes(query))
    );
  });

  const dsCategories = filteredCategories.filter((c) => c.part === 'ds');
  const algoCategories = filteredCategories.filter((c) => c.part === 'algo');

  const matchingVisualizers = filteredCategories.reduce(
    (sum, cat) =>
      sum +
      (catalogByCategory.get(cat.id) ?? []).filter((a) =>
        levelMatches(a.difficulty),
      ).length,
    0,
  );

  const beginnerVisualizers = fullCatalog.filter(
    (algo) => LEVEL_RANK[algo.difficulty] === 0,
  ).length;
  const dsTopics = categories.filter((c) => c.part === 'ds').length;
  const algoTopics = categories.filter((c) => c.part === 'algo').length;

  const hasFilters =
    searchQuery.trim() !== '' || scopeFilter !== 'all' || levelFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setScopeFilter('all');
    setLevelFilter('all');
  };

  const renderCategoryCard = (cat: (typeof categories)[number], accent: 'violet' | 'teal') => {
    const catAlgos = catalogByCategory.get(cat.id) ?? [];
    const Icon = ICONS[cat.iconName] ?? BookOpen;
    const featured =
      catAlgos.find((algo) => algo.id === FEATURED_ALGORITHM[cat.id]) ?? catAlgos[0];
    const levels = Array.from(
      new Set(catAlgos.map((algo) => LEVEL_RANK[algo.difficulty])),
    ).sort();
    const levelText =
      levels.length > 1
        ? `${LEVEL_LABEL[levels[0] === 0 ? 'Beginner' : levels[0] === 1 ? 'Intermediate' : 'Advanced']} – ${
            LEVEL_LABEL[levels[levels.length - 1] === 0 ? 'Beginner' : levels[levels.length - 1] === 1 ? 'Intermediate' : 'Advanced']
          }`
        : levels.length === 1
          ? LEVEL_LABEL[levels[0] === 0 ? 'Beginner' : levels[0] === 1 ? 'Intermediate' : 'Advanced']
          : 'All levels';

    const isViolet = accent === 'violet';

    return (
      <article
        key={cat.id}
        className="group flex flex-col rounded-2xl border border-aurora-border bg-aurora-surface p-5 shadow-aurora-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-aurora-primary/30 hover:shadow-aurora-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isViolet
                  ? 'bg-aurora-primary-soft text-aurora-primary'
                  : 'bg-aurora-secondary-soft text-aurora-secondary'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <span
                className={`block text-[9px] font-bold uppercase tracking-[0.16em] ${
                  isViolet ? 'text-aurora-primary/75' : 'text-aurora-secondary'
                }`}
              >
                {cat.part === 'ds' ? 'Data structure' : 'Algorithm family'}
              </span>
              <h3 className="truncate text-base font-extrabold tracking-tight text-aurora-text">
                {cat.title.replace(/^\d+\.\s*/, '')}
              </h3>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-aurora-border bg-aurora-bg px-2.5 py-1 text-[10px] font-bold text-aurora-muted">
            {catAlgos.length} {catAlgos.length === 1 ? 'visualizer' : 'visualizers'}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-aurora-muted">
          {cat.description}
        </p>

        <div className="mt-3 rounded-xl border border-aurora-border/80 bg-aurora-bg/70 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-accent" />
            <p className="text-[11px] leading-relaxed text-aurora-text/80">
              <span className="font-bold">Think of it like: </span>
              {cat.realLifeAnalogy}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-aurora-muted/70">
            What you will learn
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {cat.subtopics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-aurora-bg px-2 py-1 text-[10px] font-medium text-aurora-muted"
              >
                {topic}
              </span>
            ))}
            {cat.subtopics.length > 4 && (
              <span className="px-1 py-1 text-[10px] font-semibold text-aurora-muted/70">
                +{cat.subtopics.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-aurora-border/80 pt-4">
          <div className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-aurora-muted/70">
              Start here · {levelText}
            </span>
            <span className="mt-0.5 block truncate text-[11px] font-semibold text-aurora-text">
              {featured?.name ?? cat.title}
            </span>
            {featured && (
              <span className="mt-0.5 block font-mono text-[10px] text-aurora-muted">
                Time {featured.timeComplexity} · Space {featured.spaceComplexity}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleLaunchTopic(cat.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isViolet
                ? 'bg-aurora-primary hover:bg-aurora-primary-ink focus-visible:ring-aurora-primary/35'
                : 'bg-aurora-secondary hover:bg-[#159c8e] focus-visible:ring-aurora-secondary/35'
            }`}
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Start visualizer</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-aurora-bg text-aurora-text">
      {/* Soft Aurora atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-aurora-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-aurora-secondary/8 blur-[100px]" />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-8 sm:pt-10">
        {/* Breadcrumb / context */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-aurora-muted">
            <span className="inline-flex items-center gap-1.5 text-aurora-primary">
              <School className="h-3.5 w-3.5" />
              Curriculum
            </span>
            <span className="text-aurora-border">/</span>
            <span className="text-aurora-text">All topics</span>
          </div>
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="inline-flex items-center gap-2 rounded-full border border-aurora-border bg-aurora-surface px-3 py-1.5 text-[11px] font-semibold text-aurora-muted shadow-aurora-sm transition-colors hover:border-aurora-primary/30 hover:text-aurora-primary"
          >
            <Search className="h-3.5 w-3.5" />
            Search algorithms
            <kbd className="rounded border border-aurora-border bg-aurora-bg px-1.5 py-0.5 font-mono text-[9px] font-bold text-aurora-muted">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Hero */}
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-aurora-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-primary">
              <Compass className="h-3.5 w-3.5" />
              {categories.length} topics · {fullCatalog.length} guided visualizers
            </span>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-aurora-text sm:text-4xl lg:text-5xl">
              Build intuition one algorithm at a time.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-aurora-muted sm:text-base">
              Start with the data structures that hold your data, then move into the
              algorithms that transform it. Every topic pairs a plain-language idea with
              a step-by-step visualizer, so you can see the invariant instead of
              memorising the code.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (dsCategories[0]) handleLaunchTopic(dsCategories[0].id);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-aurora-primary px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_24px_-12px_rgba(99,91,255,0.9)] transition-all hover:bg-aurora-primary-ink active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                Start with {dsCategories[0]?.title.replace(/^\d+\.\s*/, '') ?? 'Arrays'}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('visualizer')}
                className="inline-flex items-center gap-2 rounded-xl border border-aurora-border bg-aurora-surface px-4 py-2.5 text-xs font-bold text-aurora-text shadow-aurora-sm transition-colors hover:border-aurora-primary/30 hover:text-aurora-primary"
              >
                <Layers className="h-4 w-4" />
                Open the Observatory
              </button>
            </div>
          </div>

          {/* Real catalog stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Curriculum topics', value: categories.length, hint: `${dsTopics} structures · ${algoTopics} algorithm families`, accent: 'text-aurora-primary' },
              { label: 'Guided visualizers', value: fullCatalog.length, hint: 'Each with a step-by-step trace', accent: 'text-aurora-secondary' },
              { label: 'Beginner-friendly', value: beginnerVisualizers, hint: 'Start without prerequisites', accent: 'text-aurora-accent' },
              { label: 'Learning tracks', value: 2, hint: 'Data structures, then algorithms', accent: 'text-aurora-primary' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-aurora-border bg-aurora-surface p-4 shadow-aurora-sm"
              >
                <span className={`block font-heading text-2xl font-extrabold ${stat.accent}`}>
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-[11px] font-bold text-aurora-text">
                  {stat.label}
                </span>
                <span className="mt-1 block text-[10px] leading-snug text-aurora-muted">
                  {stat.hint}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning pathway */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {START_HERE.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex gap-3 rounded-2xl border border-aurora-border bg-white/70 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aurora-primary-soft text-aurora-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-aurora-primary/70">
                    Step {item.step}
                  </span>
                  <h2 className="text-xs font-bold text-aurora-text">{item.title}</h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-aurora-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="mt-6 rounded-2xl border border-aurora-border bg-aurora-surface p-4 shadow-aurora-sm sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-aurora-muted" />
            <input
              id="curriculum-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a topic, algorithm, or concept — try 'sliding window'"
              className="w-full rounded-xl border border-aurora-border bg-aurora-bg py-3 pl-11 pr-24 text-sm text-aurora-text outline-none transition-all placeholder:text-aurora-muted/70 focus:border-aurora-primary/40 focus:bg-white focus:ring-2 focus:ring-aurora-primary/15"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-aurora-border bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-aurora-muted">
              Ctrl K
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-aurora-muted/70">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Track
            </span>
            {([
              { id: 'all', label: 'All topics', count: categories.length },
              { id: 'ds', label: 'Data structures', count: dsTopics },
              { id: 'algo', label: 'Algorithms', count: algoTopics },
            ] as const).map((scope) => (
              <button
                key={scope.id}
                type="button"
                onClick={() => setScopeFilter(scope.id)}
                aria-pressed={scopeFilter === scope.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  scopeFilter === scope.id
                    ? 'bg-aurora-primary text-white shadow-sm'
                    : 'bg-aurora-bg text-aurora-muted hover:text-aurora-text'
                }`}
              >
                {scope.label}
                <span
                  className={`rounded-full px-1.5 text-[9px] ${
                    scopeFilter === scope.id ? 'bg-white/20' : 'bg-white text-aurora-muted'
                  }`}
                >
                  {scope.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-aurora-border/80 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-aurora-muted/70">
              Level
            </span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as LevelFilter[]).map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLevelFilter(level)}
                  aria-pressed={levelFilter === level}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    levelFilter === level
                      ? 'border-aurora-primary/30 bg-aurora-primary-soft text-aurora-primary'
                      : 'border-aurora-border bg-white text-aurora-muted hover:text-aurora-text'
                  }`}
                >
                  {LEVEL_LABEL[level]}
                </button>
              ),
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-aurora-primary hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          <p className="mt-3 text-[11px] text-aurora-muted">
            Showing <strong className="text-aurora-text">{filteredCategories.length}</strong>{' '}
            topics and{' '}
            <strong className="text-aurora-text">{matchingVisualizers}</strong>{' '}
            matching visualizers. Every card opens a working visualization.
          </p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-aurora-border bg-aurora-surface px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-aurora-muted/50" />
            <h2 className="mt-3 text-base font-bold text-aurora-text">
              No topics match those filters
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-aurora-muted">
              Try a broader search term, switch the track, or reset the level filter.
              The full catalog has {categories.length} topics and {fullCatalog.length}{' '}
              visualizers.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-aurora-primary px-4 py-2 text-xs font-bold text-white hover:bg-aurora-primary-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Show all topics
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {dsCategories.length > 0 && (
              <div id="part-1-data-structures" className="scroll-mt-24">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-aurora-border pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-aurora-primary">
                      Part 1 · Foundations
                    </span>
                    <h2 className="mt-1 font-heading text-2xl font-extrabold text-aurora-text">
                      Data structures
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-aurora-muted">
                      Learn how data is stored, linked, indexed and balanced. These are
                      the building blocks the algorithm track assumes you know.
                    </p>
                  </div>
                  <span className="rounded-full bg-aurora-primary-soft px-3 py-1 text-[10px] font-bold text-aurora-primary">
                    {dsCategories.length} of {dsTopics} topics shown
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {dsCategories.map((cat) => renderCategoryCard(cat, 'violet'))}
                </div>
              </div>
            )}

            {algoCategories.length > 0 && (
              <div id="part-2-algorithms" className="scroll-mt-24">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-aurora-border pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-aurora-secondary">
                      Part 2 · Applications
                    </span>
                    <h2 className="mt-1 font-heading text-2xl font-extrabold text-aurora-text">
                      Algorithms
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-aurora-muted">
                      Apply the foundations to searching, sorting, graphs, dynamic
                      programming and constraint problems. Each family starts with a
                      beginner-level visualizer.
                    </p>
                  </div>
                  <span className="rounded-full bg-aurora-secondary-soft px-3 py-1 text-[10px] font-bold text-aurora-secondary">
                    {algoCategories.length} of {algoTopics} topics shown
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {algoCategories.map((cat) => renderCategoryCard(cat, 'teal'))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Closing guidance */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-aurora-border bg-gradient-to-r from-aurora-primary-soft via-white to-aurora-secondary-soft p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-aurora-primary shadow-aurora-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-aurora-text">
                Not sure where to begin?
              </h2>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-aurora-muted">
                Start with Arrays &amp; Patterns. Once two pointers and sliding windows
                feel natural, move to Hashing, then Trees and Graphs. The numbering in
                each title follows that recommended order.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('solver')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-aurora-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-aurora-primary-ink"
          >
            Try a guided problem
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
