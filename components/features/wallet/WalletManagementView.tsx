'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { userService, NetworkUserItem } from '@/services/userService';
import { walletService } from '@/services/walletService';
import { ledgerService } from '@/services/ledgerService';
import {
  Wallet,
  PlusCircle,
  MinusCircle,
  ShieldAlert,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

export interface WalletLedgerDisplayItem {
  id: string;
  txType: string;
  userName: string;
  userCode: string;
  amount: number;
  mode: string;
  referenceNo: string;
  narration: string;
  balanceAfter: number;
  timestamp: string;
}

export const WalletManagementView: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();

  // Tab Selection: CREDIT | DEBIT | HOLD
  const [activeTab, setActiveTab] = useState<'CREDIT' | 'DEBIT' | 'HOLD'>('CREDIT');

  // Search & User Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NetworkUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<NetworkUserItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Balances State for Selected User
  const [balances, setBalances] = useState<{ available: number; hold: number; ledger: number }>({
    available: 0,
    hold: 0,
    ledger: 0,
  });

  // Form Fields
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer (NEFT/RTGS)');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [holdMode, setHoldMode] = useState<'HOLD' | 'RELEASE'>('HOLD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recent Ledger Activity
  const [ledgerLogs, setLedgerLogs] = useState<WalletLedgerDisplayItem[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // Dynamic User Search
  const handleSearchUsers = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await userService.getUsers({ search: query.trim(), pageSize: 8 });
      if (res.success && res.data && res.data.items) {
        setSearchResults(res.data.items);

        // Exact code match auto-select
        const exactMatch = res.data.items.find(
          (u) => u.code.toLowerCase() === query.trim().toLowerCase() || u.userId.toLowerCase() === query.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSelectUser(exactMatch);
        }
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectUser = (user: NetworkUserItem) => {
    setSelectedUser(user);
    setSearchQuery(`${user.fullName} (${user.code})`);
    setSearchResults([]);
    setBalances({
      available: Number(user.availableBalance || 0),
      hold: Number(user.holdBalance || 0),
      ledger: Number(user.ledgerBalance || 0),
    });
    fetchUserWalletDetails(user.partyId || user.id);
  };

  const fetchUserWalletDetails = async (partyId: string) => {
    try {
      const res = await walletService.getWalletByEntityId(partyId);
      if (res.success && res.data) {
        setBalances({
          available: res.data.availableBalance,
          hold: res.data.holdBalance,
          ledger: res.data.ledgerBalance,
        });
      }
    } catch (err) {
      console.warn('Wallet fetch error:', err);
    }
  };

  // Fetch Ledger Log Table
  const fetchRecentLedger = useCallback(async () => {
    setIsLoadingLedger(true);
    try {
      const targetParty = selectedUser ? (selectedUser.partyId || selectedUser.id || selectedUser.code) : 'admin';
      const res = await ledgerService.getPartyLedger(targetParty, {}, 1, 15);
      if (res.success && res.data && res.data.items) {
        const mapped: WalletLedgerDisplayItem[] = res.data.items.map((item: any) => ({
          id: item.id || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          txType: item.type || item.entryType || 'CREDIT',
          userName: item.partyName || item.entityName || selectedUser?.fullName || item.createdBy || 'Network User',
          userCode: item.partyCode || item.partyId || item.entityId || selectedUser?.code || item.walletId || '',
          amount: Number(item.amount || 0),
          mode: item.referenceType || 'Direct Adjustment',
          referenceNo: item.referenceId || 'N/A',
          narration: item.narration || item.description || '',
          balanceAfter: Number(item.availableBalanceAfter || item.closingBalance || 0),
          timestamp: item.createdAt || new Date().toISOString(),
        }));
        setLedgerLogs(mapped);
      }
    } catch (err) {
      console.error('Failed to load ledger entries:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchRecentLedger();
  }, [fetchRecentLedger]);

  const handleClearForm = () => {
    setAmount('');
    setReferenceNo('');
    setReason('');
  };

  const handleExecuteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toastError('Please select a valid user using their Retailer Code (e.g. RET219), Mobile, or Name.');
      return;
    }

    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      toastError('Please enter a valid numeric transaction amount.');
      return;
    }

    const targetPartyId = selectedUser.partyId || selectedUser.id;
    setIsSubmitting(true);

    try {
      if (activeTab === 'CREDIT') {
        const res = await walletService.creditWallet(
          targetPartyId,
          numAmt,
          reason || `Manual credit to ${selectedUser.fullName}`,
          referenceNo || `CR_${Date.now()}`
        );

        if (res.success) {
          toastSuccess(`Successfully credited ${formatCurrency(numAmt)} to ${selectedUser.fullName}!`);
          fetchUserWalletDetails(targetPartyId);
          fetchRecentLedger();
          handleClearForm();
        } else {
          toastError(res.message || 'Failed to credit wallet');
        }
      } else if (activeTab === 'DEBIT') {
        if (numAmt > balances.available) {
          toastError(`Insufficient available balance! Maximum spendable is ${formatCurrency(balances.available)}.`);
          setIsSubmitting(false);
          return;
        }

        const res = await walletService.debitWallet(
          targetPartyId,
          numAmt,
          reason || `Manual debit from ${selectedUser.fullName}`,
          referenceNo || `DB_${Date.now()}`
        );

        if (res.success) {
          toastSuccess(`Successfully debited ${formatCurrency(numAmt)} from ${selectedUser.fullName}!`);
          fetchUserWalletDetails(targetPartyId);
          fetchRecentLedger();
          handleClearForm();
        } else {
          toastError(res.message || 'Failed to debit wallet');
        }
      } else if (activeTab === 'HOLD') {
        const res = await walletService.holdFunds(
          targetPartyId,
          holdMode,
          numAmt,
          reason || `${holdMode === 'HOLD' ? 'Security Hold' : 'Release Hold'} for ${selectedUser.fullName}`
        );

        if (res.success) {
          toastSuccess(
            `Successfully ${holdMode === 'HOLD' ? 'placed ₹' + numAmt + ' on Hold' : 'released ₹' + numAmt + ' from Hold'} for ${selectedUser.fullName}!`
          );
          fetchUserWalletDetails(targetPartyId);
          fetchRecentLedger();
          handleClearForm();
        } else {
          toastError(res.message || 'Failed to process fund hold operation');
        }
      }
    } catch (err: any) {
      toastError(err?.message || 'An error occurred while processing transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTxId = (id: string) => {
    if (!id) return 'TX-000000';
    if (id.startsWith('TX-') && !id.includes('-')) return id;
    const parts = id.split('-');
    if (parts.length > 1) {
      return `TX-${parts[parts.length - 1].toUpperCase()}`;
    }
    return `TX-${id.slice(-8).toUpperCase()}`;
  };

  const formatModeName = (mode: string) => {
    if (!mode || mode === 'N/A') return 'Direct Adjustment';
    return mode
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns: ColumnDefinition<WalletLedgerDisplayItem>[] = [
    {
      key: 'id',
      header: 'Transaction ID & Time',
      render: (row) => (
        <div>
          <div className="font-bold text-[#0F172A] text-xs font-mono tracking-tight" title={row.id}>
            {formatTxId(row.id)}
          </div>
          <div className="text-[11px] text-[#64748B] font-medium">{formatDateTime(row.timestamp)}</div>
        </div>
      ),
    },
    {
      key: 'txType',
      header: 'Action',
      render: (row) => {
        const isCredit = row.txType === 'CREDIT';
        const isHold = row.txType === 'HOLD';
        const isRelease = row.txType === 'RELEASE';

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isCredit
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isHold
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : isRelease
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="w-3 h-3" />
            ) : isHold ? (
              <Lock className="w-3 h-3" />
            ) : isRelease ? (
              <Unlock className="w-3 h-3" />
            ) : (
              <ArrowUpRight className="w-3 h-3" />
            )}
            {row.txType}
          </span>
        );
      },
    },
    {
      key: 'user',
      header: 'User Account',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#0F172A] text-xs">{row.userName}</div>
          {row.userCode && (
            <span className="inline-block mt-0.5 font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
              {row.userCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      render: (row) => (
        <span
          className={`font-extrabold text-xs font-mono ${
            row.txType === 'CREDIT' || row.txType === 'RELEASE' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {row.txType === 'CREDIT' || row.txType === 'RELEASE' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'mode',
      header: 'Mode / Reference',
      render: (row) => (
        <div className="text-xs text-[#334155]">
          <div className="font-semibold">{formatModeName(row.mode)}</div>
          {row.referenceNo && row.referenceNo !== 'N/A' && (
            <div className="font-mono text-[11px] text-[#64748B]">Ref: {row.referenceNo}</div>
          )}
        </div>
      ),
    },
    {
      key: 'narration',
      header: 'Remarks / Narration',
      render: (row) => (
        <div className="text-xs text-[#475569] max-w-[220px] truncate" title={row.narration}>
          {row.narration || '-'}
        </div>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Closing Balance',
      render: (row) => <span className="font-bold text-[#0F172A] text-xs font-mono">{formatCurrency(row.balanceAfter)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#155EEF]" />
            Master Wallet Management & Adjustment Hub
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Perform real-time wallet credits, debits, dispute holds, and audit complete ledger transaction histories.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecentLedger} isLoading={isLoadingLedger}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh Ledger
        </Button>
      </div>

      {/* Main Form Card */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-6">
        {/* Action Tabs: CREDIT | DEBIT | HOLD */}
        <div className="grid grid-cols-3 gap-3 border-b border-[#E2E8F0] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('CREDIT')}
            className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'CREDIT'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Credit Wallet (Top-Up)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEBIT')}
            className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'DEBIT'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            Debit Wallet (Deduct)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HOLD')}
            className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'HOLD'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Hold / Release Funds
          </button>
        </div>

        <form onSubmit={handleExecuteTransaction} className="space-y-5">
          {/* User Search & Auto-fill */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Search User ID / Code / Mobile / Name"
                placeholder="Type Code (e.g. RET219, DST001, MD001) or Mobile..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                rightIcon={<Search className="w-4 h-4 text-[#64748B]" />}
                required
              />

              {/* Autocomplete Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-56 overflow-y-auto">
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {u.fullName}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                            {u.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.roleName || u.role} • Mobile: {u.mobile}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Input
                label="Selected Account Details"
                value={
                  selectedUser
                    ? `${selectedUser.fullName} (${selectedUser.code}) - Role: ${selectedUser.roleName || selectedUser.role}`
                    : 'Search & select user account'
                }
                readOnly
                className="bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs"
              />
            </div>
          </div>

          {/* Real-time Balances Display Badge */}
          {selectedUser && (
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-xs text-[#64748B] font-medium">Available Balance (Spendable)</div>
                <div className="text-lg font-extrabold text-emerald-600 mt-0.5">
                  {formatCurrency(balances.available)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] font-medium">Hold Balance (Reserved)</div>
                <div className="text-lg font-extrabold text-amber-600 mt-0.5">
                  {formatCurrency(balances.hold)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] font-medium">Total Ledger Balance</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {formatCurrency(balances.ledger)}
                </div>
              </div>
            </div>
          )}

          {/* Form Inputs based on Active Tab */}
          {activeTab === 'HOLD' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Hold Mode"
                  value={holdMode}
                  onChange={(e) => setHoldMode(e.target.value as any)}
                  options={[
                    { label: 'Lock Funds on Security Hold', value: 'HOLD' },
                    { label: 'Release Funds from Hold', value: 'RELEASE' },
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Hold Amount (₹)"
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  required
                />
              </div>

              <div>
                <Input
                  label="Reason / Dispute Reference"
                  placeholder="e.g. Chargeback Security Deposit #DS88"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Transaction Amount (₹)"
                  type="number"
                  placeholder="Enter amount in ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  required
                />
              </div>

              <div>
                <Select
                  label="Payment Mode / Category"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  options={[
                    { label: 'Bank Transfer (NEFT/RTGS)', value: 'Bank Transfer (NEFT/RTGS)' },
                    { label: 'UPI Direct', value: 'UPI Direct' },
                    { label: 'Cash Deposit', value: 'Cash Deposit' },
                    { label: 'System Adjustment', value: 'System Adjustment' },
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Bank UTR / Reference / Remarks"
                  placeholder="e.g. UTR98471203948"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleClearForm}>
              Clear
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className={`px-8 font-bold ${
                activeTab === 'CREDIT'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : activeTab === 'DEBIT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {activeTab === 'CREDIT'
                ? 'Credit Wallet Now'
                : activeTab === 'DEBIT'
                ? 'Debit Wallet Now'
                : holdMode === 'HOLD'
                ? 'Place Funds on Hold'
                : 'Release Held Funds'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">Recent Wallet Adjustment Ledger ({ledgerLogs.length})</h2>
        </div>
        <Table columns={columns} data={ledgerLogs} keyExtractor={(r) => r.id} isLoading={isLoadingLedger} />
      </Card>
    </div>
  );
};
