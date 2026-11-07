import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export type NavView = 'home' | 'topics' | 'visualizer' | 'compare' | 'solver' | 'contests';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenCommandPalette: () => void;
  onOpenChatDrawer?: () => void;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
  onOpenMobileNav: () => void;
}

const VIEW_LABELS: Record<NavView, string> = {
  home: 'Home',
  topics: 'Topics',
  visualizer: 'Observatory',
  solver: 'Solve a Problem',
  compare: 'Compare & Learn',
  contests: 'Contests',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCommandPalette,
  onOpenChatDrawer,
  isAudioMuted = false,
  onToggleAudio,
  onOpenMobileNav,
}) => {
  const { user, isAuthenticated, isAdmin, openLoginModal, openAdminDashboard, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative z-20 flex h-16 w-full shrink-0 items-center gap-2 border-b border-aurora-border bg-aurora-surface/95 px-3 backdrop-blur-xl select-none sm:gap-3 sm:px-5">
      {/* Mobile navigation trigger + compact brand */}
      <div className="flex shrink-0 items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-aurora-text transition-colors hover:bg-aurora-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35"
          aria-label="AlgoViz home"
        >
          <img
            src="/aurora-logo.svg"
            alt=""
            className="h-8 w-8 rounded-lg shadow-aurora-sm ring-1 ring-black/5"
            aria-hidden="true"
          />
          <span className="hidden font-heading text-sm font-extrabold tracking-tight text-aurora-text sm:inline">
            AlgoViz
          </span>
        </button>
      </div>

      {/* Desktop page context */}
      <div className="hidden min-w-0 shrink-0 items-center gap-2.5 md:flex">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-aurora-primary/75">
          Aurora Learning
        </span>
        <span className="h-3.5 w-px bg-aurora-border" aria-hidden="true" />
        <span className="truncate text-[13px] font-semibold text-aurora-text">
          {VIEW_LABELS[currentView]}
        </span>
      </div>

      {/* Search / command palette */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-0.5 sm:px-3">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Search algorithms (Ctrl/Cmd + K)"
              className="group hidden h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-aurora-border bg-aurora-bg px-3.5 text-left transition-all duration-200 hover:border-aurora-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/25 sm:flex"
            >
              <Search className="h-4 w-4 shrink-0 text-aurora-muted transition-colors group-hover:text-aurora-primary" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-aurora-muted">
                Search algorithms, topics, visualizers...
              </span>
              <kbd className="shrink-0 rounded-md border border-aurora-border bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-aurora-muted shadow-xs">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Search algorithms"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-aurora-muted transition-colors hover:bg-aurora-bg hover:text-aurora-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35 sm:hidden"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title="Sign in to search"
            className="hidden h-10 items-center gap-2 rounded-xl border border-aurora-border bg-aurora-bg px-3.5 text-xs font-medium text-aurora-muted transition-colors hover:border-aurora-primary/30 hover:text-aurora-text sm:flex"
          >
            <Lock className="h-3.5 w-3.5 text-aurora-primary" />
            <span>Sign in to explore the curriculum</span>
          </button>
        )}
      </div>

      {/* Utility actions */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        {isAuthenticated && onOpenChatDrawer && (
          <button
            type="button"
            onClick={onOpenChatDrawer}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-aurora-primary px-2.5 text-white shadow-[0_6px_16px_-8px_rgba(99,91,255,0.9)] transition-all duration-200 hover:bg-aurora-primary-ink hover:shadow-[0_8px_20px_-8px_rgba(99,91,255,0.9)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 sm:px-3.5"
            aria-label="Ask AI"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="hidden text-xs font-semibold sm:inline">Ask AI</span>
          </button>
        )}

        {isAuthenticated && onToggleAudio && (
          <button
            type="button"
            onClick={onToggleAudio}
            title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-aurora-muted transition-colors hover:bg-aurora-bg hover:text-aurora-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35"
          >
            {isAudioMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4 text-aurora-secondary" />
            )}
          </button>
        )}

        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => openLoginModal('user')}
            className="ml-0.5 inline-flex h-9 items-center gap-1.5 rounded-xl bg-aurora-primary px-2.5 text-white shadow-[0_6px_16px_-8px_rgba(99,91,255,0.9)] transition-all duration-200 hover:bg-aurora-primary-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 sm:px-3.5"
          >
            <User className="h-4 w-4 shrink-0 sm:hidden" />
            <span className="text-xs font-semibold">Sign In</span>
          </button>
        ) : (
          <div className="relative ml-0.5" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className={cn(
                'flex h-9 items-center gap-2 rounded-xl border bg-white pl-1.5 pr-1.5 transition-all duration-200 sm:pr-2.5',
                'border-aurora-border hover:border-aurora-primary/25 hover:bg-aurora-bg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35',
                isProfileMenuOpen && 'border-aurora-primary/30 bg-aurora-bg',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-xs',
                  isAdmin ? 'bg-aurora-secondary' : 'bg-aurora-primary',
                )}
              >
                {isAdmin ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  (user as any)?.rollNumber?.slice(0, 2) || 'ST'
                )}
              </span>
              <span className="hidden flex-col items-start leading-tight text-left lg:flex">
                <span className="max-w-[90px] truncate text-[11px] font-semibold text-aurora-text">
                  {isAdmin ? (user as any)?.name : (user as any)?.rollNumber}
                </span>
                <span
                  className={cn(
                    'text-[8px] font-bold uppercase tracking-wider',
                    isAdmin ? 'text-aurora-secondary' : 'text-aurora-muted',
                  )}
                >
                  {isAdmin ? 'Admin' : (user as any)?.section || 'Student'}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-aurora-muted transition-transform duration-200',
                  isProfileMenuOpen && 'rotate-180',
                )}
              />
            </button>

            {isProfileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-aurora-border bg-aurora-surface p-2 shadow-aurora-md animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="rounded-xl bg-aurora-bg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-aurora-text">
                      {isAdmin ? (user as any)?.name : (user as any)?.rollNumber}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider',
                        isAdmin
                          ? 'bg-aurora-secondary-soft text-aurora-secondary'
                          : 'bg-aurora-primary-soft text-aurora-primary',
                      )}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-[10px] text-aurora-muted">
                    {user?.email}
                  </p>
                  <p className="truncate font-mono text-[10px] text-aurora-muted">
                    {user?.collegeId}
                  </p>
                  {!isAdmin && (
                    <p className="truncate font-mono text-[10px] text-aurora-muted">
                      {(user as any)?.branch} · {(user as any)?.section}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openAdminDashboard();
                    }}
                    className="mt-1.5 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-aurora-secondary transition-colors hover:bg-aurora-secondary-soft"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Management Console</span>
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
