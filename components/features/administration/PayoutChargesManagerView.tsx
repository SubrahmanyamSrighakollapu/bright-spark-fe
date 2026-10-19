'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Edit, Plus, Trash2, Zap } from 'lucide-react';
import { Button, Card, Input, Modal, Select, Table, useToast } from '@/components/ui';
import type { ColumnDefinition } from '@/types/common';
import { formatCurrency } from '@/utils/formatters';
import { payoutChargeService, type PayoutChargeRule, type PayoutMode } from '@/services/payoutChargeService';
import { useConfirmation } from '@/context/ConfirmationContext';

export const PayoutChargesManagerView: React.FC = () => {
  const { toastSuccess, toastInfo, toastError } = useToast();
  const confirmAction = useConfirmation();
  const [charges, setCharges] = useState<PayoutChargeRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PayoutChargeRule | null>(null);
  const [payoutMode, setPayoutMode] = useState<PayoutMode | ''>('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [flatCharge, setFlatCharge] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    payoutChargeService.getRules()
      .then((response) => { if (active) setCharges(response.data ?? []); })
      .catch((error: unknown) => { if (active) toastError(error instanceof Error ? error.message : 'Unable to load payout charge rules.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [toastError]);

  const openAdd = () => {
    setEditingRule(null); setPayoutMode(''); setMinAmount(''); setMaxAmount(''); setFlatCharge(''); setIsModalOpen(true);
  };
  const openEdit = (rule: PayoutChargeRule) => {
    setEditingRule(rule); setPayoutMode(rule.payoutMode); setMinAmount(String(rule.minAmount)); setMaxAmount(String(rule.maxAmount)); setFlatCharge(String(rule.flatCharge)); setIsModalOpen(true);
  };
  const saveRule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    if (!payoutMode || minAmount === '' || maxAmount === '' || flatCharge === '') { toastError('Complete all payout charge fields.'); return; }
    const input = { payoutMode, minAmount: Number(minAmount), maxAmount: Number(maxAmount), flatCharge: Number(flatCharge) };
    if (!Number.isFinite(input.minAmount) || !Number.isFinite(input.maxAmount) || !Number.isFinite(input.flatCharge) || input.minAmount < 0 || input.maxAmount <= input.minAmount || input.flatCharge < 0) { toastError('Enter a valid amount range and a non-negative flat charge.'); return; }
    setIsSaving(true);
    try {
      const response = editingRule
        ? await payoutChargeService.updateRule(editingRule.id, { ...input, version: editingRule.version })
        : await payoutChargeService.createRule(input);
      if (!response.data) throw new Error('The payout charge API returned no rule.');
      const savedRule = response.data;
      setCharges((current) => (editingRule
        ? current.map((rule) => rule.id === savedRule.id ? savedRule : rule)
        : [...current, savedRule]).sort((a, b) => a.payoutMode.localeCompare(b.payoutMode) || a.minAmount - b.minAmount));
      toastSuccess(`${payoutMode} flat-charge rule ${editingRule ? 'updated' : 'created'} successfully.`);
      setIsModalOpen(false);
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Unable to save the payout charge rule.');
    } finally {
      setIsSaving(false);
    }
  };
  const removeRule = async (rule: PayoutChargeRule) => {
    const confirmed = await confirmAction({
      title: 'Delete payout charge range?',
      message: `Delete the ${rule.payoutMode} charge range from ${formatCurrency(rule.minAmount)} to ${formatCurrency(rule.maxAmount)} with a flat charge of ${formatCurrency(rule.flatCharge)}? New settlements will no longer use this range.`,
      confirmText: 'Yes, delete range',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await payoutChargeService.deleteRule(rule.id);
      setCharges((current) => current.filter((item) => item.id !== rule.id));
      toastInfo(`${rule.payoutMode} payout charge range removed.`);
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Unable to delete the payout charge rule.');
    }
  };

  const columns: ColumnDefinition<PayoutChargeRule>[] = [
    { key: 'payoutMode', header: 'Payout Mode', render: (row) => <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#2F6F5E]"><Zap className="h-3 w-3" />{row.payoutMode}</span> },
    { key: 'minAmount', header: 'Minimum Amount', render: (row) => <span className="font-semibold text-slate-800">{formatCurrency(row.minAmount)}</span> },
    { key: 'maxAmount', header: 'Maximum Amount', render: (row) => <span className="font-semibold text-slate-800">{formatCurrency(row.maxAmount)}</span> },
    { key: 'flatCharge', header: 'Flat Charge', render: (row) => <span className="font-extrabold text-[#2F6F5E]">{formatCurrency(row.flatCharge)}</span> },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex items-center gap-1"><Button variant="ghost" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />} onClick={() => openEdit(row)}>Edit</Button><Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} className="text-rose-600 hover:bg-rose-50" onClick={() => removeRule(row)}>Delete</Button></div> },
  ];

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-950"><ArrowUpRight className="h-6 w-6 text-[#2F6F5E]" />Payout Charges Manager</h1><p className="mt-1 text-sm text-slate-500">Configure flat settlement charges by payout mode and non-overlapping amount range.</p></div><Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add charge range</Button></div>
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-slate-900">Configured charge ranges</h2><p className="mt-1 text-xs text-slate-500">The retailer settlement summary automatically uses the matching active range.</p></div>{isLoading ? <div className="px-6 py-12 text-center text-sm text-slate-500">Loading payout charge ranges...</div> : <Table columns={columns} data={charges} keyExtractor={(rule) => rule.id} />}</Card>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRule ? 'Edit payout charge range' : 'Add payout charge range'} description="Ranges are inclusive and cannot overlap for the same payout mode."><form onSubmit={saveRule} className="space-y-5"><Select label="Payout mode" required value={payoutMode} onChange={(e) => setPayoutMode(e.target.value as PayoutMode)} options={['IMPS', 'NEFT', 'RTGS', 'UPI'].map((value) => ({ label: value, value }))} placeholder="Select payout mode" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Minimum amount" required type="number" min="0" step="0.01" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="Enter minimum amount" /><Input label="Maximum amount" required type="number" min="0" step="0.01" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Enter maximum amount" /></div><Input label="Flat charge" required type="number" min="0" step="0.01" value={flatCharge} onChange={(e) => setFlatCharge(e.target.value)} placeholder="Enter flat charge" helperText="This exact amount will appear as the bank fee in the retailer settlement summary." /><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={isSaving}>Save charge range</Button></div></form></Modal>
  </div>;
};
