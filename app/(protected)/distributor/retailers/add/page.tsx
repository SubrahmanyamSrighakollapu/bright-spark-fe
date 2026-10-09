'use client';

import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { CreateUserForm } from '@/components/features/users/CreateUserForm';

export default function AddRetailerPage() {
  const router = useRouter();
  return <PageContainer fullWidth className="pb-12"><CreateUserForm fixedRole="RETAILER" onCancel={() => router.back()} onCompleted={() => router.push('/distributor/retailers')} /></PageContainer>;
}
