import React from 'react';
import { RefundPolicyView } from '@/components/features/website/RefundPolicyView';

export const metadata = {
  title: 'Refund Policy | Qin Star Pay Admin',
  description: 'Define customer order cancellation policies and dispute timelines',
};

export default function RefundPolicyPage() {
  return <RefundPolicyView />;
}
