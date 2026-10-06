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
  Plug,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Power,
} from 'lucide-react';

export interface PaymentGatewayItem {
  id: string;
  gatewayName: string;
  isActive: boolean;
  createdAt: string;
}

const INITIAL_GATEWAYS: PaymentGatewayItem[] = [
  { id: 'gw_1', gatewayName: 'Razorpay PG', isActive: true, createdAt: '2026-08-10T10:00:00Z' },
  { id: 'gw_2', gatewayName: 'Cashfree Payments', isActive: true, createdAt: '2026-08-15T14:30:00Z' },
  { id: 'gw_3', gatewayName: 'PhonePe PG Direct', isActive: true, createdAt: '2026-09-01T09:15:00Z' },
  { id: 'gw_4', gatewayName: 'Paytm Payment Gateway', isActive: false, createdAt: '2026-09-05T16:00:00Z' },
  { id: 'gw_5', gatewayName: 'Stripe India', isActive: false, createdAt: '2026-09-12T11:45:00Z' },
];

export const AddPaymentGatewayView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [gateways, setGateways] = useState<PaymentGatewayItem[]>(INITIAL_GATEWAYS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayItem | null>(null);
  const [gatewayNameInput, setGatewayNameInput] = useState('');
  const [isActiveInput, setIsActiveInput] = useState(true);

  const totalGateways = gateways.length;
  const activeGateways = gateways.filter((g) => g.isActive).length;
  const inactiveGateways = totalGateways - activeGateways;

  const handleOpenAdd = () => {
    setEditingGateway(null);
    setGatewayNameInput('');
    setIsActiveInput(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gw: PaymentGatewayItem) => {
    setEditingGateway(gw);
    setGatewayNameInput(gw.gatewayName);
    setIsActiveInput(gw.isActive);
    setIsModalOpen(true);
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayNameInput.trim()) return;

    if (editingGateway) {
      setGateways((prev) =>
        prev.map((g) => (g.id === editingGateway.id ? { ...g, gatewayName: gatewayNameInput, isActive: isActiveInput } : g))
      );
      toastSuccess(`Gateway "${gatewayNameInput}" updated successfully!`);
    } else {
      const newGw: PaymentGatewayItem = {
        id: `gw_${Date.now()}`,
        gatewayName: gatewayNameInput,
        isActive: isActiveInput,
        createdAt: new Date().toISOString(),
      };
      setGateways([newGw, ...gateways]);
      toastSuccess(`Payment Gateway "${gatewayNameInput}" registered successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, name: string) => {
    setGateways((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const next = !g.isActive;
          toastInfo(`Gateway "${name}" is now ${next ? 'Active' : 'Inactive'}.`);
          return { ...g, isActive: next };
        }
        return g;
      })
    );
  };

  const handleDelete = (id: string, name: string) => {
    setGateways((prev) => prev.filter((g) => g.id !== id));
    toastInfo(`Gateway "${name}" has been deleted.`);
  };

  const columns: ColumnDefinition<PaymentGatewayItem>[] = [
    {
      key: 'gatewayName',
      header: 'Gateway Name',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#155EEF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
            <Plug className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-[#0F172A]">{r.gatewayName}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Global Status',
      align: 'center',
      render: (r) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
            r.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (r) => <span className="font-mono text-xs text-[#64748B]">{formatDateTime(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Plug className="w-5 h-5 text-[#155EEF]" />
            Add Payment Gateway (AddPaymentGateway)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Register and manage external payment processing gateway providers across your platform switch.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          + Register New Gateway
        </Button>
      </div>

      {/* Summary Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-[#64748B]">Total Gateways</span>
            <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1">{totalGateways}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-700">Active Gateways</span>
            <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1">{activeGateways}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E5EAF1] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500">Inactive Gateways</span>
            <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1">{inactiveGateways}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Registered Gateways Directory Table */}
      <Card title="Registered Payment Gateway Master" subtitle="Global gateway status and configuration status" noPadding>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={gateways}
            keyExtractor={(r) => r.id}
            renderActions={(row) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(row)}
                  className="p-1.5 text-slate-600 hover:text-[#155EEF] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Edit Gateway Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(row.id, row.gatewayName)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    row.isActive ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={row.isActive ? 'Disable Gateway Globally' : 'Enable Gateway Globally'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(row.id, row.gatewayName)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete Gateway"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          />
        </div>
      </Card>

      {/* Register / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGateway ? `Edit Gateway: ${editingGateway.gatewayName}` : 'Register New Payment Gateway'}
        size="sm"
      >
        <form onSubmit={handleSaveGateway} className="space-y-4 text-xs pt-2">
          <Input
            label="Gateway Name (gatewayName)"
            placeholder="e.g. Razorpay PG, Cashfree, PhonePe Direct"
            value={gatewayNameInput}
            onChange={(e) => setGatewayNameInput(e.target.value)}
            required
          />

          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Enable Globally (isActive)</span>
              <span className="text-[11px] text-[#64748B]">Activate gateway for live transaction routing.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsActiveInput(!isActiveInput)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isActiveInput ? 'bg-[#155EEF]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActiveInput ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGateway ? 'Save Gateway Changes' : 'Register Gateway'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
