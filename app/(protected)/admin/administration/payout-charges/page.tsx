import React from 'react';
import { PayoutChargesManagerView } from '@/components/features/administration/PayoutChargesManagerView';

export const metadata = {
  title: 'Payout Charges Manager | Qin Star Pay Admin',
  description: 'Define platform service charges deducted on bank payouts',
};

export default function PayoutChargesPage() {
  return <PayoutChargesManagerView />;
}
