'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { TransactionDetailsView } from './TransactionDetailsView';
import { Transaction } from '@/types/domain';
import { transactionService } from '@/services/transactionService';

export interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRefresh?: () => void;
}

export const TransactionDetailsDrawer: React.FC<TransactionDetailsDrawerProps> = ({
  isOpen,
  onClose,
  transaction,
  onRefresh,
}) => {
  const [detail, setDetail] = useState<Transaction | null>(transaction);

  useEffect(() => {
    setDetail(transaction);
    if (!isOpen || !transaction) return;
    let active = true;
    transactionService.getTransactionById(transaction.id).then((response) => {
      if (active && response.success && response.data) setDetail(response.data);
    }).catch(() => {
      // Keep the list record visible if the detail refresh is unavailable.
    });
    return () => { active = false; };
  }, [isOpen, transaction]);

  if (!transaction) return null;

  const isPayIn = transaction.type === 'PAY_IN';
  const drawerTitle = isPayIn ? 'Pay-In Transaction Details' : 'Pay-Out Transaction Details';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={drawerTitle}
      size="lg"
      className="p-0 bg-[var(--bg-app)] w-full md:w-[880px] md:max-w-[92vw]"
    >
      <TransactionDetailsView key={detail?.id} transaction={detail || transaction} onRefresh={onRefresh} isInsideDrawer />
    </Drawer>
  );
};
