'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AddWalletView } from '@/components/features/users/AddWalletView';

export default function AddWalletPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <AddWalletView />
    </PageContainer>
  );
}
