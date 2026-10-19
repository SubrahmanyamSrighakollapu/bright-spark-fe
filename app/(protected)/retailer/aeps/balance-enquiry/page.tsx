import { PageContainer } from '@/components/layout/PageContainer';
import { AepsServiceFlow } from '@/components/features/aeps';

export default function BalanceEnquiryPage() {
  return <PageContainer title="AEPS Balance Enquiry" description="Check the balance of the customer’s Aadhaar-linked bank account" breadcrumbs={[{ label: 'Retailer', href: '/retailer/dashboard' }, { label: 'AEPS', href: '/retailer/aeps' }, { label: 'Balance Enquiry' }]}><AepsServiceFlow serviceType="BALANCE_ENQUIRY" /></PageContainer>;
}


