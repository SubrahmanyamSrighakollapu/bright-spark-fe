'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatCurrency } from '@/utils/formatters';
import { ArrowUpRight, Plus, Edit, Trash2, Zap } from 'lucide-react';

export interface PayoutChargeRule {
  id: string;
  payoutMode: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';
  minAmount: number;
  maxAmount: number;
  deductionType: 'Flat Amount (₹)' | 'Percentage (%)';
  chargeRate: number;
  createdAt: string;
}

const INITIAL_PAYOUT_CHARGES: PayoutChargeRule[] = [
  {
    id: 'pc_1',
    payoutMode: 'IMPS',
    minAmount: 1,
    maxAmount: 25000,
    deductionType: 'Flat Amount (₹)',
    chargeRate: 5.0,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'pc_2',
    payoutMode: 'IMPS',
    minAmount: 25001,
    maxAmount: 200000,
    deductionType: 'Flat Amount (₹)',
    chargeRate: 10.0,
    createdAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 'pc_3',
    payoutMode: 'NEFT',
    minAmount: 1,
    maxAmount: 500000,
    deductionType: 'Flat Amount (₹)',
    chargeRate: 3.5,
    createdAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'pc_4',
    payoutMode: 'RTGS',
    minAmount: 200000,
    maxAmount: 2000000,
    deductionType: 'Percentage (%)',
    chargeRate: 0.15,
    createdAt: '2026-08-10T15:00:00Z',
  },
  {
    id: 'pc_5',
    payoutMode: 'UPI',
    minAmount: 1,
    maxAmount: 100000,
    deductionType: 'Flat Amount (₹)',
    chargeRate: 2.0,
    createdAt: '2026-09-01T09:00:00Z',
  },
];

export const PayoutChargesManagerView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [charges, setCharges] = useState<PayoutChargeRule[]>(INITIAL_PAYOUT_CHARGES);

  // Form / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PayoutChargeRule | null>(null);
  const [payoutMode, setPayoutMode] = useState<'IMPS' | 'NEFT' | 'RTGS' | 'UPI'>('IMPS');
  const [minAmount, setMinAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(200000);
  const [deductionType, setDeductionType] = useState<'Flat Amount (₹)' | 'Percentage (%)'>('Flat Amount (₹)');
  const [chargeRate, setChargeRate] = useState<number>(5.0);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setPayoutMode('IMPS');
    setMinAmount(1);
    setMaxAmount(200000);
    setDeductionType('Flat Amount (₹)');
    setChargeRate(5.0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: PayoutChargeRule) => {
    setEditingRule(rule);
    setPayoutMode(rule.payoutMode);
    setMinAmount(rule.minAmount);
    setMaxAmount(rule.maxAmount);
    setDeductionType(rule.deductionType);
    setChargeRate(rule.chargeRate);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      setCharges((prev) =>
        prev.map((c) =>
          c.id === editingRule.id
            ? {
                ...c,
                payoutMode,
                minAmount: Number(minAmount),
                maxAmount: Number(maxAmount),
                deductionType,
                chargeRate: Number(chargeRate),
              }
            : c
        )
      );
      toastSuccess(`Payout charge rule for ${payoutMode} updated!`);
    } else {
      const newRule: PayoutChargeRule = {
        id: `pc_${Date.now()}`,
        payoutMode,
        minAmount: Number(minAmount),
        maxAmount: Number(maxAmount),
        deductionType,
        chargeRate: Number(chargeRate),
        createdAt: new Date().toISOString(),
      };
      setCharges([...charges, newRule]);
      toastSuccess(`Payout charge rule for ${payoutMode} created!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, mode: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
    toastInfo(`Removed ${mode} payout charge rule.`);
  };

  const columns: ColumnDefinition<PayoutChargeRule>[] = [
    {
      key: 'payoutMode',
      header: 'Payout Mode',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
          <Zap className="w-3 h-3 text-[#155EEF]" />
          {row.payoutMode}
        </span>
      ),
    },
    {
      key: 'minAmount',
      header: 'Min Amount (₹)',
      render: (row) => <span className="font-medium text-[#0F172A]">{formatCurrency(row.minAmount)}</span>,
    },
    {
      key: 'maxAmount',
      header: 'Max Amount (₹)',
      render: (row) => <span className="font-medium text-[#0F172A]">{formatCurrency(row.maxAmount)}</span>,
    },
    {
      key: 'deductionType',
      header: 'Deduction Type',
      render: (row) => <span className="text-xs text-[#475569]">{row.deductionType}</span>,
    },
    {
      key: 'chargeRate',
      header: 'Charge Rate',
      render: (row) => (
        <span className="font-bold text-[#155EEF]">
          {row.deductionType === 'Percentage (%)' ? `${row.chargeRate}%` : `₹${row.chargeRate.toFixed(2)}`}
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
            className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.payoutMode)}
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
            <ArrowUpRight className="w-6 h-6 text-[#155EEF]" />
            Payout Service Charges Manager
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Define platform service charges deducted when users execute bank payouts or wallet withdrawals.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Charge Rule
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={charges} keyExtractor={(c) => c.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRule ? `Edit Payout Rule (${editingRule.payoutMode})` : 'Create Payout Charge Rule'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Payout Mode</label>
              <select
                value={payoutMode}
                onChange={(e) => setPayoutMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="IMPS">IMPS</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Min Amount (₹)</label>
                <Input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Max Amount (₹)</label>
                <Input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Deduction Type</label>
              <select
                value={deductionType}
                onChange={(e) => setDeductionType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Flat Amount (₹)">Flat Amount (₹)</option>
                <option value="Percentage (%)">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Charge Rate {deductionType === 'Percentage (%)' ? '(%)' : '(₹)'}
              </label>
              <Input
                type="number"
                step="0.01"
                value={chargeRate}
                onChange={(e) => setChargeRate(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
