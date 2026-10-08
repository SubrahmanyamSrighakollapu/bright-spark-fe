'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserContext, UserRole } from '@/config/roles';
import { AuthSession, mockAuthService, getDefaultRouteForRole } from '@/services/mockAuthService';
import { authService } from '@/services/authService';
import { APP_CONFIG } from '@/config';

const STORAGE_KEY_SESSION_LOCAL = 'qin-star-pay-auth-session-local';
const STORAGE_KEY_SESSION_SESSION = 'qin-star-pay-auth-session-session';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export interface AuthContextType {
  session: AuthSession | null;
  currentUser: UserContext | null;
  previewRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    identifier: string,
    password?: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string; defaultRoute?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setPreviewRole: (role: UserRole | null) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastActivityRef = useRef(0);

  // Initial Session Hydration on Application Load
  useEffect(() => {
    const hydrate = async () => {
    try {
      let savedSessionRaw: string | null = null;

      // Check sessionStorage first, then localStorage
      if (typeof window !== 'undefined') {
        savedSessionRaw = sessionStorage.getItem(STORAGE_KEY_SESSION_SESSION);
        if (!savedSessionRaw) {
          savedSessionRaw = localStorage.getItem(STORAGE_KEY_SESSION_LOCAL);
        }
      }

      if (savedSessionRaw) {
        const parsedSession: AuthSession = JSON.parse(savedSessionRaw);
        if (APP_CONFIG.useMockData && !parsedSession.accessToken) {
          setSession(parsedSession);
        } else if (parsedSession.accessToken) {
          const current = await authService.getCurrentUser(parsedSession.accessToken);
          if (current) {
            setSession({ ...parsedSession, email: current.email, entityId: current.partyId || undefined,
              role: (current.roles[0] as UserRole) || parsedSession.role, permissions: current.permissions,
              mustChangePassword: current.mustChangePassword });
          } else {
            localStorage.removeItem(STORAGE_KEY_SESSION_LOCAL);
            sessionStorage.removeItem(STORAGE_KEY_SESSION_SESSION);
          }
        }
      }
    } catch {
      // Clear corrupt sessions safely
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_SESSION_LOCAL);
        sessionStorage.removeItem(STORAGE_KEY_SESSION_SESSION);
      }
    } finally {
      setIsLoading(false);
    }};
    void hydrate();
  }, []);

  useEffect(() => {
    const updateTokens = (event: Event) => {
      const detail = (event as CustomEvent<{ accessToken: string; refreshToken?: string }>).detail;
      setSession((current) => current ? { ...current, accessToken: detail.accessToken,
        refreshToken: detail.refreshToken || current.refreshToken } : current);
    };
    window.addEventListener('qsp:tokens-refreshed', updateTokens);
    return () => window.removeEventListener('qsp:tokens-refreshed', updateTokens);
  }, []);

  const setPreviewRole = useCallback((role: UserRole | null) => {
    setPreviewRoleState(role);
  }, []);

  const login = useCallback(
    async (
      identifier: string,
      password?: string,
      rememberMe: boolean = false
    ): Promise<{ success: boolean; error?: string; defaultRoute?: string }> => {
      if (APP_CONFIG.useMockData) {
        const res = await mockAuthService.authenticate(identifier);
        if (!res.success || !res.data) return { success: false, error: res.error?.message || 'Invalid credentials.' };
        const newSession = res.data;
        setSession(newSession);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(rememberMe ? STORAGE_KEY_SESSION_LOCAL : STORAGE_KEY_SESSION_SESSION, JSON.stringify(newSession));
        (rememberMe ? sessionStorage : localStorage).removeItem(rememberMe ? STORAGE_KEY_SESSION_SESSION : STORAGE_KEY_SESSION_LOCAL);
        return { success: true, defaultRoute: getDefaultRouteForRole(newSession.role) };
      }

      const realRes = await authService.login(identifier, password);
      if (realRes.success && realRes.session) {
        const newSession = realRes.session;
        setSession(newSession);
        setPreviewRoleState(null);

        if (typeof window !== 'undefined') {
          const sessionJson = JSON.stringify(newSession);
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_SESSION_LOCAL, sessionJson);
            sessionStorage.removeItem(STORAGE_KEY_SESSION_SESSION);
          } else {
            sessionStorage.setItem(STORAGE_KEY_SESSION_SESSION, sessionJson);
            localStorage.removeItem(STORAGE_KEY_SESSION_LOCAL);
          }
        }
        return { success: true, defaultRoute: realRes.defaultRoute };
      }

      return { success: false, error: realRes.error || 'Invalid credentials.' };
    },
    []
  );

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const tokens = await authService.changePassword(currentPassword, newPassword);
      setSession((current) => {
        if (!current) return current;
        const updated = { ...current, ...tokens, mustChangePassword: false };
        const isLocal = localStorage.getItem(STORAGE_KEY_SESSION_LOCAL) !== null;
        (isLocal ? localStorage : sessionStorage).setItem(isLocal ? STORAGE_KEY_SESSION_LOCAL : STORAGE_KEY_SESSION_SESSION, JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message || 'Unable to change password' };
    }
  }, []);

  const logout = useCallback(() => {
    if (session?.refreshToken) {
      authService.logout(session.refreshToken, session.accessToken).catch(() => {});
    }
    setSession(null);
    setPreviewRoleState(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SESSION_LOCAL);
      sessionStorage.removeItem(STORAGE_KEY_SESSION_SESSION);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let lastRecordedAt = 0;

    const scheduleLogout = () => {
      clearTimeout(timeoutId);
      const remaining = Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current));
      timeoutId = setTimeout(() => {
        if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) logout();
        else scheduleLogout();
      }, remaining);
    };

    const recordActivity = () => {
      const now = Date.now();
      if (now - lastRecordedAt < 1000) return;
      lastRecordedAt = now;
      lastActivityRef.current = now;
      scheduleLogout();
    };

    const checkAfterVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) logout();
      else scheduleLogout();
    };

    lastActivityRef.current = Date.now();
    scheduleLogout();
    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    document.addEventListener('visibilitychange', checkAfterVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener('visibilitychange', checkAfterVisibilityChange);
    };
  }, [session, logout]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!session) return false;
      const targetRole = session.role;
      if (Array.isArray(roles)) {
        return roles.includes(targetRole);
      }
      return targetRole === roles;
    },
    [session]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!session) return false;
      if (session.permissions.includes('*')) return true;
      return session.permissions.includes(permission);
    },
    [session]
  );

  // Map session to UserContext structure for backward compatibility with existing layout components
  const currentUser: UserContext | null = session
    ? {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: previewRole || session.role, // Preview role applies to UI rendering, NOT true auth permissions
        permissions: session.permissions,
        entityId: session.entityId,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        previewRole,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        changePassword,
        setPreviewRole,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
