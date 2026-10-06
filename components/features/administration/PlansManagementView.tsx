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
import { Layers, Plus, Edit, Trash2, CheckCircle2, Clock, Zap } from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  planName: string;
  planType: 'Monthly' | 'Annual' | 'Lifetime';
  price: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'plan_1', planName: 'Gold Distributor Plan', planType: 'Annual', price: 9999, status: 'Active', createdAt: '2026-08-01T10:00:00Z' },
  { id: 'plan_2', planName: 'Starter Retailer Plan', planType: 'Monthly', price: 499, status: 'Active', createdAt: '2026-08-10T11:00:00Z' },
  { id: 'plan_3', planName: 'Master Enterprise Tier', planType: 'Lifetime', price: 24999, status: 'Active', createdAt: '2026-08-15T14:30:00Z' },
  { id: 'plan_4', planName: 'Basic Trial Tier', planType: 'Monthly', price: 0, status: 'Inactive', createdAt: '2026-09-01T09:00:00Z' },
];

export const PlansManagementView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState<'Monthly' | 'Annual' | 'Lifetime'>('Monthly');
  const [price, setPrice] = useState<number>(499);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanType('Monthly');
    setPrice(499);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.planName);
    setPlanType(plan.planType);
    setPrice(plan.price);
    setStatus(plan.status);
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, planName, planType, price: Number(price), status } : p))
      );
      toastSuccess(`Plan "${planName}" updated!`);
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        planName,
        planType,
        price: Number(price),
        status,
        createdAt: new Date().toISOString(),
      };
      setPlans([...plans, newPlan]);
      toastSuccess(`Subscription plan "${planName}" created!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toastInfo(`Plan "${name}" removed.`);
  };

  const columns: ColumnDefinition<SubscriptionPlan>[] = [
    {
      key: 'planName',
      header: 'Plan Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#155EEF]" />
          <span className="font-semibold text-[#0F172A]">{row.planName}</span>
        </div>
      ),
    },
    {
      key: 'planType',
      header: 'Plan Validity / Type',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
          <Clock className="w-3 h-3 text-[#64748B]" />
          {row.planType}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Activation Price',
      render: (row) => <span className="font-bold text-[#155EEF]">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {row.status}
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
            onClick={() => handleDelete(row.id, row.planName)}
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
            <Layers className="w-6 h-6 text-[#155EEF]" />
            Plans & Subscription Tier Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Configure subscription tiers for Super Distributors, Master Distributors, Distributors, and Retailers.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <Table columns={columns} data={plans} keyExtractor={(p) => p.id} />
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlan ? `Edit Plan: ${editingPlan.planName}` : 'Create Subscription Plan'}
        >
          <form onSubmit={handleSavePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Plan Name (planName) <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Gold Distributor Plan"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Plan Type (planType)</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
                <option value="Lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Pricing Amount (₹)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
