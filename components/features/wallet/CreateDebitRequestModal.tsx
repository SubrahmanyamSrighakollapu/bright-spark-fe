'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { walletService } from '@/services/walletService';

export interface CreateDebitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateDebitRequestModal: React.FC<CreateDebitRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [walletId, setWalletId] = useState('wlt_mch_001');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await walletService.createDebitRequest({
        entityId: 'ent_mch_01',
        walletId,
        amount: numericAmount,
        reason,
        remarks,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        setAmount('');
        setReason('');
        setRemarks('');
        onClose();
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Debit Request"
      description="Submit a wallet debit request for accounts review & approval"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label="Select Wallet / Entity *"
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          options={[
            { value: 'wlt_mch_001', label: 'Apex Pay Solutions (BSP-MCH-001)' },
            { value: 'wlt_mch_002', label: 'Global Fintech Ltd (BSP-MCH-002)' },
            { value: 'wlt_dist_001', label: 'North Zone Dist (BSP-DIST-001)' },
            { value: 'wlt_rtl_001', label: 'Zenith Retail (BSP-RTL-001)' },
          ]}
        />

        <Input
          label="Requested Debit Amount (₹) *"
          type="number"
          step="0.01"
          placeholder="e.g. 75000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Reason for Request *"
          placeholder="e.g. Vendor clawback / invoice adjustment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <Input
          label="Operational Remarks (Optional)"
          placeholder="Additional context for accounts reviewer"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
          <strong>Note:</strong> Creating a debit request does not deduct wallet balance immediately. The request will enter `PENDING` status for finance review.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Submit Debit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
