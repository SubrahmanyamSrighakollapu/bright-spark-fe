import { PageContainer } from '@/components/layout/PageContainer';
import { AepsServiceFlow } from '@/components/features/aeps';

export default function CashWithdrawalPage() {
  return <PageContainer title="AEPS Cash Withdrawal" description="Customer Aadhaar authentication and cash withdrawal" breadcrumbs={[{ label: 'Retailer', href: '/retailer/dashboard' }, { label: 'AEPS', href: '/retailer/aeps' }, { label: 'Cash Withdrawal' }]}><AepsServiceFlow serviceType="CASH_WITHDRAWAL" /></PageContainer>;
}


