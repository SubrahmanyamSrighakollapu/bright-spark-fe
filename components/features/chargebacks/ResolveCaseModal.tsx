'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Chargeback } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';
import { ShieldCheck } from 'lucide-react';

export interface ResolveCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargeback: Chargeback | null;
  onResolve: (chargebackId: string, resolution: 'WON' | 'LOST' | 'WITHDRAWN', reason: string) => Promise<void>;
}

export const ResolveCaseModal: React.FC<ResolveCaseModalProps> = ({
  isOpen,
  onClose,
  chargeback,
  onResolve,
}) => {
  const [resolution, setResolution] = useState<'WON' | 'LOST' | 'WITHDRAWN'>('WON');
  const [resolutionReason, setResolutionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!chargeback) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionReason.trim()) return;
    setIsSubmitting(true);
    await onResolve(chargeback.chargebackId, resolution, resolutionReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Dispute Case" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-semibold text-slate-900">Case ID: {chargeback.chargebackId}</div>
          <div className="text-[11px] text-slate-500">Retailer: {chargeback.entityName}</div>
          <div className="text-[11px] font-mono text-rose-700 font-bold">Disputed Amount: {formatCurrency(chargeback.disputedAmount)}</div>
        </div>

        <Select
          label="Resolution Outcome"
          value={resolution}
          onChange={(e) => setResolution(e.target.value as 'WON' | 'LOST' | 'WITHDRAWN')}
          options={[
            { value: 'WON', label: 'WON — Representment Accepted (Release Lien Hold)' },
            { value: 'LOST', label: 'LOST — Representment Rejected (Book Financial Loss)' },
            { value: 'WITHDRAWN', label: 'WITHDRAWN — Issuer Cancelled Dispute' },
          ]}
        />

        {resolution === 'WON' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
            <span className="font-bold block">Financial Effect:</span>
            Lien hold of {formatCurrency(chargeback.holdAmount)} will be released back to the available wallet balance. An immutable RELEASE ledger entry will be recorded.
          </div>
        )}

        {resolution === 'LOST' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
            <span className="font-bold block">Financial Effect:</span>
            Disputed amount {formatCurrency(chargeback.disputedAmount)} will be converted into booked financial loss. An immutable CHARGE/DEBIT ledger entry will be recorded.
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Resolution Reason / Official Findings</label>
          <textarea
            placeholder="State official reason code, bank letter summary, or committee decision notes..."
            value={resolutionReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolutionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans text-slate-900 focus:outline-hidden focus:border-[var(--primary)]"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Confirm Resolution
          </Button>
        </div>
      </form>
    </Modal>
  );
};

