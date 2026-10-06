import React from 'react';
import { PaymentMethodsManagerView } from '@/components/features/administration/PaymentMethodsManagerView';

export const metadata = {
  title: 'Payment Methods Manager | Qin Star Pay Admin',
  description: 'Enable, disable, and configure client checkout options',
};

export default function PaymentMethodsPage() {
  return <PaymentMethodsManagerView />;
}
