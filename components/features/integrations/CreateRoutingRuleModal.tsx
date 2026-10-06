'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IntegrationServiceType, TransactionMode, EntityType, Provider } from '@/types/domain';
import { GitFork, AlertTriangle } from 'lucide-react';

export interface CreateRoutingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  onCreateRule: (
    service: IntegrationServiceType,
    transactionType: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT',
    primaryProviderId: string,
    secondaryProviderId: string,
    minAmount: number,
    maxAmount: number,
    mode: TransactionMode | 'ALL',
    entityType: EntityType | 'ALL',
    priority: number
  ) => Promise<void>;
}

export const CreateRoutingRuleModal: React.FC<CreateRoutingRuleModalProps> = ({
  isOpen,
  onClose,
  providers,
  onCreateRule,
}) => {
  const [transactionType, setTransactionType] = useState<'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT'>('PAY_IN');
  const [primaryProviderId, setPrimaryProviderId] = useState(providers[0]?.id || 'PRV_HDFC_01');
  const [secondaryProviderId, setSecondaryProviderId] = useState(providers[1]?.id || 'PRV_RZP_01');
  const [minAmount, setMinAmount] = useState('1');
  const [maxAmount, setMaxAmount] = useState('100000');
  const [mode, setMode] = useState<TransactionMode | 'ALL'>('ALL');
  const [entityType, setEntityType] = useState<EntityType | 'ALL'>('ALL');
  const [priority, setPriority] = useState('1');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (primaryProviderId === secondaryProviderId) {
      setErrorMsg('Primary and Fallback secondary providers cannot be identical.');
      return;
    }

    const minVal = parseFloat(minAmount) || 0;
    const maxVal = parseFloat(maxAmount) || 0;
    if (minVal > maxVal) {
      setErrorMsg('Minimum amount cannot exceed maximum amount.');
      return;
    }

    setIsSubmitting(true);
    await onCreateRule(
      transactionType,
      transactionType,
      primaryProviderId,
      secondaryProviderId,
      minVal,
      maxVal,
      mode,
      entityType,
      parseInt(priority) || 1
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Failover Routing Rule" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Transaction Type"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT')}
            options={[
              { value: 'PAY_IN', label: 'Pay-In Processing' },
              { value: 'PAY_OUT', label: 'Pay-Out Disbursement' },
              { value: 'SETTLEMENT', label: 'Settlement Batch' },
            ]}
          />

          <Select
            label="Transaction Mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as TransactionMode | 'ALL')}
            options={[
              { value: 'ALL', label: 'All Modes' },
              { value: 'UPI', label: 'UPI' },
              { value: 'IMPS', label: 'IMPS' },
              { value: 'NEFT', label: 'NEFT' },
              { value: 'RTGS', label: 'RTGS' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'WEB', label: 'Web Checkout' },
            ]}
          />

          <Select
            label="Primary Provider (Priority 1)"
            value={primaryProviderId}
            onChange={(e) => setPrimaryProviderId(e.target.value)}
            options={providers.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.healthStatus})`,
            }))}
          />

          <Select
            label="Fallback Secondary Provider"
            value={secondaryProviderId}
            onChange={(e) => setSecondaryProviderId(e.target.value)}
            options={providers.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.healthStatus})`,
            }))}
          />

          <Input
            label="Minimum Amount (₹)"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            required
          />

          <Input
            label="Maximum Amount (₹)"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            required
          />

          <Select
            label="Target Entity Scope"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType | 'ALL')}
            options={[
              { value: 'ALL', label: 'All Entity Types' },
              { value: 'MERCHANT', label: 'Retailer' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAILER', label: 'Retailer' },
            ]}
          />

          <Input
            label="Rule Priority"
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<GitFork className="w-3.5 h-3.5" />}>
            Create Routing Rule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
