'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { userService, NetworkUserItem } from '@/services/userService';
import {
  Lock,
  Unlock,
} from 'lucide-react';

export interface HoldFundRecord {
  id: string;
  userId: string;
  userName: string;
  role: string;
  amountFrozen: number;
  availableBalance: number;
  reason: string;
  durationMode: 'UNTIL_RELEASE' | 'SPECIFIC_DATE';
  specificDate?: string;
  status: 'ACTIVE_HOLD' | 'RELEASED';
  dateApplied: string;
}

const MOCK_HOLDS: HoldFundRecord[] = [
  {
    id: 'hld_01',
    userId: 'RET2045',
    userName: 'Zenith Retail Mart',
    role: 'Retailer',
    amountFrozen: 5000.0,
    availableBalance: 14000.0,
    reason: 'Pending KYC Verification & Bank Document Re-audit',
    durationMode: 'UNTIL_RELEASE',
    status: 'ACTIVE_HOLD',
    dateApplied: '2026-09-24T11:20:00Z',
  },
  {
    id: 'hld_02',
    userId: 'DST402',
    userName: 'Apex Distro Agency',
    role: 'Distributor',
    amountFrozen: 12500.0,
    availableBalance: 48000.0,
    reason: 'Chargeback Dispute Settlement #CB-9021',
    durationMode: 'SPECIFIC_DATE',
    specificDate: '2026-10-05',
    status: 'ACTIVE_HOLD',
    dateApplied: '2026-09-22T09:15:00Z',
  },
  {
    id: 'hld_03',
    userId: 'RET2046',
    userName: 'Swift Commerce Point',
    role: 'Retailer',
    amountFrozen: 2000.0,
    availableBalance: 8500.0,
    reason: 'System Reconciliation Hold',
    durationMode: 'UNTIL_RELEASE',
    status: 'RELEASED',
    dateApplied: '2026-09-18T16:00:00Z',
  },
];

export const HoldFundsView: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [holds, setHolds] = useState<HoldFundRecord[]>(MOCK_HOLDS);
  const [networkUsers, setNetworkUsers] = useState<NetworkUserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [holdAmountInput, setHoldAmountInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [durationToggle, setDurationToggle] = useState<'UNTIL_RELEASE' | 'SPECIFIC_DATE'>('UNTIL_RELEASE');
  const [specificDateInput, setSpecificDateInput] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await userService.getUsers();
        if (res && res.success && res.data) {
          const items = res.data.items || [];
          setNetworkUsers(items);
          if (items.length > 0) {
            setSelectedUserId(items[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load users for hold funds view:', err);
      }
    }
    loadUsers();
  }, []);

  const activeUser = networkUsers.find((u) => u.id === selectedUserId || u.userId === selectedUserId || u.code === selectedUserId);
  const activeAvailableBalance = activeUser ? activeUser.availableBalance : 14000.0;

  const handleApplyHold = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(holdAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      toastError('Please enter a valid hold amount in ₹.');
      return;
    }
    if (amountNum > activeAvailableBalance) {
      toastError(`Hold amount cannot exceed available balance of ${formatCurrency(activeAvailableBalance)}.`);
      return;
    }
    if (!reasonInput) {
      toastError('Please specify the reason for placing this security hold.');
      return;
    }

    if (!selectedUserId) {
      toastError('Please select a user to apply hold.');
      return;
    }

    try {
      const res = await userService.holdWalletFunds(selectedUserId, amountNum, 'HOLD', reasonInput);
      if (res && res.success) {
        const newHold: HoldFundRecord = {
          id: `hld_${Date.now().toString().slice(-6)}`,
          userId: activeUser?.userId || activeUser?.code || selectedUserId || 'USER',
          userName: activeUser?.fullName || activeUser?.displayName || 'Network Partner',
          role: activeUser?.role || 'Retailer',
          amountFrozen: amountNum,
          availableBalance: activeAvailableBalance,
          reason: reasonInput,
          durationMode: durationToggle,
          specificDate: durationToggle === 'SPECIFIC_DATE' ? specificDateInput : undefined,
          status: 'ACTIVE_HOLD',
          dateApplied: new Date().toISOString(),
        };

        setHolds([newHold, ...holds]);
        toastSuccess(`Security hold of ${formatCurrency(amountNum)} placed successfully.`);

        setHoldAmountInput('');
        setReasonInput('');
      } else {
        toastError(res?.message || 'Hold funds action failed.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Hold funds action failed.');
    }
  };

  const handleReleaseHold = async (id: string, userId: string, amount: number) => {
    if (!selectedUserId) {
      toastError('Please select a user to release hold.');
      return;
    }

    try {
      const res = await userService.holdWalletFunds(selectedUserId, amount, 'RELEASE', 'Manual release from admin UI');
      if (res && res.success) {
        setHolds((prev) =>
          prev.map((h) => (h.id === id ? { ...h, status: 'RELEASED' } : h))
        );
        toastInfo(`Security hold of ${formatCurrency(amount)} for user ${userId} has been released.`);
      } else {
        toastError(res?.message || 'Failed to release security hold.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to release security hold.');
    }
  };

  const userOptions =
    networkUsers.length > 0
      ? networkUsers.map((u) => ({
          value: u.id,
          label: `${u.userId || u.code} - ${u.fullName || u.displayName} (${u.role})`,
        }))
      : [
          { value: 'RET2045', label: 'RET2045 - Zenith Retail Mart (Retailer)' },
          { value: 'DST402', label: 'DST402 - Apex Distro Agency (Distributor)' },
          { value: 'MD901', label: 'MD901 - Ramesh Kumar Hub (Master Dist)' },
        ];

  const columns: ColumnDefinition<HoldFundRecord>[] = [
    { key: 'userId', header: 'User ID', render: (r) => <span className="font-mono font-bold text-[#155EEF] text-xs">{r.userId}</span> },
    {
      key: 'userName',
      header: 'User Name & Tier',
      render: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{r.userName}</div>
          <div className="text-[11px] text-[#64748B]">{r.role}</div>
        </div>
      ),
    },
    {
      key: 'amountFrozen',
      header: 'Amount Frozen',
      align: 'right',
      render: (r) => (
        <span className="font-mono font-extrabold text-amber-700 text-xs tabular-nums">
          {formatCurrency(r.amountFrozen)}
        </span>
      ),
    },
    { key: 'reason', header: 'Reason for Hold', render: (r) => <span className="text-xs text-[#334155]">{r.reason}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
            r.status === 'ACTIVE_HOLD'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {r.status === 'ACTIVE_HOLD' ? (
            <>
              <Lock className="w-3 h-3 text-amber-600" /> Active Hold
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-emerald-600" /> Released
            </>
          )}
        </span>
      ),
    },
    { key: 'dateApplied', header: 'Date Applied', render: (r) => <span className="font-mono text-xs text-[#64748B]">{formatDateTime(r.dateApplied)}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#155EEF]" />
            Hold Funds (Compliance Security Locks)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Place temporary or indefinite security holds on user wallet funds during dispute resolution or compliance audits.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <Card title="Place Security Hold" subtitle="Select user, inspect real-time available balance, and freeze compliance funds">
        <form onSubmit={handleApplyHold} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* User Selector */}
            <Select
              label="User Name / ID"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={userOptions}
            />

            {/* Real-time Available Balance Display */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Real-Time Available Balance
              </span>
              <span className="text-xl font-extrabold text-[#0F172A] font-mono mt-0.5">
                {formatCurrency(activeAvailableBalance)}
              </span>
            </div>

            {/* Hold Amount Input */}
            <Input
              label="Hold Amount in ₹"
              type="number"
              placeholder="e.g. 5000.00"
              value={holdAmountInput}
              onChange={(e) => setHoldAmountInput(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reason for Hold */}
            <Input
              label="Reason for Hold"
              placeholder="e.g. Pending KYC Verification, Dispute Settlement #CB-9021"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              required
            />

            {/* Hold Duration Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">Hold Duration Policy</label>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setDurationToggle('UNTIL_RELEASE')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    durationToggle === 'UNTIL_RELEASE'
                      ? 'bg-[#155EEF] text-white shadow-xs'
                      : 'bg-[#F8FAFC] border border-[#E5EAF1] text-[#64748B]'
                  }`}
                >
                  Until Manual Release
                </button>
                <button
                  type="button"
                  onClick={() => setDurationToggle('SPECIFIC_DATE')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    durationToggle === 'SPECIFIC_DATE'
                      ? 'bg-[#155EEF] text-white shadow-xs'
                      : 'bg-[#F8FAFC] border border-[#E5EAF1] text-[#64748B]'
                  }`}
                >
                  Until Specific Date
                </button>
              </div>
            </div>
          </div>

          {durationToggle === 'SPECIFIC_DATE' && (
            <div className="w-full md:w-1/3">
              <Input
                label="Auto Release Specific Date"
                type="date"
                value={specificDateInput}
                onChange={(e) => setSpecificDateInput(e.target.value)}
              />
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" leftIcon={<Lock className="w-4 h-4" />}>
              Apply Security Hold
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit & History Table */}
      <Card title="Hold Funds Audit & History" subtitle="Active security holds and release log" noPadding>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={holds}
            keyExtractor={(r) => r.id}
            renderActions={(row) =>
              row.status === 'ACTIVE_HOLD' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReleaseHold(row.id, row.userId, row.amountFrozen)}
                  leftIcon={<Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  Release Hold
                </Button>
              ) : (
                <span className="text-xs text-[#64748B] italic">Released</span>
              )
            }
          />
        </div>
      </Card>
    </div>
  );
};
