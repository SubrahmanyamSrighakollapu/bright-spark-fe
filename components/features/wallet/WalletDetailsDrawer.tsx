'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WalletAccount } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Copy,
  Check,
  Wallet,
  BookOpen,
  Layers,
  Activity,
  ArrowUpRight,
  Lock,
  Unlock,
} from 'lucide-react';

export interface WalletDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletAccount | null;
  onToggleFreeze?: (wallet: WalletAccount) => void;
  onCreditDebit?: (wallet: WalletAccount) => void;
}

export const WalletDetailsDrawer: React.FC<WalletDetailsDrawerProps> = ({
  isOpen,
  onClose,
  wallet,
  onToggleFreeze,
  onCreditDebit,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEDGER' | 'TRANSACTIONS' | 'ADJUSTMENTS'>(
    'OVERVIEW'
  );
  const [isCopied, setIsCopied] = useState(false);

  if (!wallet) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(wallet.walletId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Wallet Details — ${wallet.entityName}`}
      size="lg"
      className="p-0 bg-[var(--bg-app)] w-full md:w-[880px] md:max-w-[92vw]"
    >
      <div className="space-y-6">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)]">
                {wallet.walletId}
              </span>
              <StatusBadge status={wallet.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {wallet.entityType}
              </span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Entity Code: <strong>{wallet.entityCode}</strong> | Updated: <strong>{formatDate(wallet.updatedAt)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopyId}>
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {isCopied ? 'Copied' : 'Copy Wallet ID'}
            </Button>

            {onCreditDebit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreditDebit(wallet)}
                disabled={wallet.status === 'FROZEN'}
              >
                Credit / Debit
              </Button>
            )}

            {onToggleFreeze && (
              <Button
                variant={wallet.status === 'FROZEN' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onToggleFreeze(wallet)}
              >
                {wallet.status === 'FROZEN' ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 mr-1" /> Unfreeze
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1 text-rose-600" /> Freeze
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] bg-white p-1 rounded-lg">
          {(
            [
              { id: 'OVERVIEW', label: 'Overview', icon: <Wallet className="w-3.5 h-3.5" /> },
              { id: 'LEDGER', label: 'Ledger Entries', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'TRANSACTIONS', label: 'Transactions Preview', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'ADJUSTMENTS', label: 'Adjustment History', icon: <Activity className="w-3.5 h-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Balance Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1">
                <span className="text-slate-500 block">Available Balance</span>
                <span className="font-mono font-extrabold text-base text-[var(--primary)]">
                  {formatCurrency(wallet.availableBalance)}
                </span>
                <span className="text-[10px] text-slate-400 block">Available for payout & transfers</span>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                <span className="text-slate-500 block">Ledger Balance</span>
                <span className="font-mono font-bold text-base text-emerald-900">
                  {formatCurrency(wallet.ledgerBalance)}
                </span>
                <span className="text-[10px] text-slate-400 block">Total gross ledger balance</span>
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-lg space-y-1">
                <span className="text-slate-500 block">Hold Balance</span>
                <span className="font-mono font-bold text-base text-rose-700">
                  {formatCurrency(wallet.holdBalance)}
                </span>
                <span className="text-[10px] text-slate-400 block">Reserved / Risk hold amount</span>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                <span className="text-slate-500 block">Pending Settlement</span>
                <span className="font-mono font-bold text-base text-amber-700">
                  {formatCurrency(wallet.pendingSettlement)}
                </span>
                <span className="text-[10px] text-slate-400 block">Unsettled pay-in funds</span>
              </div>
            </div>

            {/* Entity Details Card */}
            <Card title="Entity & Currency Profile" subtitle="Ownership metadata">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Entity Name:</span>
                    <span className="font-semibold">{wallet.entityName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Entity Code:</span>
                    <span className="font-mono font-bold text-[var(--primary)]">{wallet.entityCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Entity Type:</span>
                    <span className="font-bold">{wallet.entityType}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mapped Parent:</span>
                    <span className="font-semibold">{wallet.parentName || 'Direct'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Currency:</span>
                    <span className="font-mono font-bold">{wallet.currency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Wallet Status:</span>
                    <StatusBadge status={wallet.status} size="sm" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'LEDGER' && (
          <Card title="Wallet Ledger Audit Entries" subtitle="Recent financial audit log for this wallet">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold">
                  <span>PAY_IN Settlement Credit</span>
                  <span className="font-mono text-emerald-600">+₹15,400.00</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Ref: PAYIN_SETTLE_9912</span>
                  <span>03 Sep 2026</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/admin/wallet/ledger?searchQuery=${wallet.walletId}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View Complete Audit Ledger →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'TRANSACTIONS' && (
          <Card title="Transactions Preview" subtitle="Latest retailer transactions linked to wallet">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold">
                  <span>QSP20260903001 (PAY_IN)</span>
                  <StatusBadge status="SUCCESS" size="sm" />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount: ₹15,400.00</span>
                  <span>03 Sep 2026</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/admin/transactions/all">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Open All Transactions Module →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'ADJUSTMENTS' && (
          <Card title="Manual Adjustment History" subtitle="Super Admin & Accounts manual balance edits">
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Monthly Commission Credit</span>
                  <span className="font-mono text-emerald-600">+₹50,000.00</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>By: Super Admin</span>
                  <span>03 Sep 2026</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};
