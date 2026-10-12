'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Modal, Table, useToast } from '@/components/ui';
import { useConfirmation } from '@/context/ConfirmationContext';
import type { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import { configurationService } from '@/services/configurationService';

export interface PaymentGatewayItem { id: string; gatewayName: string; isActive: boolean; createdAt: string; }
export const AddPaymentGatewayView: React.FC = () => {
  const { toastSuccess, toastError } = useToast();
  const confirm = useConfirmation();
  const [gateways, setGateways] = useState<PaymentGatewayItem[]>([]);
  const [editing, setEditing] = useState<PaymentGatewayItem | null>(null);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => { configurationService.list<PaymentGatewayItem>('gateways').then((response) => setGateways(response.data ?? [])).catch((error: unknown) => toastError(error instanceof Error ? error.message : 'Unable to load gateways.')); }, [toastError]);

  const showAdd = () => { setEditing(null); setName(''); setOpen(true); };
  const showEdit = (gateway: PaymentGatewayItem) => { setEditing(gateway); setName(gateway.gatewayName); setOpen(true); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const gatewayName = name.trim();
    if (gatewayName.length < 2) { toastError('Enter a valid gateway name.'); return; }
    try {
      const response = editing ? await configurationService.update<PaymentGatewayItem>('gateways', editing.id, { gatewayName, isActive: editing.isActive }) : await configurationService.create<PaymentGatewayItem>('gateways', { gatewayName, isActive: true });
      if (!response.data) throw new Error('Gateway API returned no record.');
      setGateways((items) => editing ? items.map((item) => item.id === editing.id ? response.data! : item) : [response.data!, ...items]);
    } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to save gateway.'); return; }
    toastSuccess(editing ? 'Gateway updated successfully.' : 'Gateway added successfully.');
    setOpen(false);
  };
  const remove = async (gateway: PaymentGatewayItem) => {
    if (!(await confirm({ title: 'Delete gateway?', message: `Delete “${gateway.gatewayName}”? This action cannot be undone.`, confirmText: 'Yes, delete gateway', variant: 'danger' }))) return;
    try { await configurationService.remove('gateways', gateway.id); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to delete gateway.'); return; }
    setGateways((items) => items.filter((item) => item.id !== gateway.id));
    toastSuccess('Gateway deleted successfully.');
  };
  const columns: ColumnDefinition<PaymentGatewayItem>[] = [
    { key: 'name', header: 'Gateway Name', render: (row) => <span className="flex items-center gap-2 font-bold text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#155EEF]"><CreditCard className="h-4 w-4" /></span>{row.gatewayName}</span> },
    { key: 'status', header: 'Status', render: (row) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'created', header: 'Created At', render: (row) => <span className="text-sm text-slate-500">{formatDateTime(row.createdAt)}</span> },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-1"><Button variant="ghost" size="sm" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => showEdit(row)}>Edit</Button><Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => remove(row)}>Delete</Button></div> },
  ];
  const active = gateways.filter((item) => item.isActive).length;

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-extrabold text-slate-950">Payment Gateways</h1><p className="mt-1 text-sm text-slate-500">Configure and manage payment gateways.</p></div><Button leftIcon={<Plus className="h-4 w-4" />} onClick={showAdd}>Add Gateway</Button></div>
    <div className="grid gap-4 sm:grid-cols-3">{[['Total Gateways', gateways.length, 'text-blue-600'], ['Active', active, 'text-emerald-600'], ['Inactive', gateways.length - active, 'text-amber-600']].map(([label, value, color]) => <Card key={String(label)} className="flex items-center justify-between rounded-2xl border-slate-200 p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p></div><Layers className={`h-6 w-6 ${color}`} /></Card>)}</div>
    <Card className="overflow-hidden rounded-2xl border-slate-200 p-0"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-slate-900">Registered Payment Gateways</h2></div><Table columns={columns} data={gateways} keyExtractor={(row) => row.id} /></Card>
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Payment Gateway' : 'Add Payment Gateway'}><form className="space-y-5" onSubmit={save}><Input label="Gateway Name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Razorpay, PayU, Stripe" /><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Add Gateway'}</Button></div></form></Modal>
  </div>;
};
