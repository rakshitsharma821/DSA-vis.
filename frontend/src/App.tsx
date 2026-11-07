import { useState, useEffect } from 'react';
import { Navbar, NavView } from './components/layout/Navbar';
import { AppSidebar } from './components/layout/AppSidebar';
import { HomePage } from './pages/HomePage';
import { TopicsPage } from './pages/TopicsPage';
import { VisualizerPage } from './pages/VisualizerPage';
import { ProblemSolverPage } from './pages/ProblemSolverPage';
import { ComparePage } from './pages/ComparePage';
import { ContestPage } from './pages/ContestPage';
import { CommandPalette } from './components/layout/CommandPalette';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { useAlgorithmStore } from './store/useAlgorithmStore';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { AdminDashboardModal } from './components/auth/AdminDashboardModal';

function AppShell() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const { loadFromUrlOrStorage } = useAlgorithmStore();

  // Aurora Learning is a light-only experience.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('algoviz_theme', 'light');

    loadFromUrlOrStorage();

    // Check URL query view param if any
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as NavView | null;
    if (
      viewParam === 'home' ||
      viewParam === 'topics' ||
      viewParam === 'visualizer' ||
      viewParam === 'compare' ||
      viewParam === 'solver' ||
      viewParam === 'contests'
    ) {
      if (viewParam !== 'home' && !isAuthenticated) {
        // Enforce: unauthenticated user must stay on landing page
        setCurrentView('home');
        params.delete('view');
        window.history.replaceState({}, '', `${window.location.pathname}`);
        openLoginModal('user');
      } else {
        setCurrentView(viewParam);
      }
    }
  }, [loadFromUrlOrStorage, isAuthenticated, openLoginModal]);

  // If user logs out or is unauthenticated, ensure they cannot linger on protected views
  useEffect(() => {
    if (!isAuthenticated && currentView !== 'home') {
      setCurrentView('home');
      const params = new URLSearchParams(window.location.search);
      params.delete('view');
      window.history.replaceState({}, '', `${window.location.pathname}`);
      openLoginModal('user');
    }
  }, [isAuthenticated, currentView, openLoginModal]);

  // Global Ctrl+K / Cmd+K listener: gatekeep unauthenticated visitors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!isAuthenticated) {
          openLoginModal('user');
        } else {
          setIsCommandPaletteOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, openLoginModal]);

  const handleNavigate = (view: NavView) => {
    // If not authenticated, block all internal views and show sign in modal immediately
    if (!isAuthenticated && view !== 'home') {
      openLoginModal('user');
      return;
    }

    setIsMobileNavOpen(false);
    setCurrentView(view);
    const params = new URLSearchParams(window.location.search);
    params.set('view', view);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleOpenCommandPalette = () => {
    if (!isAuthenticated) {
      openLoginModal('user');
      return;
    }
    setIsCommandPaletteOpen(true);
  };

  const handleOpenChatDrawer = () => {
    if (!isAuthenticated) {
      openLoginModal('user');
      return;
    }
    setIsChatDrawerOpen(true);
  };

  return (
    <div className="relative flex h-dvh max-h-dvh w-full overflow-hidden bg-aurora-bg font-sans text-aurora-text selection:bg-aurora-primary/20 selection:text-aurora-primary">
      {/* Aurora Learning navigation: desktop rail + mobile drawer */}
      <AppSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Content column — the rail sits beside it, so nothing is covered */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Aurora utility header (no duplicate navigation links) */}
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenCommandPalette={handleOpenCommandPalette}
          onOpenChatDrawer={handleOpenChatDrawer}
          isAudioMuted={isAudioMuted}
          onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Main Views Container - Unauthenticated users are strictly confined to the landing page */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          {(!isAuthenticated || currentView === 'home') && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <HomePage
                onNavigate={handleNavigate}
                onOpenCommandPalette={handleOpenCommandPalette}
              />
            </div>
          )}

          {isAuthenticated && currentView === 'topics' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <TopicsPage
                onNavigate={handleNavigate}
                onOpenCommandPalette={handleOpenCommandPalette}
              />
            </div>
          )}

          {isAuthenticated && currentView === 'visualizer' && (
            <VisualizerPage
              onOpenCommandPalette={handleOpenCommandPalette}
            />
          )}

          {isAuthenticated && currentView === 'contests' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ContestPage onNavigate={handleNavigate} />
            </div>
          )}

          {isAuthenticated && currentView === 'solver' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ProblemSolverPage />
            </div>
          )}

          {isAuthenticated && currentView === 'compare' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ComparePage />
            </div>
          )}
        </div>
      </div>

      {/* Global Command Palette (Ctrl/Cmd + K) - Available only when authenticated */}
      {isAuthenticated && (
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          onSelectAlgorithm={() => {
            handleNavigate('visualizer');
          }}
        />
      )}

      {/* AI Assistant Chat Drawer - Available only when authenticated */}
      {isAuthenticated && (
        <ChatDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
        />
      )}

      {/* Authentication Modals */}
      <LoginModal />
      <AdminDashboardModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
