'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserContext, UserRole } from '@/config/roles';
import { AuthSession, mockAuthService, getDefaultRouteForRole } from '@/services/mockAuthService';
import { authService } from '@/services/authService';

const STORAGE_KEY_SESSION_LOCAL = 'qin-star-pay-auth-session-local';
const STORAGE_KEY_SESSION_SESSION = 'qin-star-pay-auth-session-session';

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
  setPreviewRole: (role: UserRole | null) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Session Hydration on Application Load
  useEffect(() => {
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
        setSession(parsedSession);
      }
    } catch {
      // Clear corrupt sessions safely
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_SESSION_LOCAL);
        sessionStorage.removeItem(STORAGE_KEY_SESSION_SESSION);
      }
    } finally {
      setIsLoading(false);
    }
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
      // 1. Attempt real API login first
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

      // 2. Fallback to mock auth if real login failed due to offline/mock mode
      const res = await mockAuthService.authenticate(identifier);

      if (res.success && res.data) {
        const newSession = res.data;
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

        const defaultRoute = getDefaultRouteForRole(newSession.role);
        return { success: true, defaultRoute };
      } else {
        return {
          success: false,
          error: realRes.error || res.error?.message || 'Invalid credentials.',
        };
      }
    },
    []
  );

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
