'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { HoldFundsView } from '@/components/features/users/HoldFundsView';

export default function HoldFundsPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <HoldFundsView />
    </PageContainer>
  );
}
