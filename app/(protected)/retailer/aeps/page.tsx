import { PageContainer } from '@/components/layout/PageContainer';
import { AepsDashboard } from '@/components/features/aeps';

export default function AepsPage() {
  return <PageContainer title="AEPS Services" description="Aadhaar Enabled Payment System — Retailer banking services" breadcrumbs={[{ label: 'Retailer', href: '/retailer/dashboard' }, { label: 'AEPS' }]}><AepsDashboard /></PageContainer>;
}


