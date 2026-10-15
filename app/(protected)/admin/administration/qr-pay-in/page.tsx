'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Edit3, Plus, Power, QrCode, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, ConfirmationDialog, EmptyState, Input, LoadingSkeleton, Modal, Select, StatusBadge, Table, useToast } from '@/components/ui';
import { qrPayInService, type QrPayInAccount, type QrPayInAccountInput } from '@/services/qrPayInService';
import { formatCurrency } from '@/utils/formatters';
import type { ColumnDefinition } from '@/types/common';

const blank: QrPayInAccountInput = { code: '', label: '', bankName: '', upiId: '', payeeName: 'QIN STAR PAYMENT TECHNOLOGIES', minAmount: 100, maxAmount: 100000, pricing: 'Standard UPI collection charges apply', status: 'ACTIVE', sortOrder: 0 };

export default function QrPayInAdministrationPage() {
  const { toastError, toastSuccess } = useToast();
  const [accounts, setAccounts] = useState<QrPayInAccount[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<QrPayInAccount | null>(null); const [form, setForm] = useState<QrPayInAccountInput>(blank); const [modalOpen, setModalOpen] = useState(false); const [statusTarget, setStatusTarget] = useState<QrPayInAccount | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const response = await qrPayInService.getAccounts(); setAccounts(response.data ?? []); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to load QR accounts.'); } finally { setLoading(false); } }, [toastError]);
  useEffect(() => {
    // The asynchronous loader owns this screen's initial loading lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (account: QrPayInAccount) => { setEditing(account); setForm({ code: account.code, label: account.label, bankName: account.bankName, upiId: account.upiId, payeeName: account.payeeName, minAmount: account.minAmount, maxAmount: account.maxAmount, pricing: account.pricing, status: account.status, sortOrder: account.sortOrder }); setModalOpen(true); };
  const save = async () => { if (!form.code.trim() || !form.label.trim() || !form.bankName.trim() || !form.upiId.trim() || !form.payeeName.trim() || !form.pricing.trim()) return toastError('Complete all required fields.'); if (form.minAmount <= 0 || form.maxAmount < form.minAmount) return toastError('Enter a valid minimum and maximum amount.'); setSaving(true); try { if (editing) await qrPayInService.updateAccount(editing.id, form); else await qrPayInService.createAccount(form); setModalOpen(false); await load(); toastSuccess(editing ? 'QR account updated.' : 'QR account configured.'); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to save QR account.'); } finally { setSaving(false); } };
  const changeStatus = async () => { if (!statusTarget) return; setSaving(true); try { const next = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'; await qrPayInService.updateStatus(statusTarget.id, next); setStatusTarget(null); await load(); toastSuccess(`QR account ${next === 'ACTIVE' ? 'activated' : 'deactivated'}.`); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to update status.'); } finally { setSaving(false); } };

  const columns: ColumnDefinition<QrPayInAccount>[] = [
    { key: 'bank', header: 'Bank & Route', render: (row) => <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><Building2 className="h-4 w-4" /></span><div><b>{row.bankName}</b><small className="block text-slate-500">{row.label} · {row.code}</small></div></div> },
    { key: 'upiId', header: 'UPI Collection ID', render: (row) => <div><b className="font-mono text-[#0F4C81]">{row.upiId}</b><small className="block text-slate-500">{row.payeeName}</small></div> },
    { key: 'limits', header: 'Transaction Limits', render: (row) => <span>{formatCurrency(row.minAmount)} – {formatCurrency(row.maxAmount)}</span> },
    { key: 'pricing', header: 'Pricing', render: (row) => <span className="text-slate-600">{row.pricing}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', render: (row) => <div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(row)} leftIcon={<Edit3 className="h-3.5 w-3.5" />}>Edit</Button><Button size="sm" variant={row.status === 'ACTIVE' ? 'danger' : 'outline'} onClick={() => setStatusTarget(row)} leftIcon={<Power className="h-3.5 w-3.5" />}>{row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</Button></div> },
  ];

  return <PageContainer><div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#155EEF]"><QrCode className="h-4 w-4" />Collection Configuration</div><h1 className="text-2xl font-bold text-slate-950">QR Pay-In Accounts</h1><p className="mt-1 text-sm text-slate-500">Configure the bank QR accounts available to every retailer in QR Pay-In.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void load()} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button><Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Add Bank QR</Button></div></div>
    <Card noPadding>{loading ? <div className="p-5"><LoadingSkeleton count={6} /></div> : accounts.length ? <Table columns={columns} data={accounts} keyExtractor={(row) => row.id} /> : <EmptyState className="border-0 shadow-none" title="No bank QR accounts configured" description="Add the first bank UPI collection account to make it available in retailer QR Pay-In." action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Add Bank QR</Button>} />}</Card>
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit bank QR account' : 'Configure bank QR account'} description="Active configurations appear immediately for retailers." size="xl" footer={<><Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void save()} isLoading={saving}>{editing ? 'Save Changes' : 'Configure QR'}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2"><Input label="Configuration code" required value={form.code} placeholder="AXIS_MAIN" onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} /><Input label="Display label" required value={form.label} placeholder="Qin Star Main" onChange={(e) => setForm({ ...form, label: e.target.value })} /><Input label="Bank name" required value={form.bankName} placeholder="Axis Bank" onChange={(e) => setForm({ ...form, bankName: e.target.value })} /><Input label="UPI ID" required value={form.upiId} placeholder="qinstarpay@axisbank" onChange={(e) => setForm({ ...form, upiId: e.target.value })} /><Input label="Payee name" required value={form.payeeName} onChange={(e) => setForm({ ...form, payeeName: e.target.value })} containerClassName="sm:col-span-2" /><Input label="Minimum amount" required type="number" min={1} value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} /><Input label="Maximum amount" required type="number" min={1} value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: Number(e.target.value) })} /><Input label="Pricing description" required value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })} containerClassName="sm:col-span-2" /><Select label="Initial status" required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QrPayInAccount['status'] })} options={[{ value: 'ACTIVE', label: 'Active — visible to retailers' }, { value: 'INACTIVE', label: 'Inactive — hidden from retailers' }]} /><Input label="Display order" type="number" min={0} max={999} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
    </Modal>
    <ConfirmationDialog isOpen={Boolean(statusTarget)} onCancel={() => setStatusTarget(null)} onConfirm={() => void changeStatus()} isLoading={saving} variant={statusTarget?.status === 'ACTIVE' ? 'warning' : 'info'} title={`${statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} QR account?`} message={statusTarget?.status === 'ACTIVE' ? 'Retailers will no longer see or submit payments using this bank QR.' : 'This bank QR will become available to all retailers immediately.'} confirmText={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} />
  </div></PageContainer>;
}
