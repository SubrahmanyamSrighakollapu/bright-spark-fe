'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MaskedValue } from '@/components/ui/MaskedValue';
import { Card } from '@/components/ui/Card';
import { UserHierarchyView } from './UserHierarchyView';
import { BusinessEntity } from '@/types/domain';
import { formatDate } from '@/utils/formatters';
import {
  Copy,
  Check,
  User,
  ShieldCheck,
  Wallet,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export interface UserDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: BusinessEntity | null;
  onToggleBlock?: (entity: BusinessEntity) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  isOpen,
  onClose,
  entity,
  onToggleBlock,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KYC' | 'TRANSACTIONS' | 'WALLET' | 'ACTIVITY'>(
    'OVERVIEW'
  );
  const [isCopied, setIsCopied] = useState(false);

  if (!entity) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(entity.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${entity.type.replace('_', ' ')} Details — ${entity.name}`}
      size="lg"
      className="p-0 bg-[var(--bg-app)] w-full md:w-[880px] md:max-w-[92vw]"
    >
      <div className="space-y-6">
        {/* Sticky Identity Header */}
        <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/95 backdrop-blur-xs border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-base md:text-lg text-[var(--primary)]">
                {entity.code}
              </span>
              <StatusBadge status={entity.status} size="sm" />
              <StatusBadge status={entity.kycStatus} size="sm" />
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Created: <strong>{formatDate(entity.createdAt)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {isCopied ? 'Copied' : 'Copy Code'}
            </Button>

            {onToggleBlock && (
              <Button
                variant={entity.status === 'BLOCKED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onToggleBlock(entity)}
              >
                {entity.status === 'BLOCKED' ? 'Unblock' : 'Block User'}
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] bg-white p-1 rounded-lg">
          {(
            [
              { id: 'OVERVIEW', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
              { id: 'KYC', label: 'KYC Info', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
              { id: 'TRANSACTIONS', label: 'Transactions Preview', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'WALLET', label: 'Wallet Preview', icon: <Wallet className="w-3.5 h-3.5" /> },
              { id: 'ACTIVITY', label: 'Activity Log', icon: <Activity className="w-3.5 h-3.5" /> },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <Card title="Account Overview" subtitle="Profile & contact details">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-semibold">{entity.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Entity Type:</span>
                    <span className="font-bold">{entity.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email Address:</span>
                    <span>{entity.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mobile Number:</span>
                    <span className="font-mono">{entity.mobile}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mapped Parent:</span>
                    <span className="font-semibold">{entity.parentName || 'Direct'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Created Date:</span>
                    <span>{formatDate(entity.createdAt)}</span>
                  </div>
                </div>
              </Card>

              <Card title="Business Information" subtitle="Tax & registration profile">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Business Name:</span>
                    <span className="font-semibold">{entity.businessName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Business Type:</span>
                    <span>{entity.businessType}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">PAN Number:</span>
                    <MaskedValue value={entity.panNumberMasked || 'ABCDE1234F'} type="pan" />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">GST Number:</span>
                    {entity.gstNumber ? (
                      <MaskedValue value={entity.gstNumber} type="gst" />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Location:</span>
                    <span>{entity.city ? `${entity.city}, ${entity.state}` : 'India'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Hierarchy Tree Card */}
            <UserHierarchyView entity={entity} />
          </div>
        )}

        {activeTab === 'KYC' && (
          <Card title="KYC Document & Bank Verification" subtitle="Submitted compliance profile">
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">KYC Status:</span>
                  <StatusBadge status={entity.kycStatus} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold">{entity.bankName || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Masked Account:</span>
                  <MaskedValue value={entity.accountNumberMasked || 'XXXXXX8912'} type="bankAccount" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono">{entity.ifscCode || 'HDFC0001234'}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/admin/kyc">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Open Full KYC Application Module →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'TRANSACTIONS' && (
          <Card title="Latest Transactions Preview" subtitle="Quick transaction overview for entity">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold">
                  <span>BSP20260903001 (PAY_IN)</span>
                  <StatusBadge status="SUCCESS" size="sm" />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount: ₹15,400.00</span>
                  <span>03 Sep 2026</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/admin/transactions/all`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View All Entity Transactions in Transactions Module →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'WALLET' && (
          <Card title="Shared Wallet Balance Summary" subtitle="Current ledger state for entity">
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Available Balance</span>
                  <span className="font-mono font-extrabold text-base text-[var(--primary)]">₹99,53,681.66</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hold / Lien Amount</span>
                  <span className="font-mono font-bold text-amber-700">₹0.00</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/admin/wallet/balances">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View Full Wallet Ledger in Wallet Module →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'ACTIVITY' && (
          <Card title="Activity & Audit Logs Preview" subtitle="Recent account history">
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
                <div>
                  <span className="font-bold text-slate-800">Account Created</span>
                  <p className="text-slate-500 text-[11px]">Initial entity onboarding recorded</p>
                </div>
                <span className="text-slate-400 text-[11px]">{formatDate(entity.createdAt)}</span>
              </div>

              <div className="pt-2">
                <Link href="/admin/logs/activity">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View Full Activity Logs in Logs Module →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};
