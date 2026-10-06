import React from 'react';
import { PlanCommissionView } from '@/components/features/administration/PlanCommissionView';

export const metadata = {
  title: 'Plan Commission Configuration | Qin Star Pay Admin',
  description: 'Configure revenue distribution rates across downline tiers',
};

export default function CommissionsPage() {
  return <PlanCommissionView />;
}
