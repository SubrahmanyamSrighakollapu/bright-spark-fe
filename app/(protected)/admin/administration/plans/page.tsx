import React from 'react';
import { PlansManagementView } from '@/components/features/administration/PlansManagementView';

export const metadata = {
  title: 'Plans Management | Bright Spark Admin',
  description: 'Create subscription and operational commission tiers',
};

export default function PlansPage() {
  return <PlansManagementView />;
}
