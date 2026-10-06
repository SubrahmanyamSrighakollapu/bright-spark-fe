'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserServiceSettings } from '@/components/features/users/UserServiceSettings';

export default function UserSettingsPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <UserServiceSettings />
    </PageContainer>
  );
}
