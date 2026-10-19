'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Building2, CheckCircle2, Info, Mail, Phone, Search, UserRound } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useConfirmation } from '@/context/ConfirmationContext';
import { AuthorityType, EligibleAuthorityItem, NetworkUserItem, userService } from '@/services/userService';

const authorityLabels: Record<AuthorityType, string> = {
  PLATFORM: 'Admin / Bright Spark',
  MASTER_DISTRIBUTOR: 'Master Distributor',
  DISTRIBUTOR: 'Distributor',
};

interface Props {
  isOpen: boolean;
  user: NetworkUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserAuthorityTransferDrawer({ isOpen, user, onClose, onSuccess }: Props) {
  const { toastSuccess, toastError } = useToast();
  const confirm = useConfirmation();
  const [authorities, setAuthorities] = useState<EligibleAuthorityItem[]>([]);
  const [allowedTypes, setAllowedTypes] = useState<AuthorityType[]>([]);
  const [selectedType, setSelectedType] = useState<AuthorityType | null>(null);
  const [selected, setSelected] = useState<EligibleAuthorityItem | null>(null);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('Administrative network authority reassignment');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    let active = true;
    setLoading(true);
    setAuthorities([]);
    setSelectedType(null);
    setSelected(null);
    setSearch('');
    userService.getEligibleAuthorities(user.id)
      .then((response) => {
        if (!active || !response.success || !response.data) return;
        setAuthorities(response.data.items);
        setAllowedTypes(response.data.allowedAuthorityTypes);
      })
      .catch((error: unknown) => {
        if (active) toastError(error instanceof Error ? error.message : 'Failed to load eligible authorities.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isOpen, user, toastError]);

  const visibleAuthorities = useMemo(() => {
    if (!selectedType) return [];
    const query = search.trim().toLowerCase();
    return authorities.filter((authority) => authority.authorityType === selectedType && !authority.isCurrent &&
      (!query || `${authority.name} ${authority.code} ${authority.email || ''} ${authority.mobile || ''}`.toLowerCase().includes(query)));
  }, [authorities, search, selectedType]);

  const submit = async () => {
    if (!user || !selected || reason.trim().length < 3) return;
    const approved = await confirm({
      title: 'Move user to another authority?',
      message: `Move ${user.fullName} (${user.code}) from ${user.parentName || 'its current authority'} to ${selected.name} (${selected.code})? The user role will remain ${user.role.replaceAll('_', ' ')}.`,
      confirmText: 'Yes, move user',
      variant: 'warning',
    });
    if (!approved) return;
    setSubmitting(true);
    try {
      const response = await userService.transferUserAuthority(user.id, selected.partyId, reason.trim());
      if (!response.success) throw new Error(response.message || 'Authority transfer failed.');
      toastSuccess(`${user.fullName} moved under ${selected.name}. The user role was preserved.`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toastError(error instanceof Error ? error.message : 'Authority transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Move User Authority" description="Transfer reporting ownership without changing the user role." size="lg"
      footer={<div className="flex w-full gap-3"><Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button className="flex-1" onClick={submit} isLoading={submitting} disabled={!selected || reason.trim().length < 3} leftIcon={<ArrowLeftRight className="h-4 w-4" />}>Move User</Button></div>}>
      {user && <div className="space-y-5">
        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Current user</p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 font-bold text-white"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="font-bold text-slate-900">{user.fullName}</p><p className="text-xs text-slate-500">{user.code} · {user.role.replaceAll('_', ' ')}</p></div></div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600"><span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span><span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.mobile}</span></div>
            <p className="mt-3 text-xs text-slate-600">Current authority: <strong>{user.parentName || 'Bright Spark Admin'}</strong></p>
          </div>
        </section>

        <section><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Move user under</p><div className="space-y-2">{allowedTypes.map((type) => <button type="button" key={type} onClick={() => { setSelectedType(type); setSelected(null); }} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${selectedType === type ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedType === type ? 'border-blue-600' : 'border-slate-300'}`}>{selectedType === type && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}</span><Building2 className="h-4 w-4 text-slate-500" /><span className="text-sm font-semibold text-slate-800">{authorityLabels[type]}</span></button>)}</div></section>

        {selectedType && <section><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Select {authorityLabels[selectedType]}</p><div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, code, email or mobile" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-[#2F6F5E]" /></div><div className="max-h-64 space-y-2 overflow-y-auto">{loading ? <p className="py-6 text-center text-sm text-slate-500">Loading authorities…</p> : visibleAuthorities.length ? visibleAuthorities.map((authority) => <button type="button" key={authority.partyId} onClick={() => setSelected(authority)} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left ${selected?.partyId === authority.partyId ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{authority.name}</p><p className="text-xs text-slate-500">{authority.code}{authority.mobile ? ` · ${authority.mobile}` : ''}</p></div>{selected?.partyId === authority.partyId && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}</button>) : <p className="py-6 text-center text-sm text-slate-500">No eligible authorities found.</p>}</div></section>}

        <Input label="Transfer reason" value={reason} onChange={(event) => setReason(event.target.value)} required />
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Only reporting authority changes. Role, permissions, creator, wallet, KYC and login credentials remain unchanged.</p></div>
      </div>}
    </Drawer>
  );
}
