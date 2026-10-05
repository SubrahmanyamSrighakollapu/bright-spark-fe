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
import { CreditCard, QrCode, Building2, Wallet, Plus, Edit, Power, CheckCircle2 } from 'lucide-react';

export interface PaymentMethodOption {
  id: string;
  methodName: string;
  displayLabel: string;
  minLimit: number;
  maxLimit: number;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

const INITIAL_METHODS: PaymentMethodOption[] = [
  {
    id: 'pm_1',
    methodName: 'UPI Direct / Intent',
    displayLabel: 'UPI (GPay, PhonePe, Paytm)',
    minLimit: 1,
    maxLimit: 100000,
    status: 'Enabled',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'pm_2',
    methodName: 'Bank Transfer / NEFT / IMPS',
    displayLabel: 'Direct Bank Transfer',
    minLimit: 100,
    maxLimit: 1000000,
    status: 'Enabled',
    createdAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 'pm_3',
    methodName: 'Credit / Debit Card',
    displayLabel: 'Visa, MasterCard, RuPay Cards',
    minLimit: 50,
    maxLimit: 200000,
    status: 'Enabled',
    createdAt: '2026-08-05T12:00:00Z',
  },
  {
    id: 'pm_4',
    methodName: 'Net Banking',
    displayLabel: '50+ Major Indian Banks',
    minLimit: 100,
    maxLimit: 500000,
    status: 'Enabled',
    createdAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'pm_5',
    methodName: 'Dynamic QR Code',
    displayLabel: 'Instant Scan & Pay QR',
    minLimit: 1,
    maxLimit: 50000,
    status: 'Disabled',
    createdAt: '2026-09-01T09:00:00Z',
  },
];

export const PaymentMethodsManagerView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [methods, setMethods] = useState<PaymentMethodOption[]>(INITIAL_METHODS);

  // Form / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodOption | null>(null);
  const [methodName, setMethodName] = useState('');
  const [displayLabel, setDisplayLabel] = useState('');
  const [minLimit, setMinLimit] = useState<number>(1);
  const [maxLimit, setMaxLimit] = useState<number>(100000);
  const [status, setStatus] = useState<'Enabled' | 'Disabled'>('Enabled');

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setMethodName('');
    setDisplayLabel('');
    setMinLimit(1);
    setMaxLimit(100000);
    setStatus('Enabled');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pm: PaymentMethodOption) => {
    setEditingMethod(pm);
    setMethodName(pm.methodName);
    setDisplayLabel(pm.displayLabel);
    setMinLimit(pm.minLimit);
    setMaxLimit(pm.maxLimit);
    setStatus(pm.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim() || !displayLabel.trim()) return;

    if (editingMethod) {
      setMethods((prev) =>
        prev.map((m) =>
          m.id === editingMethod.id
            ? {
                ...m,
                methodName,
                displayLabel,
                minLimit: Number(minLimit),
                maxLimit: Number(maxLimit),
                status,
              }
            : m
        )
      );
      toastSuccess(`Payment method "${displayLabel}" updated!`);
    } else {
      const newMethod: PaymentMethodOption = {
        id: `pm_${Date.now()}`,
        methodName,
        displayLabel,
        minLimit: Number(minLimit),
        maxLimit: Number(maxLimit),
        status,
        createdAt: new Date().toISOString(),
      };
      setMethods([...methods, newMethod]);
      toastSuccess(`Payment method "${displayLabel}" created!`);
    }

    setIsModalOpen(false);
  };

  const handleToggle = (id: string, label: string) => {
    setMethods((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = m.status === 'Enabled' ? 'Disabled' : 'Enabled';
          toastInfo(`Payment option "${label}" is now ${next}.`);
          return { ...m, status: next };
        }
        return m;
      })
    );
  };

  const columns: ColumnDefinition<PaymentMethodOption>[] = [
    {
      key: 'methodName',
      header: 'Method Name & Label',
      render: (row) => (
        <div>
          <div className="font-bold text-[#0F172A]">{row.displayLabel}</div>
          <div className="text-xs text-[#64748B]">{row.methodName}</div>
        </div>
      ),
    },
    {
      key: 'limits',
      header: 'Transaction Limits (Min — Max)',
      render: (row) => (
        <span className="text-xs font-semibold text-[#334155]">
          {formatCurrency(row.minLimit)} — {formatCurrency(row.maxLimit)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggle(row.id, row.displayLabel)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            row.status === 'Enabled'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          <Power className="w-3 h-3" />
          {row.status}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenEdit(row)}
          className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit Limits
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#155EEF]" />
            Client Payment Methods Manager
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Enable, disable, and configure min/max transaction limit boundaries for checkout options.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={methods} keyExtractor={(m) => m.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMethod ? `Edit Method: ${editingMethod.displayLabel}` : 'Configure Checkout Payment Option'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Internal Method Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. UPI Direct / Intent"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Client Display Label & Branding <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. UPI (GPay, PhonePe, Paytm)"
                value={displayLabel}
                onChange={(e) => setDisplayLabel(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Min Tx Limit (₹)</label>
                <Input
                  type="number"
                  value={minLimit}
                  onChange={(e) => setMinLimit(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Max Tx Limit (₹)</label>
                <Input
                  type="number"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Global Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Payment Option
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
