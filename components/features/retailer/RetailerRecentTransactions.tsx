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

export interface RetailerRecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const RetailerRecentTransactions: React.FC<RetailerRecentTransactionsProps> = ({
  transactions,
  isLoading = false,
}) => {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  if (isLoading) {
    return (
      <Card title="Recent Retailer Transactions" subtitle="Latest live operations executed at your retailer counter">
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
        subtitle="Latest live operations executed at your retailer counter"
        action={
          <Link href="/retailer/transactions">
            <Button variant="outline" size="sm" className="whitespace-nowrap" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        }
        className="h-full overflow-hidden"
      >
        {transactions.length === 0 ? (
          <EmptyState
            title="No Recent Transactions"
            description="No transaction activity recorded for your retailer account yet."
            icon={<ArrowLeftRight className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-[var(--text-muted)] bg-slate-50">
                  <th className="py-2.5 px-5 min-w-40">Transaction ID</th>
                  <th className="py-2.5 px-3 min-w-40">Service</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 min-w-36">Date & Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs text-[var(--primary)]">
                          {tx.transactionRef}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{tx.utr || tx.id}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <span className="block max-w-44 truncate" title={tx.service}>{tx.service || (tx.type === 'PAY_IN' ? 'UPI Pay-In Switch' : 'IMPS Payout Switch')}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                          tx.type === 'PAY_IN'
                            ? 'bg-blue-50 text-[var(--primary)] border-blue-200/80'
                            : 'bg-orange-50 text-[var(--secondary)] border-orange-200/80'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {tx.paymentMode || 'UPI'}
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
