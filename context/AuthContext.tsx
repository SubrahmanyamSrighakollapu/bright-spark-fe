'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserContext, UserRole } from '@/config/roles';
import { AuthSession, mockAuthService, getDefaultRouteForRole } from '@/services/mockAuthService';
import { authService } from '@/services/authService';
import { kycService } from '@/services/kycService';
import { APP_CONFIG } from '@/config';
import type { LoginLocation } from '@/utils/geolocation';

const STORAGE_KEY_SESSION_LOCAL = 'bright-spark-auth-session-local';
const STORAGE_KEY_SESSION_SESSION = 'bright-spark-auth-session-session';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export interface AuthContextType {
  session: AuthSession | null;
  currentUser: UserContext | null;
  previewRole: UserRole | null;
  profilePhotoUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    identifier: string,
    password?: string,
    rememberMe?: boolean,
    location?: LoginLocation
  ) => Promise<{ success: boolean; error?: string; defaultRoute?: string; sessionId?: string; accessToken?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setPreviewRole: (role: UserRole | null) => void;
  updateProfilePhotoUrl: (url: string | null) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastActivityRef = useRef(0);

  const updateProfilePhotoUrl = useCallback(
    (url: string | null) => {
      setProfilePhotoUrl(url);
      if (session?.userId) {
        if (url) {
          localStorage.setItem(`bsp_custom_profile_photo_${session.userId}`, url);
          if (session.entityId) localStorage.setItem(`bsp_custom_profile_photo_${session.entityId}`, url);
        } else {
          localStorage.removeItem(`bsp_custom_profile_photo_${session.userId}`);
          if (session.entityId) localStorage.removeItem(`bsp_custom_profile_photo_${session.entityId}`);
        }
      }
    },
    [session?.userId, session?.entityId]
  );

  // Fetch or hydrate profile photo whenever session updates
  useEffect(() => {
    if (!session?.userId && !session?.entityId) {
      setProfilePhotoUrl(null);
      return;
    }

    const customPhoto =
      localStorage.getItem(`bsp_custom_profile_photo_${session.userId}`) ||
      (session.entityId ? localStorage.getItem(`bsp_custom_profile_photo_${session.entityId}`) : null);

    if (customPhoto) {
      setProfilePhotoUrl(customPhoto);
      return;
    }

    const cached =
      localStorage.getItem(`bsp_profile_photo_${session.userId}`) ||
      (session.entityId ? localStorage.getItem(`bsp_profile_photo_${session.entityId}`) : null);

    if (cached) {
      setProfilePhotoUrl(cached);
    }

    // Fetch authenticated profile photo blob from KYC application if no custom override exists
    const fetchPhoto = async () => {
      try {
        let docs: any[] = [];

        // 1. Try my application endpoint first
        try {
          const myAppRes = await kycService.getMyApplication();
          if (myAppRes.success && myAppRes.data?.documents) {
            docs = myAppRes.data.documents;
          }
        } catch {
          // Fall through to search applications list
        }

        // 2. If no docs yet, check all applications list
        if (!docs.length) {
          const res = await kycService.getKYCApplications('ALL', 1, 50);
          if (res.success && res.data?.items) {
            const targetEntityId = session.entityId || session.userId;
            const userApp = res.data.items.find(
              (app: any) =>
                app.entityId === targetEntityId ||
                app.entityCode === session.userId ||
                app.entityCode === session.entityId ||
                app.entityName === session.name ||
                (session.userId && app.applicationReference?.includes(session.userId))
            );
            if (userApp?.documents) {
              docs = userApp.documents;
            }
          }
        }

        // Get the latest uploaded PROFILE_PHOTO document
        const photoDocs = docs.filter(
          (d: any) => d.type === 'PROFILE_PHOTO' || d.type === 'PROFILE_PHOTO_DOC'
        );
        const photoDoc = photoDocs[photoDocs.length - 1];

        if (photoDoc && photoDoc.id) {
          try {
            const blob = await kycService.getDocumentBlob(photoDoc.id);
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              if (dataUrl && dataUrl.startsWith('data:image')) {
                const latestCustom = localStorage.getItem(`bsp_custom_profile_photo_${session.userId}`);
                if (!latestCustom) {
                  setProfilePhotoUrl(dataUrl);
                  localStorage.setItem(`bsp_profile_photo_${session.userId}`, dataUrl);
                  if (session.entityId) {
                    localStorage.setItem(`bsp_profile_photo_${session.entityId}`, dataUrl);
                  }
                }
              }
            };
            reader.readAsDataURL(blob);
          } catch {
            const latestCustom = localStorage.getItem(`bsp_custom_profile_photo_${session.userId}`);
            if (!latestCustom && photoDoc.fileUrl && photoDoc.fileUrl.startsWith('data:image')) {
              setProfilePhotoUrl(photoDoc.fileUrl);
            }
          }
        }
      } catch {
        // Silently handle if photo not yet uploaded
      }
    };

    fetchPhoto();
  }, [session?.userId, session?.entityId, session?.name]);

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
    window.addEventListener('bsp:tokens-refreshed', updateTokens);
    return () => window.removeEventListener('bsp:tokens-refreshed', updateTokens);
  }, []);

  const setPreviewRole = useCallback((role: UserRole | null) => {
    setPreviewRoleState(role);
  }, []);

  const login = useCallback(
    async (
      identifier: string,
      password?: string,
      rememberMe: boolean = false,
      location?: LoginLocation
    ): Promise<{ success: boolean; error?: string; defaultRoute?: string; sessionId?: string; accessToken?: string }> => {
      if (APP_CONFIG.useMockData) {
        const res = await mockAuthService.authenticate(identifier);
        if (!res.success || !res.data) return { success: false, error: res.error?.message || 'Invalid credentials.' };
        const newSession = res.data;
        setSession(newSession);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(rememberMe ? STORAGE_KEY_SESSION_LOCAL : STORAGE_KEY_SESSION_SESSION, JSON.stringify(newSession));
        (rememberMe ? sessionStorage : localStorage).removeItem(rememberMe ? STORAGE_KEY_SESSION_SESSION : STORAGE_KEY_SESSION_LOCAL);
        return { success: true, defaultRoute: getDefaultRouteForRole(newSession.role), sessionId: undefined, accessToken: undefined };
      }

      const realRes = await authService.login(identifier, password, location);
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
        return { success: true, defaultRoute: realRes.defaultRoute, sessionId: realRes.sessionId, accessToken: newSession.accessToken };
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
        profilePhotoUrl: profilePhotoUrl,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        previewRole,
        profilePhotoUrl,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        changePassword,
        setPreviewRole,
        updateProfilePhotoUrl,
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
