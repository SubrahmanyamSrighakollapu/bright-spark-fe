'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Wallet,
  PlusCircle,
  MinusCircle,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from 'lucide-react';

export interface WalletTransactionItem {
  srNo: number;
  transDate: string;
  transId: string;
  userName: string;
  mobile: string;
  userId: string;
  role: 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
  businessName: string;
  walletFrom: string;
  walletTo: string;
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

const MOCK_WALLET_LOGS: WalletTransactionItem[] = [
  {
    srNo: 1,
    transDate: '2026-09-26T14:30:00Z',
    transId: 'WLT2026092601',
    userName: 'Ramesh Kumar Hub',
    mobile: '9876543210',
    userId: 'MD901',
    role: 'MASTER_DISTRIBUTOR',
    businessName: 'Ramesh Hub & Services',
    walletFrom: 'SYSTEM_MAIN',
    walletTo: 'MD901_WALLET',
    type: 'CREDIT',
    amount: 50000.0,
    status: 'SUCCESS',
  },
  {
    srNo: 2,
    transDate: '2026-09-26T12:15:00Z',
    transId: 'WLT2026092602',
    userName: 'Apex Distro Agency',
    mobile: '9812345678',
    userId: 'DST402',
    role: 'DISTRIBUTOR',
    businessName: 'Apex Distro Agency',
    walletFrom: 'DST402_WALLET',
    walletTo: 'SYSTEM_MAIN',
    type: 'DEBIT',
    amount: 1500.0,
    status: 'SUCCESS',
  },
  {
    srNo: 3,
    transDate: '2026-09-25T17:45:00Z',
    transId: 'WLT2026092509',
    userName: 'Zenith Retail Mart',
    mobile: '9988776655',
    userId: 'RET2045',
    role: 'RETAILER',
    businessName: 'Zenith Retail Mart',
    walletFrom: 'DST402_WALLET',
    walletTo: 'RET2045_WALLET',
    type: 'TRANSFER',
    amount: 10000.0,
    status: 'SUCCESS',
  },
];

export const AddWalletView: React.FC = () => {
  const { toastSuccess, toastError } = useToast();

  const [logs, setLogs] = useState<WalletTransactionItem[]>(MOCK_WALLET_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal Actions
  const [actionModalType, setActionModalType] = useState<'CREDIT' | 'DEBIT' | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesRole && matchesType;
  });

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountInput);
    if (!targetUserId) {
      toastError('Please specify a valid User ID / User Name.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toastError('Please enter a valid amount greater than ₹0.');
      return;
    }

    const newLog: WalletTransactionItem = {
      srNo: logs.length + 1,
      transDate: new Date().toISOString(),
      transId: `WLT${Date.now().toString().slice(-8)}`,
      userName: targetUserId === 'MD901' ? 'Ramesh Kumar Hub' : 'Zenith Retail Mart',
      mobile: '9876543210',
      userId: targetUserId,
      role: targetUserId.startsWith('MD') ? 'MASTER_DISTRIBUTOR' : targetUserId.startsWith('DST') ? 'DISTRIBUTOR' : 'RETAILER',
      businessName: 'Operational Downline Partner',
      walletFrom: actionModalType === 'CREDIT' ? 'SYSTEM_MAIN' : `${targetUserId}_WALLET`,
      walletTo: actionModalType === 'CREDIT' ? `${targetUserId}_WALLET` : 'SYSTEM_MAIN',
      type: actionModalType === 'CREDIT' ? 'CREDIT' : 'DEBIT',
      amount: numAmount,
      status: 'SUCCESS',
    };

    setLogs([newLog, ...logs]);
    toastSuccess(
      `Wallet ${actionModalType === 'CREDIT' ? 'Credit' : 'Debit'} of ${formatCurrency(numAmount)} for user ${targetUserId} executed successfully!`
    );

    setActionModalType(null);
    setTargetUserId('');
    setAmountInput('');
    setNoteInput('');
  };

  const columns: ColumnDefinition<WalletTransactionItem>[] = [
    { key: 'srNo', header: 'Sr No', align: 'center', render: (r) => <span className="font-mono text-xs text-[#64748B]">{r.srNo}</span> },
    { key: 'transDate', header: 'Trans Date', render: (r) => <span className="font-mono text-xs whitespace-nowrap">{formatDateTime(r.transDate)}</span> },
    { key: 'transId', header: 'Trans ID', render: (r) => <span className="font-mono font-bold text-[#155EEF] text-xs">{r.transId}</span> },
    {
      key: 'userName',
      header: 'User Name & Business',
      render: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{r.userName}</div>
          <div className="text-[11px] text-[#64748B]">{r.businessName} • {r.mobile}</div>
        </div>
      ),
    },
    { key: 'userId', header: 'User ID', align: 'center', render: (r) => <span className="font-mono font-semibold text-xs text-[#334155]">{r.userId}</span> },
    {
      key: 'role',
      header: 'Role',
      align: 'center',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F8FAFC] border border-[#E5EAF1] text-[#334155]">
          {r.role}
        </span>
      ),
    },
    { key: 'walletFrom', header: 'Wallet From', render: (r) => <span className="font-mono text-[11px] text-[#64748B]">{r.walletFrom}</span> },
    { key: 'walletTo', header: 'Wallet To', render: (r) => <span className="font-mono text-[11px] text-[#64748B]">{r.walletTo}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => (
        <span
          className={`font-mono font-extrabold tabular-nums ${
            r.type === 'CREDIT' ? 'text-emerald-600' : r.type === 'DEBIT' ? 'text-rose-600' : 'text-[#155EEF]'
          }`}
        >
          {r.type === 'CREDIT' ? '+' : r.type === 'DEBIT' ? '-' : ''}{formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Manual Actions */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#155EEF]" />
            Add Wallet (AddWallet)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Audit wallet balances and manually execute credit/debit adjustments for downline users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setActionModalType('DEBIT');
              setTargetUserId('RET2045');
            }}
            leftIcon={<MinusCircle className="w-4 h-4 text-rose-600" />}
          >
            - Deduct Wallet (Debit)
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setActionModalType('CREDIT');
              setTargetUserId('RET2045');
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            + Add Amount (Credit)
          </Button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <Card noPadding>
        <div className="p-4 border-b border-[#E5EAF1] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by User Name, Mobile, User ID or Trans ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Roles (MD, DS, Retailer)' },
                { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor' },
                { value: 'DISTRIBUTOR', label: 'Distributor' },
                { value: 'RETAILER', label: 'Retailer' },
              ]}
            />

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Types (Credit, Debit, Transfer)' },
                { value: 'CREDIT', label: 'Credit (Add Amount)' },
                { value: 'DEBIT', label: 'Debit (Deduct)' },
                { value: 'TRANSFER', label: 'Downline Transfer' },
              ]}
            />
          </div>
        </div>

        {/* Wallet Audit Table */}
        <div className="overflow-x-auto">
          <Table columns={columns} data={filteredLogs} keyExtractor={(r) => r.transId} />
        </div>
      </Card>

      {/* Manual Wallet Action Modal */}
      {actionModalType && (
        <Modal
          isOpen={!!actionModalType}
          onClose={() => setActionModalType(null)}
          title={`Manual Wallet Action: ${actionModalType === 'CREDIT' ? 'Add Amount (Credit)' : 'Deduct from Wallet (Debit)'}`}
          size="md"
        >
          <form onSubmit={handleExecuteAction} className="space-y-4 text-xs pt-2">
            <Select
              label="Select Downline User / ID"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              options={[
                { value: 'MD901', label: 'MD901 - Ramesh Kumar Hub (Master Dist)' },
                { value: 'DST402', label: 'DST402 - Apex Distro Agency (Distributor)' },
                { value: 'RET2045', label: 'RET2045 - Zenith Retail Mart (Retailer)' },
              ]}
            />

            <Input
              label={`Amount in ₹ to ${actionModalType === 'CREDIT' ? 'Credit' : 'Deduct'}`}
              type="number"
              placeholder="e.g. 5000.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              required
            />

            <Input
              label="Reason / Reference Note"
              placeholder="e.g. Administrative Adjustment / Security Reconcile"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setActionModalType(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Execute Wallet {actionModalType === 'CREDIT' ? 'Credit' : 'Debit'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
