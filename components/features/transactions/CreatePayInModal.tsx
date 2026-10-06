'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { transactionService } from '@/services/transactionService';
import { PayInRequestInput, Transaction } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface CreatePayInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTx: Transaction) => void;
}

export const CreatePayInModal: React.FC<CreatePayInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PayInRequestInput>({
    merchantId: 'Apex Pay Solutions',
    amount: 5000,
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    orderId: '',
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0 || !formData.customerName || !formData.customerMobile) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await transactionService.createMockPayinRequest(formData);
      if (res.success && res.data) {
        setCreatedTx(res.data);
        if (onSuccess) onSuccess(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setCreatedTx(null);
    setFormData({
      merchantId: 'Apex Pay Solutions',
      amount: 5000,
      customerName: '',
      customerMobile: '',
      customerEmail: '',
      orderId: '',
      remarks: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={createdTx ? 'Pay-In Request Created' : 'Create Pay-In / Payment Request'}
      description={
        createdTx
          ? 'Mock payment request link generated successfully'
          : 'Generate a payment request link for customer collection'
      }
      size="md"
    >
      {createdTx ? (
        <div className="space-y-4 py-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-emerald-950 text-sm block">Payment Link Ready</span>
              <p className="text-emerald-800">
                Mock collection request created for <strong>{createdTx.customerName}</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-[var(--primary)]">{createdTx.transactionRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono">{createdTx.orderId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-[var(--primary)]">{formatCurrency(createdTx.amount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status={createdTx.status} size="sm" />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Payer Mobile:</span>
              <span>{createdTx.customerMobile}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleResetModal}>
              Create Another
            </Button>

            <Link href={`/admin/transactions/${createdTx.id}`}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetModal}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Transaction
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Select
            label="Requesting Retailer *"
            value={formData.merchantId}
            onChange={(e) => setFormData((prev) => ({ ...prev, merchantId: e.target.value }))}
            options={[
              { value: 'Apex Pay Solutions', label: 'Apex Pay Solutions' },
              { value: 'Zenith Retail', label: 'Zenith Retail' },
              { value: 'Global Fintech Ltd', label: 'Global Fintech Ltd' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Collection Amount (₹) *"
              type="number"
              min={1}
              value={formData.amount || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
              required
            />

            <Input
              label="Client Order ID (Optional)"
              placeholder="e.g. ORD_991823"
              value={formData.orderId || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Payer Customer Name *"
              placeholder="Full Name"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
              required
            />

            <Input
              label="Customer Mobile *"
              placeholder="10-digit mobile"
              value={formData.customerMobile}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerMobile: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Customer Email (Optional)"
            type="email"
            placeholder="customer@example.com"
            value={formData.customerEmail || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
          />

          <Input
            label="Remarks / Description"
            placeholder="Payment note..."
            value={formData.remarks || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Generate Payment Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
