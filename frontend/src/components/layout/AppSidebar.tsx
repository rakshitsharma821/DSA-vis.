import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BrainCircuit,
  GitCompare,
  GraduationCap,
  Home,
  Layers,
  Lock,
  Pin,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { cn } from '../../lib/utils';
import type { NavView } from './Navbar';

interface AppSidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavView;
  label: string;
  description: string;
  icon: React.ElementType;
  requiresAuth: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Your learning dashboard',
    icon: Home,
    requiresAuth: false,
  },
  {
    id: 'topics',
    label: 'Topics',
    description: 'Browse the DSA curriculum',
    icon: GraduationCap,
    requiresAuth: true,
  },
  {
    id: 'visualizer',
    label: 'Observatory',
    description: 'Visualize every step',
    icon: Layers,
    requiresAuth: true,
  },
  {
    id: 'solver',
    label: 'Solve a Problem',
    description: 'AI-guided walkthroughs',
    icon: BrainCircuit,
    requiresAuth: true,
  },
  {
    id: 'compare',
    label: 'Compare & Learn',
    description: 'Approaches side by side',
    icon: GitCompare,
    requiresAuth: true,
  },
  {
    id: 'contests',
    label: 'Contests',
    description: 'Compete and climb',
    icon: Trophy,
    requiresAuth: true,
  },
];

const PIN_STORAGE_KEY = 'algoviz_sidebar_pinned';
const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 72;

const labelWidth = (expanded: boolean) =>
  cn(
    'aurora-rail-label flex min-w-0 flex-col overflow-hidden',
    // Curved, organic easing: labels drift in slightly after the rail starts
    // opening, and hide immediately when it collapses.
    'transition-[width,opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    expanded
      ? 'delay-[70ms] w-[150px] translate-x-0 opacity-100'
      : 'delay-0 w-0 -translate-x-1.5 opacity-0 pointer-events-none',
  );

const SectionLabel: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <div
    className={cn(
      // Flex + fixed height keeps the 9px caption vertically centered, so the
      // animated height can never clip the top of the glyphs.
      'aurora-rail-label flex items-center overflow-hidden transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
      expanded ? 'mb-1.5 h-6 w-full opacity-100' : 'mb-0 h-0 opacity-0',
    )}
  >
    <span className="block truncate px-3 text-[9px] font-bold uppercase leading-none tracking-[0.18em] text-aurora-muted/75">
      Workspace
    </span>
  </div>
);

const NavButton: React.FC<{
  item: NavItem;
  active: boolean;
  expanded: boolean;
  /** Signed-out visitors see every section; locked ones show a lock hint. */
  locked: boolean;
  onSelect: (view: NavView) => void;
}> = ({ item, active, expanded, locked, onSelect }) => {
  const Icon = item.icon;

  const button = (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
      title={!expanded ? item.label : undefined}
      className={cn(
        'group relative flex w-full items-center rounded-xl text-left outline-none transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-aurora-surface',
        expanded ? 'gap-3 px-3 py-2.5' : 'mx-auto h-11 w-11 justify-center',
        active
          ? 'bg-aurora-primary-soft text-aurora-primary'
          : 'text-aurora-muted hover:bg-aurora-bg hover:text-aurora-text',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-aurora-primary" />
      )}
      <Icon
        className={cn(
          'h-[19px] w-[19px] shrink-0 transition-transform duration-200 group-hover:scale-110',
          active ? 'text-aurora-primary' : 'text-current',
        )}
        strokeWidth={active ? 2.2 : 1.9}
      />
      {!expanded && locked && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-aurora-border bg-white text-aurora-muted shadow-sm"
        >
          <Lock className="h-2.5 w-2.5" strokeWidth={2.4} />
        </span>
      )}
      <span className={labelWidth(expanded)}>
        <span className="truncate text-[13px] font-semibold leading-5">
          {item.label}
        </span>
        <span className="truncate text-[10px] font-medium leading-4 text-aurora-muted/80">
          {item.description}
        </span>
      </span>
      {expanded && locked && (
        <Lock
          aria-hidden="true"
          className="ml-auto h-3.5 w-3.5 shrink-0 text-aurora-muted/55"
          strokeWidth={2}
        />
      )}
      {expanded && active && !locked && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-aurora-primary/70" />
      )}
    </button>
  );

  if (expanded) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={10}
        className="border border-aurora-border bg-aurora-text px-3 py-1.5 text-[11px] font-semibold text-white shadow-aurora-md"
      >
        <span>{item.label}</span>
        <span className="mt-0.5 block text-[10px] font-normal text-white/65">
          {item.description}
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

const Brand: React.FC<{
  expanded: boolean;
  onSelect: () => void;
}> = ({ expanded, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-label="AlgoViz home"
    className={cn(
      'flex w-full items-center rounded-xl outline-none transition-all duration-200',
      'focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-aurora-surface',
      expanded ? 'gap-3 px-1.5 py-1' : 'justify-center',
    )}
  >
    <img
      src="/aurora-logo.svg"
      alt=""
      className="h-9 w-9 shrink-0 rounded-[11px] shadow-aurora-sm ring-1 ring-black/5"
      aria-hidden="true"
    />
    <span className={labelWidth(expanded)}>
      <span className="truncate font-heading text-[15px] font-extrabold tracking-tight text-aurora-text">
        AlgoViz
      </span>
      <span className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-aurora-primary/70">
        Aurora Learning
      </span>
    </span>
  </button>
);

const SignInCard: React.FC<{
  expanded: boolean;
  onSignIn: () => void;
}> = ({ expanded, onSignIn }) => (
  <button
    type="button"
    onClick={onSignIn}
    title={!expanded ? 'Sign in to unlock' : undefined}
    className={cn(
      'group flex w-full items-center rounded-xl bg-aurora-bg text-left outline-none transition-all duration-200',
      'hover:bg-aurora-primary-soft focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-aurora-surface',
      expanded ? 'mb-1 gap-3 px-3 py-2.5' : 'mx-auto mb-1 h-11 w-11 justify-center',
    )}
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-aurora-primary/10 text-aurora-primary">
      <Lock className="h-3.5 w-3.5" />
    </span>
    <span className={labelWidth(expanded)}>
      <span className="truncate text-[12px] font-semibold leading-5 text-aurora-text">
        Sign in to unlock
      </span>
      <span className="truncate text-[10px] leading-4 text-aurora-muted">
        Topics, Observatory &amp; more
      </span>
    </span>
  </button>
);

const PinButton: React.FC<{
  expanded: boolean;
  pinned: boolean;
  onToggle: () => void;
}> = ({ expanded, pinned, onToggle }) => {
  const label = pinned ? 'Unpin sidebar' : 'Pin sidebar';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pinned}
      aria-label={label}
      title={!expanded ? label : undefined}
      className={cn(
        'group flex w-full items-center rounded-xl text-left outline-none transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-aurora-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-aurora-surface',
        expanded ? 'gap-3 px-3 py-2.5' : 'mx-auto h-11 w-11 justify-center',
        pinned
          ? 'bg-aurora-primary-soft text-aurora-primary'
          : 'text-aurora-muted hover:bg-aurora-bg hover:text-aurora-text',
      )}
    >
      <Pin
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-rotate-12',
          pinned ? 'fill-current text-aurora-primary' : 'text-current',
        )}
      />
      <span className={labelWidth(expanded)}>
        <span className="truncate text-[12px] font-semibold leading-5">
          {label}
        </span>
        <span className="truncate text-[10px] leading-4 text-aurora-muted/80">
          {pinned ? 'Stays expanded' : 'Auto-hides on leave'}
        </span>
      </span>
      {expanded && pinned && (
        <span className="ml-auto rounded-full bg-aurora-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-aurora-primary">
          On
        </span>
      )}
    </button>
  );
};

const MobileSidebar: React.FC<{
  open: boolean;
  onClose: () => void;
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}> = ({ open, onClose, currentView, onNavigate, isAuthenticated, onSignIn }) => {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 80);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  const handleSelect = (view: NavView) => {
    onNavigate(view);
    onClose();
  };

  // Every section stays visible, even signed out. App.tsx's handleNavigate
  // still gates protected views by opening the login modal on click.
  const visibleItems = NAV_ITEMS;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="aurora-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-aurora-text/25 backdrop-blur-[2px] md:hidden"
            aria-hidden="true"
          />
          <motion.aside
            key="aurora-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            initial={reduceMotion ? false : { x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{
              duration: reduceMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-y-0 left-0 z-40 flex w-[290px] max-w-[86vw] flex-col overflow-hidden border-r border-aurora-border bg-aurora-surface shadow-aurora-md md:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-aurora-border/80 px-4">
              <Brand expanded onSelect={() => handleSelect('home')} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-aurora-muted transition-colors hover:bg-aurora-bg hover:text-aurora-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-primary/35"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
              <SectionLabel expanded />
              <div className="space-y-1.5">
                {visibleItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={currentView === item.id}
                    expanded
                    locked={item.requiresAuth && !isAuthenticated}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </nav>

            <div className="shrink-0 border-t border-aurora-border/80 p-2.5">
              {!isAuthenticated && (
                <div className="mb-1">
                  <SignInCard expanded onSignIn={onSignIn} />
                </div>
              )}
              <p className="px-3 pt-2 text-[9px] font-medium text-aurora-muted/60">
                AlgoViz · Aurora Learning
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { isAuthenticated, openLoginModal } = useAuth();

  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, String(isPinned));
    } catch {
      // Persistence is optional; the sidebar still works without storage.
    }
  }, [isPinned]);

  const expanded = isPinned || isHovered;
  // Every section stays visible, even signed out. App.tsx's handleNavigate
  // still gates protected views by opening the login modal on click.
  const visibleItems = NAV_ITEMS;

  const handleSelect = useCallback(
    (view: NavView) => {
      onNavigate(view);
    },
    [onNavigate],
  );

  const handleSignIn = useCallback(() => {
    openLoginModal('user');
    onCloseMobile();
  }, [openLoginModal, onCloseMobile]);

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={100}>
      <aside
        aria-label="Primary navigation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
        className={cn(
          'aurora-rail relative z-30 hidden h-full shrink-0 select-none flex-col overflow-hidden border-r border-aurora-border bg-aurora-surface md:flex',
          // Premium curved opening: the rail glides open with an ease-out curve
          // instead of snapping between its collapsed and expanded widths.
          'transition-[width,box-shadow] duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          expanded ? 'shadow-aurora-md' : 'shadow-aurora-sm',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-aurora-border/80 transition-all duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            expanded ? 'px-3.5' : 'px-3',
          )}
        >
          <Brand expanded={expanded} onSelect={() => handleSelect('home')} />
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
          <SectionLabel expanded={expanded} />
          <div className="space-y-1.5">
            {visibleItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={currentView === item.id}
                expanded={expanded}
                locked={item.requiresAuth && !isAuthenticated}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-aurora-border/80 p-2.5">
          {!isAuthenticated && (
            <SignInCard expanded={expanded} onSignIn={handleSignIn} />
          )}
          <PinButton
            expanded={expanded}
            pinned={isPinned}
            onToggle={() => setIsPinned((previous) => !previous)}
          />
          {expanded && (
            <p className="px-3 pt-2 text-[9px] font-medium text-aurora-muted/60">
              AlgoViz · Aurora Learning
            </p>
          )}
        </div>
      </aside>

      <MobileSidebar
        open={mobileOpen}
        onClose={onCloseMobile}
        currentView={currentView}
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
      />
    </TooltipProvider>
  );
};
