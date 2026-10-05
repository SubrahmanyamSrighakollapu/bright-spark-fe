'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TransactionLimit } from '@/types/domain';
import { Plus } from 'lucide-react';

export interface CreateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TransactionLimit, 'id'>) => Promise<void>;
}

export const CreateLimitModal: React.FC<CreateLimitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [scopeType, setScopeType] = useState<TransactionLimit['scopeType']>('GLOBAL');
  const [scopeName, setScopeName] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionLimit['transactionType']>('PAY_OUT');
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [minPerTxn, setMinPerTxn] = useState('100');
  const [maxPerTxn, setMaxPerTxn] = useState('200000');
  const [dailyAmount, setDailyAmount] = useState('1000000');
  const [dailyCount, setDailyCount] = useState('500');
  const [monthlyAmount, setMonthlyAmount] = useState('25000000');
  const [monthlyCount, setMonthlyCount] = useState('10000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number(minPerTxn);
    const max = Number(maxPerTxn);
    const dAmt = Number(dailyAmount);
    const mAmt = Number(monthlyAmount);

    if (isNaN(min) || isNaN(max) || min < 0 || max <= min) {
      setErrorMsg('Validation Error: Maximum per-transaction limit must be strictly greater than Minimum limit.');
      return;
    }

    if (dAmt < max) {
      setErrorMsg('Validation Error: Daily Amount Limit must be greater than or equal to Max Per-Transaction limit.');
      return;
    }

    if (mAmt < dAmt) {
      setErrorMsg('Validation Error: Monthly Amount Limit must be greater than or equal to Daily Amount limit.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        scopeType,
        scopeName: scopeType !== 'GLOBAL' ? scopeName || 'Custom Scope' : undefined,
        transactionType,
        paymentMode,
        minPerTransaction: min,
        maxPerTransaction: max,
        dailyAmountLimit: dAmt,
        dailyCountLimit: Number(dailyCount) || 100,
        monthlyAmountLimit: mAmt,
        monthlyCountLimit: Number(monthlyCount) || 1000,
        status: 'ACTIVE',
        effectiveFrom: new Date().toISOString(),
      });
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Failed to create limit rule.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Transaction Limit Rule" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Limit Scope *"
            value={scopeType}
            onChange={(e) => setScopeType(e.target.value as TransactionLimit['scopeType'])}
            options={[
              { value: 'GLOBAL', label: 'GLOBAL (Platform Default)' },
              { value: 'MERCHANT', label: 'RETAILER (Specific Retailer Override)' },
              { value: 'DISTRIBUTOR', label: 'DISTRIBUTOR Scope' },
              { value: 'RETAILER', label: 'RETAILER Scope' },
            ]}
          />
          {scopeType !== 'GLOBAL' && (
            <Input
              label="Entity Scope Name / ID *"
              placeholder="e.g. Apex Pay Solutions"
              value={scopeName}
              onChange={(e) => setScopeName(e.target.value)}
              required
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Transaction Type *"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as TransactionLimit['transactionType'])}
            options={[
              { value: 'PAY_OUT', label: 'PAY_OUT (Disbursement Payouts)' },
              { value: 'PAY_IN', label: 'PAY_IN (Customer Collections)' },
              { value: 'ALL', label: 'ALL Types' },
            ]}
          />
          <Select
            label="Payment Mode *"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            options={[
              { value: 'ALL', label: 'ALL Modes (UPI, IMPS, NEFT)' },
              { value: 'UPI', label: 'UPI' },
              { value: 'IMPS', label: 'IMPS' },
              { value: 'NEFT', label: 'NEFT' },
              { value: 'RTGS', label: 'RTGS' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Min Amount Per Txn (₹) *"
            type="number"
            value={minPerTxn}
            onChange={(e) => setMinPerTxn(e.target.value)}
            required
          />
          <Input
            label="Max Amount Per Txn (₹) *"
            type="number"
            value={maxPerTxn}
            onChange={(e) => setMaxPerTxn(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Daily Amount Limit (₹) *"
            type="number"
            value={dailyAmount}
            onChange={(e) => setDailyAmount(e.target.value)}
            required
          />
          <Input
            label="Daily Txn Count Limit *"
            type="number"
            value={dailyCount}
            onChange={(e) => setDailyCount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Monthly Amount Limit (₹) *"
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            required
          />
          <Input
            label="Monthly Txn Count Limit *"
            type="number"
            value={monthlyCount}
            onChange={(e) => setMonthlyCount(e.target.value)}
            required
          />
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-900 leading-relaxed text-[11px]">
          <strong>Precedence Rule:</strong> Specific entity overrides (Retailer/Distributor) take precedence over Global platform defaults during limit evaluation.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Limit Rule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
