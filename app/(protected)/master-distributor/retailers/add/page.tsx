'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { CreateUserForm } from '@/components/features/users/CreateUserForm';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { retailerService } from '@/services/retailerService';
import type { Distributor } from '@/types/domain';

export default function AddMasterDistributorRetailerPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [parentId, setParentId] = useState('');
  useEffect(() => { if (!session?.entityId) return; void retailerService.getEligibleDistributorsForRetailerCreation(session.entityId).then((items) => { setDistributors(items); setParentId(items[0]?.id || ''); }); }, [session?.entityId]);
  return <PageContainer fullWidth className="space-y-6 pb-12">
    <Card title="Parent Distributor" subtitle="Select the approved distributor under which this retailer will operate">
      <Select label="Parent Distributor *" value={parentId} onChange={(event) => setParentId(event.target.value)} options={distributors.length ? distributors.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` })) : [{ value: '', label: 'No approved distributor available' }]} />
    </Card>
    {parentId && <CreateUserForm fixedRole="RETAILER" parentPartyId={parentId} onCancel={() => router.back()} onCompleted={() => router.push('/master-distributor/retailers')} />}
  </PageContainer>;
}
