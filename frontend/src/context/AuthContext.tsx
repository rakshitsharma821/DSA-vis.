import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  StudentLoginPayload,
  StudentPasswordLoginPayload,
  AdminLoginPayload,
  AdminPasswordLoginPayload,
  SendOtpPayload,
} from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  loginModalDefaultRole: 'user' | 'admin';
  isAdminDashboardOpen: boolean;
  openLoginModal: (defaultRole?: 'user' | 'admin') => void;
  closeLoginModal: () => void;
  openAdminDashboard: () => void;
  closeAdminDashboard: () => void;
  sendOtp: (payload: SendOtpPayload) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  loginStudent: (payload: StudentLoginPayload) => Promise<{ success: boolean; message: string }>;
  loginStudentWithPassword: (payload: StudentPasswordLoginPayload) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (payload: AdminLoginPayload) => Promise<{ success: boolean; message: string }>;
  loginAdminWithPassword: (payload: AdminPasswordLoginPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'algoviz_auth_token';
const USER_KEY = 'algoviz_auth_user';

async function parseJsonResponse(resp: Response) {
  const text = await resp.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const fallbackMessage = resp.ok
      ? 'The server returned an unexpected response. Please try again.'
      : 'The server returned an unexpected response. Please try again.';
    return { error: fallbackMessage };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalDefaultRole, setLoginModalDefaultRole] = useState<'user' | 'admin'>('user');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // Initialize and validate session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as AuthUser;
          setToken(storedToken);
          setUser(parsedUser);

          // Verify with server /api/auth/me
          try {
            const resp = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.user) {
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              }
            } else if (resp.status === 401) {
              // Expired session
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setToken(null);
              setUser(null);
            }
          } catch {
            // If offline, keep local user session
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        if (!e.newValue) {
          setToken(null);
          setUser(null);
        } else {
          setToken(e.newValue);
          const u = localStorage.getItem(USER_KEY);
          if (u) setUser(JSON.parse(u));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const openLoginModal = useCallback((defaultRole: 'user' | 'admin' = 'user') => {
    setLoginModalDefaultRole(defaultRole);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const openAdminDashboard = useCallback(() => {
    setIsAdminDashboardOpen(true);
  }, []);

  const closeAdminDashboard = useCallback(() => {
    setIsAdminDashboardOpen(false);
  }, []);

  // Send Email OTP
  const sendOtp = async (payload: SendOtpPayload) => {
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(resp);
      if (!resp.ok) {
        return { success: false, message: data.error || 'Failed to send OTP' };
      }
      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error sending OTP' };
    }
  };

  // Student Login
  const loginStudent = async (payload: StudentLoginPayload) => {
    try {
      const resp = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(resp);
      if (!resp.ok) {
        return { success: false, message: data.error || 'Student login failed' };
      }

      const tokenValue = data.token;
      const userValue = data.user;
      if (!tokenValue || !userValue) {
        return { success: false, message: 'Login succeeded but response was incomplete.' };
      }

      setToken(tokenValue);
      setUser(userValue);
      localStorage.setItem(TOKEN_KEY, tokenValue);
      localStorage.setItem(USER_KEY, JSON.stringify(userValue));
      setIsLoginModalOpen(false);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  // Student Direct Password Login
  const loginStudentWithPassword = async (payload: StudentPasswordLoginPayload) => {
    try {
      const resp = await fetch('/api/auth/student-password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(resp);
      if (!resp.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      const tokenValue = data.token;
      const userValue = data.user;
      if (!tokenValue || !userValue) {
        return { success: false, message: 'Login succeeded but response was incomplete.' };
      }

      setToken(tokenValue);
      setUser(userValue);
      localStorage.setItem(TOKEN_KEY, tokenValue);
      localStorage.setItem(USER_KEY, JSON.stringify(userValue));
      setIsLoginModalOpen(false);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  // Admin Login
  const loginAdmin = async (payload: AdminLoginPayload) => {
    try {
      const resp = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(resp);
      if (!resp.ok) {
        return { success: false, message: data.error || 'Admin login failed' };
      }

      const tokenValue = data.token;
      const userValue = data.user;
      if (!tokenValue || !userValue) {
        return { success: false, message: 'Login succeeded but response was incomplete.' };
      }

      setToken(tokenValue);
      setUser(userValue);
      localStorage.setItem(TOKEN_KEY, tokenValue);
      localStorage.setItem(USER_KEY, JSON.stringify(userValue));
      setIsLoginModalOpen(false);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during admin login' };
    }
  };

  // Admin Direct Login with Password
  const loginAdminWithPassword = async (payload: AdminPasswordLoginPayload) => {
    try {
      const resp = await fetch('/api/auth/admin-password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(resp);
      if (!resp.ok) {
        return { success: false, message: data.error || 'Admin login failed' };
      }

      const tokenValue = data.token;
      const userValue = data.user;
      if (!tokenValue || !userValue) {
        return { success: false, message: 'Login succeeded but response was incomplete.' };
      }

      setToken(tokenValue);
      setUser(userValue);
      localStorage.setItem(TOKEN_KEY, tokenValue);
      localStorage.setItem(USER_KEY, JSON.stringify(userValue));
      setIsLoginModalOpen(false);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during admin login' };
    }
  };

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore network error on logout
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAdminDashboardOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isLoading,
        isLoginModalOpen,
        loginModalDefaultRole,
        isAdminDashboardOpen,
        openLoginModal,
        closeLoginModal,
        openAdminDashboard,
        closeAdminDashboard,
        sendOtp,
        loginStudent,
        loginStudentWithPassword,
        loginAdmin,
        loginAdminWithPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
