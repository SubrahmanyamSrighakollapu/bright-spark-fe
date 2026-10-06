'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { isRouteAuthorizedForRole } from '@/config/roles';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold animate-pulse">
            QSP
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Cross-Role Route Authorization Check
  const isAuthorized = session ? isRouteAuthorizedForRole(session.role, pathname || '') : false;

  return (
    <AppShell>
      {isAuthorized ? children : <AccessDeniedView />}
    </AppShell>
  );
}
