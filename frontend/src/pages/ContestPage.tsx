import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  Search,
  Terminal,
  Code2,
  Users,
  Timer,
  Send,
  X,
  BookOpen,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavView } from '../components/layout/Navbar';

export interface ContestQuestion {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  statement: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  topic: string;
  branchEligibility: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: 'live' | 'upcoming' | 'completed';
  totalPoints: number;
  createdBy: string;
  questions: ContestQuestion[];
}

export interface ContestSubmission {
  contestId: string;
  collegeId: string;
  name: string;
  rollNumber: string;
  branch: string;
  score: number;
  problemsSolved: number;
  totalProblems: number;
  penaltyTime: string;
  rank: number;
  status: string;
  submittedAt: string;
}

interface ContestPageProps {
  onNavigate: (view: NavView) => void;
}

const STATUS_LABEL: Record<Contest['status'], string> = {
  live: 'Live now',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

function formatDate(value: string | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ContestPage: React.FC<ContestPageProps> = ({ onNavigate: _onNavigate }) => {
  const { user, token, isAdmin, openAdminDashboard } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active Contest Arena Modal State
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'Python' | 'C++' | 'Java' | 'JavaScript'>('Python');
  const [userCode, setUserCode] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'running' | 'passed' | 'failed';
    message: string;
    output?: string;
  }>({
    status: 'idle',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contestSecondsRemaining, setContestSecondsRemaining] = useState(90 * 60);
  const [leaderboard, setLeaderboard] = useState<ContestSubmission[]>([]);
  const [arenaTab, setArenaTab] = useState<'problem' | 'leaderboard'>('problem');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Default code templates per language
  const starterCodeTemplates: Record<string, string> = {
    Python: `def solve_problem(nums, k):\n    # Write your solution here.\n    # State the invariant you rely on in a comment.\n    result = []\n    for value in nums:\n        result.append(value)\n    return result\n`,
    'C++': `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solveProblem(vector<int>& nums, int k) {\n        // Write your solution here.\n        vector<int> result;\n        return result;\n    }\n};\n`,
    Java: `import java.util.*;\n\npublic class Solution {\n    public int[] solveProblem(int[] nums, int k) {\n        // Write your solution here.\n        return new int[]{};\n    }\n}\n`,
    JavaScript: `function solveProblem(nums, k) {\n  // Write your solution here.\n  const result = [];\n  return result;\n}\n`,
  };

  // Fetch contests from backend API
  const fetchContests = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const resp = await fetch('/api/contests');
      if (resp.ok) {
        const data = await resp.json();
        if (data.contests) setContests(data.contests);
      } else {
        setLoadError('The contests service did not respond successfully. Try again in a moment.');
      }
    } catch (e) {
      console.error('Failed to load contests:', e);
      setLoadError('Could not reach the contests service. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  // Timer countdown inside a live arena only
  useEffect(() => {
    if (!activeContest || activeContest.status !== 'live') return;
    const interval = setInterval(() => {
      setContestSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeContest]);

  // Close the arena with Escape
  useEffect(() => {
    if (!activeContest) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveContest(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeContest]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnterContest = async (contest: Contest) => {
    setActiveContest(contest);
    setSelectedQuestionIndex(0);
    setUserCode(starterCodeTemplates[selectedLanguage]);
    setTestResult({ status: 'idle', message: '' });
    setSubmissionSuccess(false);
    setContestSecondsRemaining(contest.durationMinutes * 60);
    setArenaTab('problem');
    setLeaderboard([]);

    // Fetch leaderboard
    try {
      const resp = await fetch(`/api/contests/${contest.id}/leaderboard`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
    }
  };

  const handleLanguageChange = (lang: 'Python' | 'C++' | 'Java' | 'JavaScript') => {
    setSelectedLanguage(lang);
    setUserCode(starterCodeTemplates[lang]);
    setTestResult({ status: 'idle', message: '' });
  };

  /**
   * There is no code-execution service in this build, so this is an honest
   * local readiness check instead of a fake "all tests passed" result.
   */
  const handleLocalCheck = () => {
    const trimmed = userCode.trim();
    setTestResult({ status: 'running', message: 'Running local readiness check…' });

    setTimeout(() => {
      if (!trimmed) {
        setTestResult({
          status: 'failed',
          message: 'The editor is empty.',
          output: 'Add your solution before checking readiness.',
        });
        return;
      }

      const hasBody = trimmed.split('\n').filter((line) => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#')).length > 3;
      const hasReturn = /\breturn\b/.test(trimmed);

      if (!hasBody || !hasReturn) {
        setTestResult({
          status: 'failed',
          message: 'The solution still looks like a stub.',
          output: [
            hasBody ? '• Body present' : '• Add more than a comment and an empty container',
            hasReturn ? '• Return statement present' : '• Add a return statement',
            'This check never executes your code.',
          ].join('\n'),
        });
        return;
      }

      setTestResult({
        status: 'passed',
        message: 'Local readiness check passed.',
        output: [
          '• Code is non-empty',
          '• A return statement is present',
          '• No test cases were executed — this environment has no judge.',
        ].join('\n'),
      });
    }, 350);
  };

  const handleSubmitSolution = async () => {
    if (!activeContest) return;
    setIsSubmitting(true);
    setTestResult({ status: 'running', message: 'Recording your submission…' });

    try {
      const activeQ = activeContest.questions[selectedQuestionIndex];
      const resp = await fetch('/api/contests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contestId: activeContest.id,
          questionId: activeQ?.id || 'q1',
          code: userCode,
          language: selectedLanguage,
          // No judge runs here, so no passes are claimed.
          passCount: 0,
          totalTests: 3,
        }),
      });

      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setSubmissionSuccess(true);
        setTestResult({
          status: 'passed',
          message: 'Attempt recorded on the server.',
          output: [
            'Your submission was stored with the contest.',
            'No judge is configured in this environment, so no test passes or score were claimed.',
            typeof data?.scoreAwarded === 'number' ? `Server-recorded score: ${data.scoreAwarded}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        });

        // Refresh leaderboard
        const lbResp = await fetch(`/api/contests/${activeContest.id}/leaderboard`);
        if (lbResp.ok) {
          const lbData = await lbResp.json();
          if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
        }
      } else {
        setTestResult({
          status: 'failed',
          message: 'The server rejected the submission. Please try again.',
        });
      }
    } catch {
      setTestResult({
        status: 'failed',
        message: 'Network error submitting the attempt.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContests = contests.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      c.topic.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const liveContestCount = contests.filter((c) => c.status === 'live').length;
  const upcomingContestCount = contests.filter((c) => c.status === 'upcoming').length;
  const completedContestCount = contests.filter((c) => c.status === 'completed').length;

  const activeQuestion = activeContest?.questions?.[selectedQuestionIndex];

  const fieldClass =
    'w-full rounded-xl border border-aurora-border bg-aurora-bg px-3 py-2 text-xs text-aurora-text outline-none transition-all focus:border-aurora-primary/40 focus:bg-white focus:ring-2 focus:ring-aurora-primary/15';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-aurora-bg pb-16 text-aurora-text">
      {/* Soft atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[22rem] w-[60rem] -translate-x-1/2 rounded-full bg-aurora-primary/8 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-aurora-accent/8 blur-[100px]" />

      {/* Header */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-aurora-muted">
            <span className="inline-flex items-center gap-1.5 text-aurora-primary">
              <Trophy className="h-3.5 w-3.5" />
              Practice
            </span>
            <span className="text-aurora-border">/</span>
            <span className="text-aurora-text">Contests</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-aurora-border bg-white px-3.5 py-1.5 text-[11px] font-semibold shadow-aurora-sm">
            <span
              className={`h-2 w-2 rounded-full ${liveContestCount > 0 ? 'bg-emerald-500' : 'bg-aurora-muted/40'}`}
            />
            <span className="text-aurora-text">
              {liveContestCount} contest{liveContestCount === 1 ? '' : 's'} live
            </span>
            <span className="text-aurora-border">•</span>
            <span className="text-aurora-muted">
              {contests.length} listed by the server
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-aurora-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-primary">
              <Trophy className="h-3.5 w-3.5" />
              Timed practice
            </span>
            <h1 className="mt-3 max-w-2xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-aurora-text sm:text-4xl">
              Practice under a clock.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-aurora-muted sm:text-base">
              Contests published by your faculty appear here with their real schedule, problem set
              and server leaderboard. Open one to read the statement, write a solution, and record
              an attempt.
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3 rounded-2xl border border-aurora-border bg-white p-4 shadow-aurora-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora-primary-soft text-aurora-primary">
                <Award className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-[11px] font-bold uppercase tracking-wider text-aurora-muted">
                  Signed in as
                </span>
                <span className="block truncate text-sm font-bold text-aurora-text">
                  {(user as any)?.name || (user as any)?.rollNumber || 'Campus candidate'}
                </span>
                <span className="block text-[11px] text-aurora-muted">
                  {(user as any)?.branch || (isAdmin ? 'Administrator' : 'Student')}
                  {(user as any)?.section ? ` · Section ${(user as any).section}` : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-aurora-border bg-white p-4 shadow-aurora-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-muted">
                <Info className="h-3.5 w-3.5 text-aurora-primary" />
                Sign in required
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-aurora-muted">
                You can browse contests without signing in. Submitting an attempt needs an
                authenticated student account so the entry can be attached to you.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'All contests', value: contests.length, hint: 'Published by faculty' },
            { label: 'Live now', value: liveContestCount, hint: 'Timer running' },
            { label: 'Upcoming', value: upcomingContestCount, hint: 'Scheduled ahead' },
            { label: 'Completed', value: completedContestCount, hint: 'Archive and standings' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-aurora-border bg-white p-4 shadow-aurora-sm">
              <span className="font-heading text-2xl font-extrabold text-aurora-primary">{stat.value}</span>
              <span className="mt-0.5 block text-[11px] font-bold text-aurora-text">{stat.label}</span>
              <span className="mt-1 block text-[10px] leading-snug text-aurora-muted">{stat.hint}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-4 sm:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-aurora-border bg-white p-3 shadow-aurora-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-aurora-bg p-1">
            {(
              [
                { id: 'all', label: 'All', count: contests.length },
                { id: 'live', label: 'Live', count: liveContestCount },
                { id: 'upcoming', label: 'Upcoming', count: upcomingContestCount },
                { id: 'completed', label: 'Completed', count: completedContestCount },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFilterStatus(filter.id)}
                aria-pressed={filterStatus === filter.id}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  filterStatus === filter.id
                    ? 'bg-white text-aurora-primary shadow-sm'
                    : 'text-aurora-muted hover:text-aurora-text'
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-1.5 text-[9px] ${
                    filterStatus === filter.id ? 'bg-aurora-primary-soft' : 'bg-white'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex w-full items-center rounded-xl border border-aurora-border bg-aurora-bg px-3 py-2 sm:max-w-xs">
            <Search className="mr-2 h-4 w-4 shrink-0 text-aurora-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search contests or topics…"
              className="w-full bg-transparent text-xs text-aurora-text outline-none placeholder:text-aurora-muted/70"
            />
          </div>
        </div>
      </section>

      {/* Contest list */}
      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
        {isLoading ? (
          <div className="rounded-2xl border border-aurora-border bg-white px-6 py-16 text-center text-xs text-aurora-muted">
            Loading contests from the server…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-amber-600" />
            <h3 className="mt-2 text-sm font-bold text-amber-900">Could not load contests</h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-amber-800">{loadError}</p>
            <button
              type="button"
              onClick={fetchContests}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              Try again
            </button>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-aurora-border bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora-bg text-aurora-muted">
              <Trophy className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-aurora-text">
              {searchQuery
                ? 'No contests match your search'
                : filterStatus !== 'all'
                  ? `No ${STATUS_LABEL[filterStatus].toLowerCase()} contests right now`
                  : 'No contests have been published yet'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-aurora-muted">
              {searchQuery
                ? 'Try a different keyword, or clear the search to see every contest.'
                : 'Contests appear here as soon as faculty publish them from the admin console. Nothing is invented client-side.'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-aurora-border bg-white px-4 py-2 text-xs font-bold text-aurora-text hover:border-aurora-primary/30 hover:text-aurora-primary"
              >
                Clear filters
              </button>
            )}
            {!searchQuery && filterStatus === 'all' && isAdmin && (
              <button
                type="button"
                onClick={() => openAdminDashboard()}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-aurora-primary px-4 py-2 text-xs font-bold text-white hover:bg-aurora-primary-ink"
              >
                <Trophy className="h-4 w-4" />
                Create a contest in the admin console
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContests.map((contest) => {
              const isLive = contest.status === 'live';
              const questionCount = contest.questions?.length ?? 0;
              return (
                <article
                  key={contest.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-aurora-sm transition-all hover:-translate-y-0.5 hover:shadow-aurora-md ${
                    isLive ? 'border-emerald-300' : 'border-aurora-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isLive
                            ? 'bg-emerald-50 text-emerald-700'
                            : contest.status === 'upcoming'
                              ? 'bg-aurora-primary-soft text-aurora-primary'
                              : 'bg-aurora-bg text-aurora-muted'
                        }`}
                      >
                        {isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        {STATUS_LABEL[contest.status]}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-aurora-muted">
                        <Clock className="h-3 w-3" />
                        {contest.durationMinutes} min
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-base font-bold leading-snug text-aurora-text">
                      {contest.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-aurora-muted">
                      {contest.description}
                    </p>

                    <div className="mt-3 space-y-1.5 rounded-xl border border-aurora-border bg-aurora-bg/70 p-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-aurora-muted">Topic</span>
                        <span className="font-bold text-aurora-primary">{contest.topic}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-aurora-muted">Problems</span>
                        <span className="font-bold text-aurora-text">
                          {questionCount} · {contest.totalPoints} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-aurora-muted">Eligibility</span>
                        <span className="max-w-[60%] truncate text-right font-bold text-aurora-text">
                          {contest.branchEligibility || 'All branches'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-aurora-muted">Starts</span>
                        <span className="text-aurora-text">{formatDate(contest.startTime)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-aurora-muted">Ends</span>
                        <span className="text-aurora-text">{formatDate(contest.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-aurora-border pt-3">
                    <span className="truncate text-[10px] text-aurora-muted">
                      By {contest.createdBy || 'Faculty'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEnterContest(contest)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold text-white shadow-sm transition-all active:scale-[0.98] ${
                        isLive
                          ? 'bg-aurora-secondary hover:bg-[#159c8e]'
                          : 'bg-aurora-primary hover:bg-aurora-primary-ink'
                      }`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      {isLive ? 'Enter arena' : 'Open contest'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= CONTEST ARENA MODAL ================= */}
      {activeContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-text/30 p-2 backdrop-blur-sm sm:p-4">
          <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-aurora-border bg-white shadow-aurora-md">
            {/* Arena header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-aurora-border bg-aurora-bg px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aurora-primary-soft text-aurora-primary">
                  <Trophy className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="max-w-md truncate text-sm font-extrabold text-aurora-text sm:text-base">
                      {activeContest.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        activeContest.status === 'live'
                          ? 'bg-emerald-50 text-emerald-700'
                          : activeContest.status === 'upcoming'
                            ? 'bg-aurora-primary-soft text-aurora-primary'
                            : 'bg-white text-aurora-muted'
                      }`}
                    >
                      {STATUS_LABEL[activeContest.status]}
                    </span>
                  </div>
                  <p className="truncate font-mono text-[10px] text-aurora-muted">
                    {activeContest.topic} · {activeContest.questions?.length ?? 0} problems ·{' '}
                    {activeContest.totalPoints} pts
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeContest.status === 'live' ? (
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-700">
                    <Timer className="h-3.5 w-3.5" />
                    <span>{formatTimer(contestSecondsRemaining)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-xl border border-aurora-border bg-white px-3 py-1.5 font-mono text-[11px] text-aurora-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {activeContest.status === 'upcoming'
                        ? `Starts ${formatDate(activeContest.startTime)}`
                        : `Ended ${formatDate(activeContest.endTime)}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 rounded-xl border border-aurora-border bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setArenaTab('problem')}
                    className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                      arenaTab === 'problem'
                        ? 'bg-aurora-primary text-white'
                        : 'text-aurora-muted hover:text-aurora-text'
                    }`}
                  >
                    Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setArenaTab('leaderboard')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                      arenaTab === 'leaderboard'
                        ? 'bg-aurora-primary text-white'
                        : 'text-aurora-muted hover:text-aurora-text'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Leaderboard ({leaderboard.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveContest(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-aurora-border bg-white text-aurora-muted transition-colors hover:bg-aurora-bg hover:text-aurora-text"
                  aria-label="Close contest arena"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Arena body */}
            {arenaTab === 'problem' ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                {/* Left: statement */}
                <div className="h-full w-full space-y-4 overflow-y-auto border-r border-aurora-border p-4 sm:p-5 lg:w-[45%]">
                  {!activeContest.questions || activeContest.questions.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <BookOpen className="mx-auto h-10 w-10 text-aurora-muted/50" />
                      <h4 className="mt-2 text-sm font-bold text-aurora-text">No problems attached yet</h4>
                      <p className="mt-1 max-w-sm text-xs leading-relaxed text-aurora-muted">
                        The organizer has not released the problem statements for this contest.
                        Check back after the start time.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 border-b border-aurora-border pb-3">
                        {activeContest.questions.map((question, index) => (
                          <button
                            key={question.id}
                            type="button"
                            onClick={() => {
                              setSelectedQuestionIndex(index);
                              setTestResult({ status: 'idle', message: '' });
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-[11px] font-bold transition-colors ${
                              selectedQuestionIndex === index
                                ? 'bg-aurora-primary text-white'
                                : 'bg-aurora-bg text-aurora-muted hover:text-aurora-text'
                            }`}
                          >
                            Problem {String.fromCharCode(65 + index)}
                            <span className="text-[9px] opacity-80">{question.points} pts</span>
                          </button>
                        ))}
                      </div>

                      {activeQuestion && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                                  activeQuestion.difficulty === 'Easy'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : activeQuestion.difficulty === 'Medium'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {activeQuestion.difficulty}
                              </span>
                              <span className="font-mono text-[10px] text-aurora-muted">
                                Topic: {activeQuestion.topic} · {activeQuestion.points} pts
                              </span>
                            </div>
                            <h3 className="mt-1.5 text-lg font-extrabold text-aurora-text">
                              {activeQuestion.title}
                            </h3>
                          </div>

                          <div className="space-y-1.5 rounded-xl border border-aurora-border bg-aurora-bg/70 p-3.5 text-xs leading-relaxed text-aurora-text/90">
                            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-aurora-muted">
                              Statement
                            </span>
                            <p className="whitespace-pre-wrap">{activeQuestion.statement || 'No statement provided.'}</p>
                          </div>

                          {activeQuestion.constraints && (
                            <div className="space-y-1.5 rounded-xl border border-aurora-border bg-white p-3.5">
                              <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-aurora-muted">
                                Constraints
                              </span>
                              <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-aurora-text/80">
                                {activeQuestion.constraints}
                              </p>
                            </div>
                          )}

                          {(activeQuestion.sampleInput || activeQuestion.sampleOutput) && (
                            <div className="space-y-2">
                              <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-aurora-muted">
                                Provided sample
                              </span>
                              <div className="space-y-1.5 rounded-xl border border-aurora-border bg-aurora-bg/70 p-3 font-mono text-[11px]">
                                {activeQuestion.sampleInput && (
                                  <div>
                                    <span className="font-bold text-aurora-primary">Input: </span>
                                    <span className="whitespace-pre-wrap text-aurora-text">
                                      {activeQuestion.sampleInput}
                                    </span>
                                  </div>
                                )}
                                {activeQuestion.sampleOutput && (
                                  <div>
                                    <span className="font-bold text-aurora-secondary">Expected output: </span>
                                    <span className="whitespace-pre-wrap text-aurora-text">
                                      {activeQuestion.sampleOutput}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-aurora-muted">
                                This is the only sample published with the problem. It is not executed
                                by this page.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right: editor */}
                <div className="flex h-full w-full flex-col bg-white lg:w-[55%]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-aurora-border bg-aurora-bg px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-aurora-primary" />
                      <span className="font-mono text-[11px] font-bold text-aurora-text">
                        Your solution
                      </span>
                    </div>

                    <select
                      value={selectedLanguage}
                      onChange={(event) => handleLanguageChange(event.target.value as typeof selectedLanguage)}
                      className="cursor-pointer rounded-lg border border-aurora-border bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-aurora-text outline-none"
                    >
                      <option value="Python">Python 3</option>
                      <option value="C++">C++ 20</option>
                      <option value="Java">Java 17</option>
                      <option value="JavaScript">JavaScript (ES6)</option>
                    </select>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col p-3">
                    <textarea
                      value={userCode}
                      onChange={(event) => setUserCode(event.target.value)}
                      spellCheck={false}
                      className="min-h-[200px] w-full flex-1 resize-none rounded-xl border border-aurora-border bg-aurora-bg/60 p-3 font-mono text-xs leading-relaxed text-aurora-text outline-none focus:border-aurora-primary/40 focus:bg-white focus:ring-2 focus:ring-aurora-primary/15"
                      aria-label="Solution code editor"
                    />
                    <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-aurora-muted">
                      <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-aurora-accent" />
                      This build has no judge: your code is not compiled or executed. Submitting
                      records the attempt without claiming test passes.
                    </p>
                  </div>

                  {testResult.status !== 'idle' && (
                    <div className="border-t border-aurora-border bg-aurora-bg/60 px-3.5 py-2.5 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        {testResult.status === 'running' && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                        {testResult.status === 'passed' && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {testResult.status === 'failed' && (
                          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        )}
                        <span
                          className={`font-bold ${
                            testResult.status === 'passed'
                              ? 'text-emerald-700'
                              : testResult.status === 'failed'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {testResult.message}
                        </span>
                      </div>
                      {testResult.output && (
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-aurora-muted">
                          {testResult.output}
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-aurora-border bg-white px-3 py-2.5">
                    <button
                      type="button"
                      onClick={handleLocalCheck}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-aurora-border bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-aurora-text transition-colors hover:border-aurora-primary/30 hover:text-aurora-primary"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      Local readiness check
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitSolution}
                      disabled={isSubmitting || !token}
                      title={!token ? 'Sign in to submit an attempt' : undefined}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-aurora-secondary px-4 py-2 font-mono text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#159c8e] disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSubmitting ? 'Recording…' : 'Submit attempt'}
                    </button>
                  </div>

                  {submissionSuccess && (
                    <div className="flex items-start gap-2 border-t border-aurora-border bg-aurora-secondary-soft px-3.5 py-2 text-[10px] leading-relaxed text-aurora-text">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-aurora-secondary" />
                      <span>
                        Attempt stored for this contest. No score or test pass was claimed because
                        no judge is configured.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Leaderboard tab */
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-aurora-text">Leaderboard</h3>
                    <p className="mt-0.5 font-mono text-[10px] text-aurora-muted">
                      Served by the contests API. Rows are shown exactly as returned — nothing is
                      re-ranked or filled in on the client.
                    </p>
                  </div>
                  <span className="rounded-full bg-aurora-bg px-2.5 py-0.5 font-mono text-[10px] font-bold text-aurora-muted">
                    {leaderboard.length} entr{leaderboard.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-aurora-border bg-white px-6 py-14 text-center">
                    <Users className="mx-auto h-7 w-7 text-aurora-muted/50" />
                    <h4 className="mt-2 text-sm font-bold text-aurora-text">No submissions yet</h4>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-aurora-muted">
                      The leaderboard fills as students submit attempts for this contest.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-aurora-border">
                    <table className="w-full min-w-[720px] text-left font-mono text-[11px]">
                      <thead className="border-b border-aurora-border bg-aurora-bg text-[10px] uppercase tracking-wider text-aurora-muted">
                        <tr>
                          <th className="p-3">Rank</th>
                          <th className="p-3">Student</th>
                          <th className="p-3">Roll number</th>
                          <th className="p-3">Branch</th>
                          <th className="p-3">Solved</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Penalty</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-aurora-border/70">
                        {leaderboard.map((submission, index) => (
                          <tr key={`${submission.collegeId}-${index}`} className="hover:bg-aurora-bg/50">
                            <td className="p-3 font-bold text-aurora-text">#{submission.rank || index + 1}</td>
                            <td className="p-3 font-semibold text-aurora-text">{submission.name || '—'}</td>
                            <td className="p-3 text-aurora-primary">{submission.rollNumber || '—'}</td>
                            <td className="p-3 text-aurora-muted">{submission.branch || '—'}</td>
                            <td className="p-3 text-aurora-text">
                              {submission.problemsSolved} / {submission.totalProblems}
                            </td>
                            <td className="p-3 font-bold text-aurora-secondary">{submission.score} pts</td>
                            <td className="p-3 text-aurora-muted">{submission.penaltyTime || '—'}</td>
                            <td className="p-3">
                              <span className="rounded-full bg-aurora-bg px-2 py-0.5 text-[9px] font-bold text-aurora-muted">
                                {submission.status || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
