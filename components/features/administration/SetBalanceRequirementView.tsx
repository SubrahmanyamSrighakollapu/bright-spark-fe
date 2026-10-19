'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency } from '@/utils/formatters';
import { Wallet, Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';

export interface BalanceRequirement {
  id: string;
  targetRole: 'Super Distributor' | 'Master Distributor' | 'Distributor' | 'Retailer';
  minMainWalletBalance: number;
  minLeanWalletBalance: number;
  updatedAt: string;
}

const INITIAL_REQUIREMENTS: BalanceRequirement[] = [
  {
    id: 'req_1',
    targetRole: 'Super Distributor',
    minMainWalletBalance: 10000,
    minLeanWalletBalance: 5000,
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'req_2',
    targetRole: 'Master Distributor',
    minMainWalletBalance: 5000,
    minLeanWalletBalance: 2500,
    updatedAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'req_3',
    targetRole: 'Distributor',
    minMainWalletBalance: 2000,
    minLeanWalletBalance: 1000,
    updatedAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'req_4',
    targetRole: 'Retailer',
    minMainWalletBalance: 500,
    minLeanWalletBalance: 200,
    updatedAt: '2026-09-15T09:15:00Z',
  },
];

export const SetBalanceRequirementView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [requirements, setRequirements] = useState<BalanceRequirement[]>(INITIAL_REQUIREMENTS);

  // Form / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<BalanceRequirement | null>(null);
  const [targetRole, setTargetRole] = useState<'Super Distributor' | 'Master Distributor' | 'Distributor' | 'Retailer'>('Retailer');
  const [minMainWalletBalance, setMinMainWalletBalance] = useState<number>(500);
  const [minLeanWalletBalance, setMinLeanWalletBalance] = useState<number>(200);

  const handleOpenAdd = () => {
    setEditingReq(null);
    setTargetRole('Retailer');
    setMinMainWalletBalance(500);
    setMinLeanWalletBalance(200);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req: BalanceRequirement) => {
    setEditingReq(req);
    setTargetRole(req.targetRole);
    setMinMainWalletBalance(req.minMainWalletBalance);
    setMinLeanWalletBalance(req.minLeanWalletBalance);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReq) {
      setRequirements((prev) =>
        prev.map((r) =>
          r.id === editingReq.id
            ? {
                ...r,
                targetRole,
                minMainWalletBalance: Number(minMainWalletBalance),
                minLeanWalletBalance: Number(minLeanWalletBalance),
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toastSuccess(`Balance requirement updated for ${targetRole}!`);
    } else {
      const newReq: BalanceRequirement = {
        id: `req_${Date.now()}`,
        targetRole,
        minMainWalletBalance: Number(minMainWalletBalance),
        minLeanWalletBalance: Number(minLeanWalletBalance),
        updatedAt: new Date().toISOString(),
      };
      setRequirements([...requirements, newReq]);
      toastSuccess(`Minimum balance rule created for ${targetRole}!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, role: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    toastInfo(`Removed balance requirement for ${role}.`);
  };

  const columns: ColumnDefinition<BalanceRequirement>[] = [
    {
      key: 'targetRole',
      header: 'Target User Role',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2F6F5E]" />
          <span className="font-bold text-[#0F172A]">{row.targetRole}</span>
        </div>
      ),
    },
    {
      key: 'minMainWalletBalance',
      header: 'Min Main Wallet Balance (₹)',
      render: (row) => (
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          {formatCurrency(row.minMainWalletBalance)}
        </span>
      ),
    },
    {
      key: 'minLeanWalletBalance',
      header: 'Min Lean Wallet Balance (₹)',
      render: (row) => (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-[#D4E1AE]">
          {formatCurrency(row.minLeanWalletBalance)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 px-2 text-[#2F6F5E] hover:bg-[#F1F5F9]"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.targetRole)}
            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#2F6F5E]" />
            Minimum Wallet Balance Requirement
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Set mandatory safety buffer balances that users must maintain in their Main and Lean wallets for active operations.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Set Balance Rule
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={requirements} keyExtractor={(r) => r.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingReq ? `Edit Requirement: ${editingReq.targetRole}` : 'Configure Minimum Balance Rule'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Select
                label="Target User Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                options={[
                  { label: 'Super Distributor', value: 'Super Distributor' },
                  { label: 'Master Distributor', value: 'Master Distributor' },
                  { label: 'Distributor', value: 'Distributor' },
                  { label: 'Retailer', value: 'Retailer' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Min Main Wallet Balance (₹) <span className="text-xs text-[#64748B] font-normal">(Required to process txs)</span>
              </label>
              <Input
                type="number"
                value={minMainWalletBalance}
                onChange={(e) => setMinMainWalletBalance(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Min Lean Wallet Balance (₹) <span className="text-xs text-[#64748B] font-normal">(Settlement safety reserve)</span>
              </label>
              <Input
                type="number"
                value={minLeanWalletBalance}
                onChange={(e) => setMinLeanWalletBalance(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Requirement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
