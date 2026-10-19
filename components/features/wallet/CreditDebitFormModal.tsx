'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { WalletAccount } from '@/types/domain';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeftRight, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

export interface CreditDebitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: WalletAccount | null;
  onSuccess?: () => void;
}

export const CreditDebitFormModal: React.FC<CreditDebitFormModalProps> = ({
  isOpen,
  onClose,
  wallet: initialWallet,
  onSuccess,
}) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>(initialWallet?.walletId || 'wlt_mch_001');
  const [activeWallet, setActiveWallet] = useState<WalletAccount | null>(initialWallet || null);
  const [operationType, setOperationType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [autoRefId, setAutoRefId] = useState<string>('');
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    if (!initialWallet && selectedWalletId) {
      walletService.getWalletById(selectedWalletId).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setActiveWallet(res.data);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [initialWallet, selectedWalletId]);

  if (!isOpen) return null;

  const currentWallet = initialWallet || activeWallet;

  const numericAmount = parseFloat(amount) || 0;
  const currentBalance = currentWallet ? currentWallet.availableBalance : 0;
  const expectedBalance =
    operationType === 'CREDIT'
      ? currentBalance + numericAmount
      : currentBalance - numericAmount;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numericAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.00.');
      return;
    }

    if (operationType === 'DEBIT' && numericAmount > currentBalance) {
      setErrorMessage(
        `Debit amount (${formatCurrency(numericAmount)}) exceeds available balance (${formatCurrency(currentBalance)}). Overdraft is disabled.`
      );
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Adjustment reason is required.');
      return;
    }

    setAutoRefId(`ADJ_${Date.now()}`);
    setIsConfirmStep(true);
  };

  const handleConfirmSubmit = async () => {
    if (!currentWallet) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const finalRef = reference.trim() || autoRefId;
      if (operationType === 'CREDIT') {
        await walletService.creditWallet(
          currentWallet.walletId,
          numericAmount,
          reason,
          finalRef
        );
      } else {
        await walletService.debitWallet(
          currentWallet.walletId,
          numericAmount,
          reason,
          finalRef
        );
      }

      if (onSuccess) onSuccess();
      handleResetAndClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet adjustment failed.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsConfirmStep(false);
    setAmount('');
    setReason('');
    setReference('');
    setAutoRefId('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isConfirmStep ? 'Confirm Wallet Adjustment' : 'Wallet Credit / Debit Adjustment'}
      description={
        isConfirmStep
          ? `Review and confirm ${operationType} operation`
          : 'Perform controlled manual wallet balance adjustment'
      }
      size="md"
    >
      {isConfirmStep && currentWallet ? (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex justify-between py-1 border-b border-blue-200">
              <span className="text-blue-900 font-medium">Target Entity:</span>
              <span className="font-bold text-blue-950">{currentWallet.entityName} ({currentWallet.entityCode})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200">
              <span className="text-blue-900 font-medium">Wallet ID:</span>
              <span className="font-mono font-bold text-[var(--primary)]">{currentWallet.walletId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200">
              <span className="text-blue-900 font-medium">Operation Type:</span>
              <span
                className={`font-bold uppercase ${
                  operationType === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {operationType}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200">
              <span className="text-blue-900 font-medium">Adjustment Amount:</span>
              <span className="font-mono font-extrabold text-sm text-slate-900">
                {formatCurrency(numericAmount)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200">
              <span className="text-blue-900 font-medium">Current Available Balance:</span>
              <span className="font-mono font-bold">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-blue-900 font-medium">Expected Available Balance:</span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  operationType === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                }`}
              >
                {formatCurrency(expectedBalance)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="font-semibold">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reference ID:</span>
              <span className="font-mono">{reference.trim() || autoRefId}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConfirmStep(false)}>
              Back
            </Button>
            <Button
              variant={operationType === 'CREDIT' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirmSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirm {operationType} Adjustment
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleNextStep} className="space-y-4 text-xs">
          {!initialWallet && (
            <Select
              label="Select Entity / Wallet *"
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              options={[
                { value: 'wlt_master_001', label: 'Bright Spark Master Treasury (BSP-MSTR-01)' },
                { value: 'wlt_dist_001', label: 'North Zone Dist (BSP-DIST-001)' },
                { value: 'wlt_dist_002', label: 'West Coast Agency (BSP-DIST-002)' },
                { value: 'wlt_rtl_001', label: 'Zenith Retail (BSP-RTL-001)' },
                { value: 'wlt_mch_001', label: 'Apex Pay Solutions (BSP-MCH-001)' },
                { value: 'wlt_mch_002', label: 'Global Fintech Ltd (BSP-MCH-002)' },
              ]}
            />
          )}

          {currentWallet && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Selected Entity</span>
                <span className="font-bold text-slate-900">{currentWallet.entityName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Current Available</span>
                <span className="font-mono font-bold text-[var(--primary)]">
                  {formatCurrency(currentWallet.availableBalance)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block">Operation Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOperationType('CREDIT')}
                className={`p-3 text-left border rounded-lg flex items-center gap-2.5 transition-colors ${
                  operationType === 'CREDIT'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">CREDIT (+)</span>
                  <span className="text-[10px] text-slate-500">Add funds to wallet</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOperationType('DEBIT')}
                className={`p-3 text-left border rounded-lg flex items-center gap-2.5 transition-colors ${
                  operationType === 'DEBIT'
                    ? 'border-rose-500 bg-rose-50/60 text-rose-950 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block">DEBIT (-)</span>
                  <span className="text-[10px] text-slate-500">Deduct funds from wallet</span>
                </div>
              </button>
            </div>
          </div>

          <Input
            label="Adjustment Amount (₹) *"
            type="number"
            step="0.01"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Adjustment Reason *"
            placeholder="e.g. Monthly commission credit / fee clawback"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <Input
            label="Reference ID (Optional)"
            placeholder="e.g. REF_AUDIT_9912"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 font-semibold text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Review Adjustment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
