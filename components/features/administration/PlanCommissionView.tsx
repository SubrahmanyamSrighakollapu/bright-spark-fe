'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { Percent, Plus, Edit, Trash2, GitBranch, ArrowRight } from 'lucide-react';

export interface CommissionConfig {
  id: string;
  categoryName: string; // e.g. Paddy / Rice Crops, Seeds & Fertilisers, Financial Payouts
  calcType: 'Percentage' | 'Fixed';
  sdCommission: number; // Super Distributor
  mdCommission: number; // Master Distributor
  dsCommission: number; // Distributor
  retCommission: number; // Retailer
  updatedAt: string;
}

const INITIAL_COMMISSIONS: CommissionConfig[] = [
  {
    id: 'comm_1',
    categoryName: 'Paddy / Grain Procurement',
    calcType: 'Percentage',
    sdCommission: 0.50,
    mdCommission: 0.75,
    dsCommission: 1.00,
    retCommission: 15.00, // ₹15 / Qtl
    updatedAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'comm_2',
    categoryName: 'Seeds & Fertilizer Orders',
    calcType: 'Percentage',
    sdCommission: 0.60,
    mdCommission: 0.85,
    dsCommission: 1.20,
    retCommission: 25.00,
    updatedAt: '2026-09-15T12:00:00Z',
  },
  {
    id: 'comm_3',
    categoryName: 'Instant Bank Payout Services',
    calcType: 'Fixed',
    sdCommission: 2.00,
    mdCommission: 3.50,
    dsCommission: 5.00,
    retCommission: 10.00,
    updatedAt: '2026-09-20T16:45:00Z',
  },
];

export const PlanCommissionView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [commissions, setCommissions] = useState<CommissionConfig[]>(INITIAL_COMMISSIONS);

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommissionConfig | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [calcType, setCalcType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [sdCommission, setSdCommission] = useState<number>(0.5);
  const [mdCommission, setMdCommission] = useState<number>(0.75);
  const [dsCommission, setDsCommission] = useState<number>(1.0);
  const [retCommission, setRetCommission] = useState<number>(15.0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCategoryName('');
    setCalcType('Percentage');
    setSdCommission(0.5);
    setMdCommission(0.75);
    setDsCommission(1.0);
    setRetCommission(15.0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CommissionConfig) => {
    setEditingItem(item);
    setCategoryName(item.categoryName);
    setCalcType(item.calcType);
    setSdCommission(item.sdCommission);
    setMdCommission(item.mdCommission);
    setDsCommission(item.dsCommission);
    setRetCommission(item.retCommission);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingItem) {
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === editingItem.id
            ? {
                ...c,
                categoryName,
                calcType,
                sdCommission: Number(sdCommission),
                mdCommission: Number(mdCommission),
                dsCommission: Number(dsCommission),
                retCommission: Number(retCommission),
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      toastSuccess(`Commission structure for "${categoryName}" updated!`);
    } else {
      const newItem: CommissionConfig = {
        id: `comm_${Date.now()}`,
        categoryName,
        calcType,
        sdCommission: Number(sdCommission),
        mdCommission: Number(mdCommission),
        dsCommission: Number(dsCommission),
        retCommission: Number(retCommission),
        updatedAt: new Date().toISOString(),
      };
      setCommissions([...commissions, newItem]);
      toastSuccess(`Commission rule for "${categoryName}" created!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setCommissions((prev) => prev.filter((c) => c.id !== id));
    toastInfo(`Removed commission structure for "${name}".`);
  };

  const columns: ColumnDefinition<CommissionConfig>[] = [
    {
      key: 'categoryName',
      header: 'Category / Product',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{row.categoryName}</div>
          <div className="text-xs text-[#64748B]">Type: {row.calcType} Rate</div>
        </div>
      ),
    },
    {
      key: 'sdCommission',
      header: 'Super Distributor (SD)',
      render: (row) => (
        <span className="font-medium text-[#0F172A]">
          {row.calcType === 'Percentage' ? `${row.sdCommission}%` : `₹${row.sdCommission.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'mdCommission',
      header: 'Master Distributor (MD)',
      render: (row) => (
        <span className="font-medium text-[#0F172A]">
          {row.calcType === 'Percentage' ? `${row.mdCommission}%` : `₹${row.mdCommission.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'dsCommission',
      header: 'Distributor (DS)',
      render: (row) => (
        <span className="font-medium text-[#0F172A]">
          {row.calcType === 'Percentage' ? `${row.dsCommission}%` : `₹${row.dsCommission.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'retCommission',
      header: 'Retailer (RET)',
      render: (row) => (
        <span className="font-bold text-[#155EEF]">
          {row.calcType === 'Percentage' ? `${row.retCommission}%` : `₹${row.retCommission.toFixed(2)} / Unit`}
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
            onClick={() => handleDelete(row.id, row.categoryName)}
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#155EEF]" />
            Multi-Level Plan Commission Configuration
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Set multi-tier revenue distribution margin rates across Super Distributors (SD), Master Distributors (MD), Distributors (DS), and Retailers.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rate Rule
        </Button>
      </div>

      {/* Downline Flow Diagram Header Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 border border-[#E5EAF1] rounded-xl flex items-center justify-between text-xs text-[#475569]">
        <div className="font-semibold text-[#0F172A]">Distribution Chain:</div>
        <div className="flex items-center gap-2 font-medium">
          <span className="px-2 py-1 bg-white border border-[#CBD5E1] rounded text-[#0F172A]">Super Admin</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#155EEF]" />
          <span className="px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded">SD (sdCommission)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#155EEF]" />
          <span className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded">MD (mdCommission)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#155EEF]" />
          <span className="px-2 py-1 bg-white border border-violet-200 text-violet-700 rounded">DS (dsCommission)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#155EEF]" />
          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-bold">RET (retCommission)</span>
        </div>
      </Card>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={commissions} keyExtractor={(c) => c.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? `Edit Commission: ${editingItem.categoryName}` : 'Add Plan Commission Structure'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Category / Product Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Paddy Procurement Tier 1"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Calculation Type</label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Super Distributor (sdCommission)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={sdCommission}
                  onChange={(e) => setSdCommission(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Master Distributor (mdCommission)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={mdCommission}
                  onChange={(e) => setMdCommission(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Distributor (dsCommission)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={dsCommission}
                  onChange={(e) => setDsCommission(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Retailer (retCommission)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={retCommission}
                  onChange={(e) => setRetCommission(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Rate Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
