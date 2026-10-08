'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Transaction } from '@/types/domain';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eye, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { TransactionDetailsDrawer } from '@/components/features/transactions/TransactionDetailsDrawer';

export interface DistributorRecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const DistributorRecentTransactions: React.FC<DistributorRecentTransactionsProps> = ({
  transactions,
  isLoading = false,
}) => {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  if (isLoading) {
    return (
      <Card title="Recent Retailer Transactions" subtitle="Latest live operations across your assigned retailers">
        <div className="space-y-3 p-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-md" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Recent Retailer Transactions"
        subtitle="Latest live operations across your assigned retailer network"
        action={
          <Link href="/distributor/transactions">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Transactions
            </Button>
          </Link>
        }
      >
        {transactions.length === 0 ? (
          <EmptyState
            title="No Recent Transactions"
            description="No transaction activity recorded for your retailer network yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-[var(--text-muted)] bg-slate-50">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Retailer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs text-[var(--primary)]">
                          {tx.transactionRef}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{tx.utr || tx.id}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {tx.retailerName || 'Metro Store #01'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {tx.service || (tx.type === 'PAY_IN' ? 'UPI Pay-In Switch' : 'IMPS Payout Switch')}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          tx.type === 'PAY_IN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={tx.status} label={tx.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {formatDateTime(tx.createdAt)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTxn(tx)}
                        title="View Scoped Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Scoped Transaction Details Drawer */}
      <TransactionDetailsDrawer
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </>
  );
};
