'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Wallet,
  PlusCircle,
  MinusCircle,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  UserCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from 'lucide-react';

export interface WalletLedgerRecord {
  id: string;
  txType: 'CREDIT' | 'DEBIT';
  userId: string;
  userName: string;
  walletType: 'Main Wallet' | 'Lean Wallet';
  amount: number;
  paymentMode: string;
  referenceNo: string;
  attachmentUrl?: string;
  balanceAfter: number;
  timestamp: string;
}

const MOCK_USER_DATABASE: Record<string, { userName: string; mainBalance: number; leanBalance: number }> = {
  'USR-204': { userName: 'Rajesh Kumar (SD)', mainBalance: 14000, leanBalance: 5000 },
  'USR-205': { userName: 'Venkatesh Rao (MD)', mainBalance: 28500, leanBalance: 8000 },
  'USR-206': { userName: 'Suresh Patel (DS)', mainBalance: 9200, leanBalance: 2000 },
  'USR-207': { userName: 'Anil Reddy (Retailer)', mainBalance: 4500, leanBalance: 1200 },
};

const INITIAL_LEDGER: WalletLedgerRecord[] = [
  {
    id: 'TX-904812',
    txType: 'CREDIT',
    userId: 'USR-204',
    userName: 'Rajesh Kumar (SD)',
    walletType: 'Main Wallet',
    amount: 5000,
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: 'UTR98471203948',
    balanceAfter: 14000,
    timestamp: '2026-09-26T15:30:00Z',
  },
  {
    id: 'TX-904811',
    txType: 'DEBIT',
    userId: 'USR-207',
    userName: 'Anil Reddy (Retailer)',
    walletType: 'Lean Wallet',
    amount: 800,
    paymentMode: 'Cash',
    referenceNo: 'MANUAL_DEBIT_ADJ_02',
    balanceAfter: 1200,
    timestamp: '2026-09-26T12:15:00Z',
  },
];

export const WalletManagementView: React.FC = () => {
  const { toastSuccess, toastInfo, toastError } = useToast();

  // Tab: CREDIT vs DEBIT
  const [txType, setTxType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');

  // Form Fields
  const [userIdInput, setUserIdInput] = useState('USR-204');
  const [userName, setUserName] = useState('Rajesh Kumar (SD)');
  const [walletType, setWalletType] = useState<'Main Wallet' | 'Lean Wallet'>('Main Wallet');
  const [currentBalance, setCurrentBalance] = useState<number>(14000);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Recent Ledger Activity
  const [ledger, setLedger] = useState<WalletLedgerRecord[]>(INITIAL_LEDGER);

  // Auto-fill User Name and Current Balance when User ID changes
  const handleUserIdSearch = (id: string) => {
    setUserIdInput(id);
    const found = MOCK_USER_DATABASE[id.trim().toUpperCase()];
    if (found) {
      setUserName(found.userName);
      setCurrentBalance(walletType === 'Main Wallet' ? found.mainBalance : found.leanBalance);
    } else if (id.trim().length >= 3) {
      setUserName('User ID not found');
      setCurrentBalance(0);
    } else {
      setUserName('');
      setCurrentBalance(0);
    }
  };

  const handleWalletTypeChange = (type: 'Main Wallet' | 'Lean Wallet') => {
    setWalletType(type);
    const found = MOCK_USER_DATABASE[userIdInput.trim().toUpperCase()];
    if (found) {
      setCurrentBalance(type === 'Main Wallet' ? found.mainBalance : found.leanBalance);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      toastSuccess(`Attached payment proof: ${file.name}`);
    }
  };

  const handleClearForm = () => {
    setAmount('');
    setReferenceNo('');
    setProofFile(null);
  };

  const handleExecuteTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim() || !userName || userName.includes('not found')) {
      toastError('Please enter a valid platform User ID.');
      return;
    }
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      toastError('Please enter a valid numeric transaction amount.');
      return;
    }

    if (txType === 'DEBIT' && numAmt > currentBalance) {
      toastError(`Insufficient balance! User balance is ${formatCurrency(currentBalance)}.`);
      return;
    }

    const nextBalance = txType === 'CREDIT' ? currentBalance + numAmt : currentBalance - numAmt;
    setCurrentBalance(nextBalance);

    // Record in local user database
    const found = MOCK_USER_DATABASE[userIdInput.trim().toUpperCase()];
    if (found) {
      if (walletType === 'Main Wallet') found.mainBalance = nextBalance;
      else found.leanBalance = nextBalance;
    }

    const newRecord: WalletLedgerRecord = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      txType,
      userId: userIdInput.trim().toUpperCase(),
      userName,
      walletType,
      amount: numAmt,
      paymentMode,
      referenceNo: referenceNo || 'DIRECT_ADJUSTMENT',
      attachmentUrl: proofFile ? proofFile.name : undefined,
      balanceAfter: nextBalance,
      timestamp: new Date().toISOString(),
    };

    setLedger([newRecord, ...ledger]);

    toastSuccess(
      `Successfully ${txType === 'CREDIT' ? 'credited' : 'debited'} ${formatCurrency(numAmt)} for ${userName}!`
    );

    handleClearForm();
  };

  const columns: ColumnDefinition<WalletLedgerRecord>[] = [
    {
      key: 'id',
      header: 'Tx ID & Time',
      render: (row) => (
        <div>
          <div className="font-bold text-[#0F172A]">{row.id}</div>
          <div className="text-[11px] text-[#64748B]">{formatDateTime(row.timestamp)}</div>
        </div>
      ),
    },
    {
      key: 'txType',
      header: 'Action',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            row.txType === 'CREDIT'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {row.txType === 'CREDIT' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {row.txType}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User & Wallet',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{row.userName}</div>
          <div className="text-xs text-[#64748B]">
            {row.userId} • <span className="font-medium text-[#155EEF]">{row.walletType}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      render: (row) => (
        <span
          className={`font-bold ${row.txType === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {row.txType === 'CREDIT' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'mode',
      header: 'Mode & UTR',
      render: (row) => (
        <div className="text-xs text-[#334155]">
          <div>{row.paymentMode}</div>
          <div className="font-mono text-[11px] text-[#64748B]">{row.referenceNo}</div>
        </div>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      render: (row) => <span className="font-semibold text-[#0F172A]">{formatCurrency(row.balanceAfter)}</span>,
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
          <p className="text-sm text-[#64748B] mt-0.5">
            Manual wallet balance credits/debits, payment proof uploads, and real-time ledger audit trails.
          </p>
        </div>
      </div>

      {/* Main Workflow Form Card */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-6">
        {/* Action Tab Selection */}
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <button
            type="button"
            onClick={() => setTxType('CREDIT')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
              txType === 'CREDIT'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            Credit Wallet Tab (Add Funds)
          </button>
          <button
            type="button"
            onClick={() => setTxType('DEBIT')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
              txType === 'DEBIT'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MinusCircle className="w-5 h-5" />
            Debit Wallet Tab (Deduct Funds)
          </button>
        </div>

        <form onSubmit={handleExecuteTransaction} className="space-y-5">
          {/* User ID Search & Auto-fill */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Platform User ID (userId) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. USR-204"
                  value={userIdInput}
                  onChange={(e) => handleUserIdSearch(e.target.value)}
                  className="pr-8"
                  required
                />
                <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
              </div>
              <div className="text-[10px] text-[#64748B] mt-1">Available test IDs: USR-204, USR-205, USR-206, USR-207</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">User Name (Auto-filled)</label>
              <Input
                value={userName}
                readOnly
                className="bg-[#F8FAFC] text-[#0F172A] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Wallet Type</label>
              <select
                value={walletType}
                onChange={(e) => handleWalletTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              >
                <option value="Main Wallet">Main Wallet</option>
                <option value="Lean Wallet">Lean Wallet</option>
              </select>
            </div>
          </div>

          {/* Current Balance Display Badge & Amount Input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <div className="text-xs text-[#64748B] font-medium">Current Selected Balance (currentBalance)</div>
              <div className="text-xl font-extrabold text-[#0F172A] mt-0.5">
                {formatCurrency(currentBalance)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Transaction Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="Enter amount in ₹"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] bg-white"
              >
                <option value="UPI">UPI Direct</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cash">Cash Deposit</option>
                <option value="System Adjustment">System Manual Adjustment</option>
              </select>
            </div>
          </div>

          {/* Reference No & Proof Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Bank UTR / Reference Number (referenceNo)
              </label>
              <Input
                placeholder="e.g. UTR98471203948"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Upload Payment Proof Attachment (PNG, JPG, PDF)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  <div className="px-3 py-2 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-[#155EEF]" />
                    {proofFile ? proofFile.name : 'Choose File / Drag & Drop'}
                  </div>
                </label>
                {proofFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setProofFile(null)} className="text-rose-600">
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClearForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={`px-8 font-bold ${
                txType === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {txType === 'CREDIT' ? 'Credit Wallet Now' : 'Debit Wallet Now'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">Recent Wallet Adjustment Ledger ({ledger.length})</h2>
        </div>
        <Table columns={columns} data={ledger} keyExtractor={(r) => r.id} />
      </Card>
    </div>
  );
};
