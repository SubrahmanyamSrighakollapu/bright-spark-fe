'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  DollarSign,
  Tag,
  ShieldAlert,
} from 'lucide-react';

export interface ChargeConfigItem {
  id: string;
  gatewayId: string;
  gatewayName: string;
  methodId: string;
  methodName: string;
  chargeType: 'percentage' | 'flat';
  chargeValue: number;
  isTaxApplicable: boolean;
  createdAt: string;
}

const INITIAL_CHARGES: ChargeConfigItem[] = [
  {
    id: 'cc_1',
    gatewayId: 'gw_1',
    gatewayName: 'Razorpay PG',
    methodId: 'card',
    methodName: 'Credit / Debit Card',
    chargeType: 'percentage',
    chargeValue: 1.8,
    isTaxApplicable: true,
    createdAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'cc_2',
    gatewayId: 'gw_1',
    gatewayName: 'Razorpay PG',
    methodId: 'upi',
    methodName: 'UPI Direct / QR',
    chargeType: 'flat',
    chargeValue: 0.0,
    isTaxApplicable: false,
    createdAt: '2026-08-10T11:30:00Z',
  },
  {
    id: 'cc_3',
    gatewayId: 'gw_2',
    gatewayName: 'Cashfree Payments',
    methodId: 'netbanking',
    methodName: 'Net Banking / Bank Transfer',
    chargeType: 'flat',
    chargeValue: 12.0,
    isTaxApplicable: true,
    createdAt: '2026-08-15T16:00:00Z',
  },
  {
    id: 'cc_4',
    gatewayId: 'gw_3',
    gatewayName: 'PhonePe PG Direct',
    methodId: 'wallet',
    methodName: 'Digital Wallets',
    chargeType: 'percentage',
    chargeValue: 1.5,
    isTaxApplicable: true,
    createdAt: '2026-09-02T14:10:00Z',
  },
];

const GATEWAYS = [
  { id: 'gw_1', name: 'Razorpay PG' },
  { id: 'gw_2', name: 'Cashfree Payments' },
  { id: 'gw_3', name: 'PhonePe PG Direct' },
  { id: 'gw_4', name: 'Paytm Payment Gateway' },
];

const METHODS = [
  { id: 'card', name: 'Credit / Debit Card' },
  { id: 'upi', name: 'UPI Direct / QR' },
  { id: 'netbanking', name: 'Net Banking / Bank Transfer' },
  { id: 'wallet', name: 'Digital Wallets' },
];

export const AddChargeConfigurationView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [charges, setCharges] = useState<ChargeConfigItem[]>(INITIAL_CHARGES);

  // Form state
  const [gatewayId, setGatewayId] = useState('gw_1');
  const [methodId, setMethodId] = useState('card');
  const [chargeType, setChargeType] = useState<'percentage' | 'flat'>('percentage');
  const [chargeValue, setChargeValue] = useState<number>(1.8);
  const [isTaxApplicable, setIsTaxApplicable] = useState<boolean>(true);

  // Modal State for Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ChargeConfigItem | null>(null);

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const gw = GATEWAYS.find((g) => g.id === gatewayId);
    const m = METHODS.find((method) => method.id === methodId);

    const newCharge: ChargeConfigItem = {
      id: `cc_${Date.now()}`,
      gatewayId,
      gatewayName: gw?.name || 'Gateway',
      methodId,
      methodName: m?.name || 'Method',
      chargeType,
      chargeValue: Number(chargeValue),
      isTaxApplicable,
      createdAt: new Date().toISOString(),
    };

    setCharges([newCharge, ...charges]);
    toastSuccess(`Fee rule configured for ${gw?.name} - ${m?.name}!`);
  };

  const handleOpenEdit = (charge: ChargeConfigItem) => {
    setEditingCharge(charge);
    setGatewayId(charge.gatewayId);
    setMethodId(charge.methodId);
    setChargeType(charge.chargeType);
    setChargeValue(charge.chargeValue);
    setIsTaxApplicable(charge.isTaxApplicable);
    setIsModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharge) return;

    const gw = GATEWAYS.find((g) => g.id === gatewayId);
    const m = METHODS.find((method) => method.id === methodId);

    setCharges((prev) =>
      prev.map((c) =>
        c.id === editingCharge.id
          ? {
              ...c,
              gatewayId,
              gatewayName: gw?.name || c.gatewayName,
              methodId,
              methodName: m?.name || c.methodName,
              chargeType,
              chargeValue: Number(chargeValue),
              isTaxApplicable,
            }
          : c
      )
    );

    toastSuccess('Charge configuration updated!');
    setIsModalOpen(false);
    setEditingCharge(null);
  };

  const handleDelete = (id: string, name: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
    toastInfo(`Removed charge rule for ${name}.`);
  };

  const columns: ColumnDefinition<ChargeConfigItem>[] = [
    {
      key: 'gatewayName',
      header: 'Gateway',
      render: (row) => <span className="font-semibold text-[#0F172A]">{row.gatewayName}</span>,
    },
    {
      key: 'methodName',
      header: 'Method',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
          {row.methodName}
        </span>
      ),
    },
    {
      key: 'chargeType',
      header: 'Charge Type',
      render: (row) => (
        <span className="capitalize text-xs font-medium text-[#475569]">
          {row.chargeType === 'percentage' ? 'Percentage (%)' : 'Flat Fee (₹)'}
        </span>
      ),
    },
    {
      key: 'chargeValue',
      header: 'Fee Rate',
      render: (row) => (
        <span className="font-bold text-[#155EEF] text-sm">
          {row.chargeType === 'percentage' ? `${row.chargeValue}%` : `₹${row.chargeValue.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'isTaxApplicable',
      header: 'GST Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
            row.isTaxApplicable
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          {row.isTaxApplicable ? '+18% GST Applicable' : 'No GST Tax'}
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
            onClick={() => handleDelete(row.id, `${row.gatewayName} (${row.methodName})`)}
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
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#155EEF]" />
            Gateway Charge & Processing Fee Configuration
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Define percentage or flat fee rates levied on external payment gateway transactions.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl">
        <form onSubmit={handleAddCharge} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Select Gateway</label>
              <select
                value={gatewayId}
                onChange={(e) => setGatewayId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              >
                {GATEWAYS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Payment Method</label>
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              >
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Charge Type</label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Fee (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Rate / Value {chargeType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder={chargeType === 'percentage' ? '1.8' : '10.00'}
                value={chargeValue}
                onChange={(e) => setChargeValue(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">GST Applicable</label>
              <button
                type="button"
                onClick={() => setIsTaxApplicable(!isTaxApplicable)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isTaxApplicable
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isTaxApplicable ? 'text-blue-600' : 'text-slate-400'}`} />
                {isTaxApplicable ? '18% GST Enabled' : 'No GST'}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="bg-[#155EEF] hover:bg-[#124BCC]">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Rule
            </Button>
          </div>
        </form>
      </Card>

      {/* Data Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">Charge Rules Ledger ({charges.length})</h2>
        </div>
        <Table columns={columns} data={charges} keyExtractor={(row) => row.id} />
      </Card>

      {/* Edit Modal */}
      {isModalOpen && editingCharge && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Fee Rule Configuration"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Gateway</label>
              <select
                value={gatewayId}
                onChange={(e) => setGatewayId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
              >
                {GATEWAYS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Payment Method</label>
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
              >
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Charge Type</label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Fee (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Charge Rate / Value</label>
              <Input
                type="number"
                step="0.01"
                value={chargeValue}
                onChange={(e) => setChargeValue(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="modalGst"
                checked={isTaxApplicable}
                onChange={(e) => setIsTaxApplicable(e.target.checked)}
                className="w-4 h-4 text-[#155EEF] rounded"
              />
              <label htmlFor="modalGst" className="text-xs font-medium text-[#0F172A]">
                Add 18% GST tax to fee calculation
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-[#155EEF]">
                Update Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
