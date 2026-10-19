import { PageContainer } from '@/components/layout/PageContainer';
import { AepsServiceFlow } from '@/components/features/aeps';

export default function MiniStatementPage() {
  return <PageContainer title="AEPS Mini Statement" description="Retrieve recent entries from the customer’s Aadhaar-linked bank account" breadcrumbs={[{ label: 'Retailer', href: '/retailer/dashboard' }, { label: 'AEPS', href: '/retailer/aeps' }, { label: 'Mini Statement' }]}><AepsServiceFlow serviceType="MINI_STATEMENT" /></PageContainer>;
}


