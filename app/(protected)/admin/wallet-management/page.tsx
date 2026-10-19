import React from 'react';
import { WalletManagementView } from '@/components/features/wallet/WalletManagementView';

export const metadata = {
  title: 'Wallet Management | Bright Spark Admin',
  description: 'Direct manual wallet adjustments, balance credits/debits, and audit trails',
};

export default function WalletManagementPage() {
  return <WalletManagementView />;
}
