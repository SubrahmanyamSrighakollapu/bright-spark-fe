import React from 'react';
import { SetBalanceRequirementView } from '@/components/features/administration/SetBalanceRequirementView';

export const metadata = {
  title: 'Set Minimum Balance | Qin Star Pay Admin',
  description: 'Set mandatory safety buffer balances for user wallets',
};

export default function BalanceRequirementPage() {
  return <SetBalanceRequirementView />;
}
