'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { UsersListView } from '@/components/features/users/UsersListView';

export default function AdminUsersPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <UsersListView />
    </PageContainer>
  );
}
