'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Edit2, Info, Save, Trash2, X } from 'lucide-react';
import { Button, Card, Modal, SearchInput, Select, Table, useToast } from '@/components/ui';
import { useConfirmation } from '@/context/ConfirmationContext';
import { configurationService } from '@/services/configurationService';
import { roleService } from '@/services/roleService';
import type { ColumnDefinition } from '@/types/common';
import { usePathname } from 'next/navigation';

type Named = { id: string; name: string };
type Configuration = { id: string; planId: string; gatewayId: string; roleId: string; isActive: boolean };
type Commission = { id: string; planConfigId: string; methodId: string; methodOptionId: string | null; commissionRate: number; isActive: boolean };
type ApiPlan = { id: string; planName: string; isActive: boolean };
type ApiGateway = { id: string; gatewayName: string; isActive: boolean };
type ApiMethod = { id: string; methodName: string; isActive: boolean };
type ApiOption = { id: string; methodId: string; optionName: string; isActive: boolean };
const blankConfig = { planId: '', gatewayId: '', roleId: '' };
const nameOf = (items: Named[], id: string) => items.find((item) => item.id === id)?.name ?? 'N/A';

const CommissionRateField = ({ initialValue, disabled, onValueChange }: { initialValue: string; disabled: boolean; onValueChange: (value: string) => void }) => {
  const [value, setValue] = useState(initialValue);
  return <input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" disabled={disabled} value={value} onChange={(event) => { const nextValue = event.target.value; setValue(nextValue); onValueChange(nextValue); }} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} className="h-10 w-32 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#155EEF] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500" />;
};

export const PlanCommissionView: React.FC = () => {
  const pathname = usePathname();
  const isCommissionPage = pathname.includes('/commissions');
  const { toastSuccess, toastError } = useToast();
  const confirm = useConfirmation();
  const [plans, setPlans] = useState<Named[]>([]); const [gateways, setGateways] = useState<Named[]>([]); const [roles, setRoles] = useState<Named[]>([]); const [methods, setMethods] = useState<Named[]>([]); const [options, setOptions] = useState<Array<Named & { methodId: string }>>([]);
  const [configs, setConfigs] = useState<Configuration[]>([]); const [commissions, setCommissions] = useState<Commission[]>([]);
  const [configForm, setConfigForm] = useState(blankConfig); const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [search, setSearch] = useState(''); const [filters, setFilters] = useState(blankConfig);
  const [selection, setSelection] = useState(blankConfig); const [loadedConfigId, setLoadedConfigId] = useState(''); const [editingCommission, setEditingCommission] = useState(''); const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({}); const [savingCommissions, setSavingCommissions] = useState(false);
  const rateDraftsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    Promise.all([configurationService.list<ApiPlan>('plans'), configurationService.list<ApiGateway>('gateways'), roleService.getRoles(), configurationService.list<ApiMethod>('methods'), configurationService.list<ApiOption>('options'), configurationService.list<Configuration>('plan-configurations'), configurationService.list<Commission>('commissions')])
      .then(([planData, gatewayData, roleData, methodData, optionData, configData, commissionData]) => {
        setPlans(planData.data.filter((item) => item.isActive).map((item) => ({ id: item.id, name: item.planName })));
        setGateways(gatewayData.data.filter((item) => item.isActive).map((item) => ({ id: item.id, name: item.gatewayName })));
        setRoles((roleData.data ?? []).filter((item) => item.isActive && (item.category === 'SYSTEM' || item.category === 'NETWORK')).map((item) => ({ id: String(item.id), name: item.name })));
        setMethods(methodData.data.filter((item) => item.isActive).map((item) => ({ id: item.id, name: item.methodName })));
        setOptions(optionData.data.filter((item) => item.isActive).map((item) => ({ id: item.id, methodId: item.methodId, name: item.optionName })));
        setConfigs(configData.data.map((item) => ({ ...item, roleId: String(item.roleId) })));
        setCommissions(commissionData.data.map((item) => ({ ...item, commissionRate: Number(item.commissionRate) })));
      }).catch((error) => toastError(error instanceof Error ? error.message : 'Unable to load configuration data.'));
  }, [toastError]);

  const filtered = useMemo(() => configs.filter((row) => { const text = `${nameOf(plans, row.planId)} ${nameOf(gateways, row.gatewayId)} ${nameOf(roles, row.roleId)}`.toLowerCase(); return (!search || text.includes(search.toLowerCase())) && (!filters.planId || row.planId === filters.planId) && (!filters.gatewayId || row.gatewayId === filters.gatewayId) && (!filters.roleId || row.roleId === filters.roleId); }), [configs, filters, gateways, plans, roles, search]);
  const saveConfig = async () => { if (!configForm.planId || !configForm.gatewayId || !configForm.roleId) return toastError('Select plan, gateway, and role.'); if (configs.some((row) => row.id !== editingConfig?.id && row.planId === configForm.planId && row.gatewayId === configForm.gatewayId && row.roleId === configForm.roleId)) return toastError('This plan, gateway, and role configuration already exists.'); try { const payload = { ...configForm, roleId: Number(configForm.roleId), isActive: true }; const response = editingConfig ? await configurationService.update<Configuration>('plan-configurations', editingConfig.id, payload) : await configurationService.create<Configuration>('plan-configurations', payload); const saved = { ...response.data, roleId: String(response.data.roleId) }; setConfigs((items) => editingConfig ? items.map((item) => item.id === editingConfig.id ? saved : item) : [saved, ...items]); setConfigForm(blankConfig); setEditingConfig(null); toastSuccess('Plan configuration saved.'); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to save configuration.'); } };
  const removeConfig = async (row: Configuration) => { if (!(await confirm({ title: 'Delete configuration?', message: `Delete the ${nameOf(plans, row.planId)} / ${nameOf(gateways, row.gatewayId)} / ${nameOf(roles, row.roleId)} configuration?`, confirmText: 'Yes, delete configuration', variant: 'danger' }))) return; try { await configurationService.remove('plan-configurations', row.id); setConfigs((items) => items.filter((item) => item.id !== row.id)); setCommissions((items) => items.filter((item) => item.planConfigId !== row.id)); toastSuccess('Configuration deleted.'); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to delete configuration.'); } };
  const load = () => { const match = configs.find((row) => row.planId === selection.planId && row.gatewayId === selection.gatewayId && row.roleId === selection.roleId); if (!match) { setLoadedConfigId(''); return toastError('Create this plan configuration before setting commissions.'); } rateDraftsRef.current = {}; setLoadedConfigId(match.id); setEditingCommission(''); setRateDrafts({}); };
  const displayedCommissions = useMemo(() => { if (!loadedConfigId) return []; const stored = commissions.filter((row) => row.planConfigId === loadedConfigId); return methods.flatMap((method) => { const methodOptions = options.filter((option) => option.methodId === method.id); const choices = methodOptions.length ? methodOptions : [{ id: '', methodId: method.id, name: 'N/A' }]; return choices.map((option) => stored.find((row) => row.methodId === method.id && (row.methodOptionId ?? '') === option.id) ?? { id: `new:${method.id}:${option.id}`, planConfigId: loadedConfigId, methodId: method.id, methodOptionId: option.id || null, commissionRate: 0, isActive: true }); }); }, [commissions, loadedConfigId, methods, options]);
  const saveRate = async (row: Commission) => { const rate = Number(rateDraftsRef.current[row.id]); if (!Number.isFinite(rate) || rate <= 0) return toastError('Enter a valid commission rate.'); try { const response = await configurationService.update<Commission>('commissions', row.id, { planConfigId: row.planConfigId, methodId: row.methodId, methodOptionId: row.methodOptionId, commissionRate: rate, isActive: true }); const saved = { ...response.data, commissionRate: Number(response.data.commissionRate) }; setCommissions((items) => items.map((item) => item.id === row.id ? saved : item)); setEditingCommission(''); delete rateDraftsRef.current[row.id]; setRateDrafts((drafts) => { const next = { ...drafts }; delete next[row.id]; return next; }); toastSuccess('Commission updated.'); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to update commission.'); } };
  const saveNewRates = async () => { const newRows = displayedCommissions.filter((row) => row.id.startsWith('new:')); if (!newRows.length) return; if (newRows.some((row) => { const rate = Number(rateDraftsRef.current[row.id]); return !Number.isFinite(rate) || rate <= 0; })) return toastError('Enter a valid commission rate for every new record.'); setSavingCommissions(true); try { for (const row of newRows) { const response = await configurationService.create<Commission>('commissions', { planConfigId: row.planConfigId, methodId: row.methodId, methodOptionId: row.methodOptionId, commissionRate: Number(rateDraftsRef.current[row.id]), isActive: true }); const saved = { ...response.data, commissionRate: Number(response.data.commissionRate) }; setCommissions((items) => [saved, ...items]); } rateDraftsRef.current = {}; setRateDrafts({}); toastSuccess('New commissions saved.'); } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to save new commissions. Any completed rows remain safely saved.'); } finally { setSavingCommissions(false); } };
  const updateRateDraft = (id: string, value: string) => { rateDraftsRef.current[id] = value; setRateDrafts((drafts) => ({ ...drafts, [id]: value })); };
  const beginCommissionEdit = (row: Commission) => { const value = String(row.commissionRate); rateDraftsRef.current[row.id] = value; setRateDrafts((drafts) => ({ ...drafts, [row.id]: value })); setEditingCommission(row.id); };
  const cancelCommissionEdit = (id: string) => { delete rateDraftsRef.current[id]; setEditingCommission(''); setRateDrafts((drafts) => { const next = { ...drafts }; delete next[id]; return next; }); };

  const configColumns: ColumnDefinition<Configuration>[] = [{ key: 'plan', header: 'Plan Name', render: (row) => <span className="font-bold text-slate-900">{nameOf(plans, row.planId)}</span> }, { key: 'role', header: 'Role Name', render: (row) => nameOf(roles, row.roleId) }, { key: 'gateway', header: 'Gateway Name', render: (row) => nameOf(gateways, row.gatewayId) }, { key: 'status', header: 'Status', render: () => <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span> }, { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-1"><Button size="sm" variant="ghost" leftIcon={<Edit2 className="h-4 w-4" />} onClick={() => { setEditingConfig(row); setConfigForm({ planId: row.planId, gatewayId: row.gatewayId, roleId: row.roleId }); }}>Edit</Button><Button size="sm" variant="ghost" className="text-rose-600" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => removeConfig(row)}>Delete</Button></div> }];
  const commissionColumns: ColumnDefinition<Commission>[] = [{ key: 'plan', header: 'Plan', render: () => nameOf(plans, selection.planId) }, { key: 'role', header: 'Role', render: () => nameOf(roles, selection.roleId) }, { key: 'gateway', header: 'Gateway', render: () => nameOf(gateways, selection.gatewayId) }, { key: 'method', header: 'Method', render: (row) => nameOf(methods, row.methodId) }, { key: 'option', header: 'Option', render: (row) => row.methodOptionId ? nameOf(options, row.methodOptionId) : 'N/A' }, { key: 'rate', header: 'Commission Rate (%)', render: (row) => { const isNew = row.id.startsWith('new:'); const editable = isNew || editingCommission === row.id; return <CommissionRateField key={`${row.id}:${editable}`} initialValue={rateDrafts[row.id] ?? (isNew ? '' : String(row.commissionRate))} disabled={!editable || savingCommissions} onValueChange={(value) => updateRateDraft(row.id, value)} />; } }, { key: 'action', header: 'Action', render: (row) => { if (row.id.startsWith('new:')) return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">New</span>; if (editingCommission === row.id) return <div className="flex gap-1"><Button size="sm" variant="ghost" aria-label="Save commission" disabled={savingCommissions || !(Number(rateDrafts[row.id]) > 0)} onClick={() => saveRate(row)}><Save className="h-4 w-4" /></Button><Button size="sm" variant="ghost" aria-label="Cancel editing" disabled={savingCommissions} onClick={() => cancelCommissionEdit(row.id)}><X className="h-4 w-4" /></Button></div>; return <Button size="sm" variant="ghost" aria-label="Edit commission" disabled={savingCommissions} onClick={() => beginCommissionEdit(row)}><Edit2 className="h-4 w-4" /></Button>; } }];
  const hasNewCommissions = displayedCommissions.some((row) => row.id.startsWith('new:'));
  const newCommissionRows = displayedCommissions.filter((row) => row.id.startsWith('new:'));
  const allNewRatesValid = newCommissionRows.length > 0 && newCommissionRows.every((row) => Number(rateDrafts[row.id]) > 0);
  const selectionComplete = Boolean(selection.planId && selection.gatewayId && selection.roleId);
  const changeSelection: React.Dispatch<React.SetStateAction<typeof blankConfig>> = (next) => { setSelection(next); setLoadedConfigId(''); setEditingCommission(''); setRateDrafts({}); };
  const selectFields = (value: typeof blankConfig, setter: React.Dispatch<React.SetStateAction<typeof blankConfig>>) => <div className="grid gap-4 md:grid-cols-3"><Select label="Select Plan" required value={value.planId} onChange={(e) => setter((v) => ({ ...v, planId: e.target.value }))} placeholder="Choose Plan" options={plans.map((item) => ({ value: item.id, label: item.name }))} /><Select label="Select Gateway" required value={value.gatewayId} onChange={(e) => setter((v) => ({ ...v, gatewayId: e.target.value }))} placeholder="Choose Gateway" options={gateways.map((item) => ({ value: item.id, label: item.name }))} /><Select label="Select Role" required value={value.roleId} onChange={(e) => setter((v) => ({ ...v, roleId: e.target.value }))} placeholder="Choose system or network role" options={roles.map((item) => ({ value: item.id, label: item.name }))} /></div>;

  const title = isCommissionPage ? 'Commission Configuration' : 'Plan Configuration';
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{isCommissionPage ? 'Configure payment-method commission rates for an existing plan mapping.' : 'Map plans to gateways and eligible system or network roles.'}</p>
      </div>
      {!isCommissionPage ? <>
        <Card className="rounded-2xl border-slate-200 p-6">
          <h2 className="mb-5 font-bold text-slate-900">Select Plan, Gateway &amp; Role</h2>
          {selectFields(configForm, setConfigForm)}
          <div className="mt-5 flex justify-end"><Button onClick={saveConfig}>Save Config</Button></div>
          <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Info className="h-5 w-5 shrink-0" /><p>Only active system and network roles are available. Employee roles are excluded.</p></div>
        </Card>
        <Card className="overflow-hidden rounded-2xl border-slate-200 p-0">
          <div className="grid gap-3 border-b border-slate-100 p-5 lg:grid-cols-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search plan, role, gateway" />
            <Select value={filters.planId} onChange={(e) => setFilters((v) => ({ ...v, planId: e.target.value }))} placeholder="All Plans" options={plans.map((item) => ({ value: item.id, label: item.name }))} />
            <Select value={filters.roleId} onChange={(e) => setFilters((v) => ({ ...v, roleId: e.target.value }))} placeholder="All Roles" options={roles.map((item) => ({ value: item.id, label: item.name }))} />
            <Select value={filters.gatewayId} onChange={(e) => setFilters((v) => ({ ...v, gatewayId: e.target.value }))} placeholder="All Gateways" options={gateways.map((item) => ({ value: item.id, label: item.name }))} />
          </div>
          <Table columns={configColumns} data={filtered} keyExtractor={(row) => row.id} />
        </Card>
      </> : <>
        <Card className="rounded-2xl border-slate-200 p-6">
          <h2 className="mb-5 font-bold text-slate-900">Select Existing Configuration</h2>
          {selectFields(selection, changeSelection)}
          <div className="mt-5 flex justify-end"><Button onClick={load} disabled={!selectionComplete || savingCommissions}>Load Data</Button></div>
        </Card>
        {loadedConfigId && <Card className="overflow-hidden rounded-2xl border-slate-200 p-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div><h2 className="font-bold">Commission Rates</h2><p className="mt-1 text-xs text-slate-500">Enter rates for every New row, then save them together.</p></div>
            {hasNewCommissions && <Button onClick={saveNewRates} disabled={!allNewRatesValid || savingCommissions}>{savingCommissions ? 'Saving...' : 'Save New Commissions'}</Button>}
          </div>
          <Table key={`${loadedConfigId}:${editingCommission}:${savingCommissions}`} columns={commissionColumns} data={displayedCommissions} keyExtractor={(row) => row.id} />
        </Card>}
      </>}
      <Modal isOpen={Boolean(editingConfig)} onClose={() => setEditingConfig(null)} title="Edit Configuration">
        <div className="space-y-5">{selectFields(configForm, setConfigForm)}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><Button variant="outline" onClick={() => setEditingConfig(null)}>Cancel</Button><Button onClick={saveConfig}>Update</Button></div></div>
      </Modal>
    </div>
  );
};
