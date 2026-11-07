# Aurora Learning — Redesign Change Review

This document lists every design/UX/content change made so far. Use it as the
review checklist before pushing to GitHub.

- **Project:** `AlgoviZ_CLONE_FRESH/frontend`
- **Baseline for diffs:** `DSA-vis/frontend` (the original copy)
- **Theme:** Aurora Learning light theme only (no dark/light toggle)
- **Build check:** `npx tsc -b` passes · `npm run build` to re-verify

> ⚠️ `AlgoviZ_CLONE_FRESH/` is currently **untracked** in the parent git repo,
> so VS Code Source Control shows the whole project as new files. Side-by-side
> diffs below are opened against the `DSA-vis` baseline.

---

## 1. Theme & global styling

| File | Change |
| --- | --- |
| `src/index.css` | Aurora `@theme` tokens (`#F5F7FF` bg, `#FFFFFF` surface, `#635BFF` primary, `#22B8A7` teal, `#FF9B54` orange, `#172554` text, `#64748B` muted, `#E5E7F0` border). Legacy shadcn `:root` variables remapped to Aurora so old components inherit the palette. Aurora shadows, scrollbar and base typography. |
| `src/index.css` | **Critical fix:** `@custom-variant dark (&:where(.dark, .dark *));` — stops Tailwind `dark:` utilities from activating from the OS dark-mode preference. This was rendering `bg-white/5` + `text-white/40` on a light page (white-on-white boxes/text). |
| `src/index.css` | Added readable ink tokens: `--color-aurora-secondary-ink` (`#0F8A7D`) and `--color-aurora-accent-ink` (`#B45A12`). |
| `src/App.tsx` | Forces light mode (`document.documentElement.classList.remove('dark')`, `algoviz_theme = 'light'`). Shell now uses `AppSidebar` + utility-only `Navbar`. StarfieldCanvas removed from the shell. |
| `public/aurora-logo.svg` | **NEW** Aurora logo mark (the old `logo.svg` is left in place). |

## 2. Navigation

| File | Change |
| --- | --- |
| `src/components/layout/AppSidebar.tsx` | **NEW** icon rail: 72px collapsed, expands to ~250px on hover, pin/unpin persisted, tooltips, active-state indicators. Mobile drawer with overlay, Escape to close, closes on navigate. |
| `src/components/layout/Navbar.tsx` | Reduced to header utilities only: global search (`Ctrl/Cmd+K`), Ask AI, audio, profile/login. Duplicate nav links removed. Theme toggle removed. |

## 3. Home (`src/pages/HomePage.tsx`)

- New hero, honest stats derived from the real registry, sign-in gateway, learning loop, popular starting points, reasoning section, showcase header and CTA.
- Removed terminal/dark styling; launch IDs corrected so cards open real visualizers.
- Fixed showcase contrast: out-of-window cells now use `aurora-bg`/`aurora-text`, in-window cells use `aurora-primary-soft`/`aurora-primary-ink`, readable index labels, darker badge/metric text, Aurora pointer pills.

## 4. Curriculum (`src/pages/TopicsPage.tsx`)

- Rebuilt with the real catalog: **20 categories** (12 DS + 8 algorithms), **58 catalog visualizers**, derived counts (replaced the old 114/84/30 claims).
- Level filtering, learning objectives, analogies, subtopic lists, prerequisites, difficulty, visualizer counts and a clear path to the visualization.
- Featured launch algorithms mapped per category so every card opens a valid visualizer.
- Proper empty state when a filter matches nothing.

## 5. Observatory (`src/pages/VisualizerPage.tsx` + `src/components/visualization/*`)

| File | Change |
| --- | --- |
| `VisualizerPage.tsx` | Aurora shell, clearer running-algorithm header, paused/playing states, toolbar, canvas wrapper, mobile drawer. Execution logic untouched. |
| `ExplanationPanel.tsx` | Aurora header, step/code tabs, notes, complexity, learning prompts, analogy. |
| `PlaybackControls.tsx` | Light transport bar, violet play button, speed presets, tooltips; keyboard shortcuts preserved (Space / ← / → / R / M). |
| `StatsCard.tsx` | Aurora container + accuracy fixes: load factor `—`, placements `0`, Hanoi from `moveCount/totalMoves`, bit operands `—`, space sublabel. |
| `Legend.tsx` | Aurora legend chip row; removed dark-only colors. |
| `WhyPopup.tsx` | Light step-reason popup with rule badge, "More why" expander, Ask AI. |
| `StepLogPanel.tsx` | Aurora step log with jump-to-step rows and passed-step dimming. |
| `InputPanel.tsx` | Aurora input bar: presets, randomize, custom array/target, validation banner. |
| `ComplexityChart.tsx` | Aurora tooltip/empty state. |

## 6. Compare (`src/pages/ComparePage.tsx`)

- Fully rebuilt. Four presets (Two Sum, Max Subarray, Sorted Search, Contains Duplicate) each run **real traces** for both solutions.
- Removed hardcoded Two Sum simulation, fabricated benchmark rows, "Synchronized Seed" and the "14x" claim.
- Scaling table computed from complexity formulas and explicitly labelled as derived counts.
- Input validation, randomization, shared playback, honest verdict text.

## 7. Contests (`src/pages/ContestPage.tsx`) — **NEW file**

- Aurora layout with real schedule fields, derived counts and filters, status-aware timer.
- Removed "Spring 2026 Season", "Verified Rankings", fake 48/48 and 94.2% claims, and the always-pass sample runner.
- "Run Sample Tests" replaced by an honest **Local readiness check** that never executes code.
- Submission sends `passCount: 0, totalTests: 3` and states no judge runs here.
- Leaderboard shows exactly what the API returns; empty state instead of client-side fallbacks.

## 8. Problem Solver (`src/pages/ProblemSolverPage.tsx`)

- ⚠️ **Not redesigned yet.** Still uses the old dark terminal styling and still contains the
  "AST Parser · Memory Simulator" copy, the hardcoded `[4,7,2,9,1,5,8]` fallback and the
  fallback Two Sum code. The `/api/chat` `problem-solver` + `ocr-extract` flows and
  `ProblemPlanSchema` contract are unchanged.

---

## Files changed (vs `DSA-vis/frontend`)

| File | Diff |
| --- | --- |
| `src/index.css` | +77 / −22 |
| `src/App.tsx` | +68 / −69 |
| `src/components/layout/AppSidebar.tsx` | **NEW** |
| `src/components/layout/Navbar.tsx` | +223 / −232 |
| `src/components/visualization/ExplanationPanel.tsx` | +81 / −62 |
| `src/components/visualization/PlaybackControls.tsx` | +79 / −80 |
| `src/components/visualization/StatsCard.tsx` | +13 / −13 |
| `src/components/visualization/Legend.tsx` | +7 / −7 |
| `src/components/visualization/WhyPopup.tsx` | +56 / −55 |
| `src/components/visualization/StepLogPanel.tsx` | +23 / −20 |
| `src/components/visualization/InputPanel.tsx` | +36 / −28 |
| `src/components/visualization/ComplexityChart.tsx` | +6 / −5 |
| `src/pages/HomePage.tsx` | +264 / −206 |
| `src/pages/TopicsPage.tsx` | +561 / −461 |
| `src/pages/VisualizerPage.tsx` | +111 / −93 |
| `src/pages/ComparePage.tsx` | +1100 / −609 |
| `src/pages/ContestPage.tsx` | **NEW** |
| `public/aurora-logo.svg` | **NEW** |

## Verification checklist

- [ ] `npx tsc -b` passes (last run: pass)
- [ ] `npm run build` passes
- [ ] Home, Topics, Visualizer, Compare, Contests, Problem Solver all load
- [ ] Signed-out and signed-in states
- [ ] Sidebar collapsed / expanded / pinned / mobile drawer
- [ ] `Ctrl/Cmd+K`, Ask AI, audio toggle, profile/logout
- [ ] No horizontal overflow at 375px and 1440px
- [ ] Sliding-window / DP showcase text visible (dark-variant fix)

## Known limitations to disclose

- No code judge in this build: Contest submissions are recorded without claimed test passes.
- Compare counts are teaching traces, not wall-clock benchmarks.
- Problem Solver page still needs the Aurora redesign described in section 8.
