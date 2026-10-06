'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CreateUserForm } from '@/components/features/users/CreateUserForm';

export default function AddUserPage() {
  return (
    <PageContainer fullWidth className="pb-12">
      <CreateUserForm />
    </PageContainer>
  );
}
