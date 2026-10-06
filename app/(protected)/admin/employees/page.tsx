'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmployeesListView } from '@/components/features/employees/EmployeesListView';

export default function EmployeesPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <EmployeesListView />
    </PageContainer>
  );
}
