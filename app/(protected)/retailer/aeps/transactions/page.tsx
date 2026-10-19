import { PageContainer } from '@/components/layout/PageContainer';
import { AepsHistory } from '@/components/features/aeps';

export default function AepsTransactionsPage() {
  return <PageContainer title="AEPS Transaction History" description="Search and review masked AEPS transaction records" breadcrumbs={[{ label: 'Retailer', href: '/retailer/dashboard' }, { label: 'AEPS', href: '/retailer/aeps' }, { label: 'Transactions' }]}><AepsHistory /></PageContainer>;
}


