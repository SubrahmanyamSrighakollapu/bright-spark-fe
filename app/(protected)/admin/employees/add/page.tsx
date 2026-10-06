'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CreateEmployeeWizard } from '@/components/features/employees/CreateEmployeeWizard';

export default function AddEmployeePage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <CreateEmployeeWizard />
    </PageContainer>
  );
}
