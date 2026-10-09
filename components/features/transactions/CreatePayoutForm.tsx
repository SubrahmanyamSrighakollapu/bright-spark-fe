'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Select, Input, Button, StatusBadge, MobileInput } from '@/components/ui';
import { Wallet, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { transactionService } from '@/services/transactionService';
import { PayoutRequestInput, Transaction } from '@/types/domain';
import { formatCurrency } from '@/utils/formatters';

export const CreatePayoutForm: React.FC = () => {
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [formData, setFormData] = useState<PayoutRequestInput>({
    merchantId: 'Apex Pay Solutions',
    beneficiaryName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: 'HDFC Bank',
    mobileNumber: '',
    upiId: '',
    paymentMode: 'IMPS',
    amount: 10000,
    remarks: '',
    orderReference: '',
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);

  // Fetch shared wallet balance on mount
  useEffect(() => {
    let isCancelled = false;
    walletService.getBalance().then((res) => {
      if (!isCancelled && res.success && res.data) {
        setAvailableBalance(res.data.availableBalance);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Declarative computation of charges breakdown (no useEffect required)
  const charges = transactionService.calculateMockPayoutCharges(formData.amount || 0);
  const isBalanceInsufficient = charges.totalDebit > availableBalance;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryName || (!formData.accountNumber && !formData.upiId) || isBalanceInsufficient) {
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await transactionService.createMockPayout(formData);
      if (res.success && res.data) {
        setCreatedTx(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdTx) {
    return (
      <Card title="Payout Request Created" subtitle="Dispatched to payment switch">
        <div className="space-y-6 py-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-emerald-950 text-sm block">Payout Request Accepted</span>
              <p className="text-emerald-800">
                Payout request for <strong>{createdTx.beneficiaryName}</strong> has been queued for bank processing.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Transaction Reference:</span>
              <span className="font-mono font-bold text-[var(--primary)] text-sm">{createdTx.transactionRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status={createdTx.status} size="sm" />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Beneficiary:</span>
              <span className="font-semibold">{createdTx.beneficiaryName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Transfer Amount:</span>
              <span className="font-bold text-[var(--text-primary)]">{formatCurrency(createdTx.amount)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Wallet Debit:</span>
              <span className="font-bold text-[var(--primary)]">{formatCurrency(createdTx.netAmount)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border)]">
            <Link href="/admin/transactions/payout">
              <Button variant="outline" size="sm">
                Back to Pay-Out List
              </Button>
            </Link>

            <Link href={`/admin/transactions/${createdTx.id}`}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Transaction Details
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step 1: Wallet Balance Banner */}
      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-[var(--radius-xl)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-blue-950/70 tracking-wider">
              Requesting Entity Balance ({formData.merchantId})
            </span>
            <div className="text-lg font-mono font-extrabold text-[var(--primary)]">
              {formatCurrency(availableBalance)}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Shared Wallet Feed Active</span>
        </div>
      </div>

      {isConfirming ? (
        /* Confirmation Summary Step */
        <Card title="Confirm Payout Request" subtitle="Review charges & beneficiary details before dispatch">
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Requesting Entity:</span>
                <span className="font-semibold">{formData.merchantId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Beneficiary Name:</span>
                <span className="font-bold">{formData.beneficiaryName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Payout Mode:</span>
                <span className="font-semibold">{formData.paymentMode}</span>
              </div>
              {formData.accountNumber && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bank Account:</span>
                  <span className="font-mono">XXXXXX{formData.accountNumber.slice(-4)} ({formData.bankName})</span>
                </div>
              )}
              {formData.upiId && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">VPA Address:</span>
                  <span className="font-mono">{formData.upiId}</span>
                </div>
              )}
            </div>

            {/* Charge Breakdown Card */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Charge Breakdown (Mock Computation)
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Payout Amount:</span>
                <span className="font-semibold">{formatCurrency(charges.amount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Platform Fee:</span>
                <span>{formatCurrency(charges.fee)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">GST (18% on Fee):</span>
                <span>{formatCurrency(charges.gst)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">TDS Deduction:</span>
                <span>{formatCurrency(charges.tds)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-blue-200 font-bold text-sm text-[var(--primary)]">
                <span>Total Debit:</span>
                <span>{formatCurrency(charges.totalDebit)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsConfirming(false)}>
                Back to Edit
              </Button>

              <Button variant="primary" size="lg" onClick={handleFinalSubmit} isLoading={isSubmitting}>
                Confirm Payout
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Form Inputs Step */
        <Card title="Payout Details" subtitle="Enter beneficiary details and payout amount">
          <form onSubmit={handleNextStep} className="space-y-6 text-xs">
            {/* Section 1: Entity Selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                1. Requesting Retailer
              </h3>
              <Select
                label="Select Retailer *"
                value={formData.merchantId}
                onChange={(e) => setFormData((prev) => ({ ...prev, merchantId: e.target.value }))}
                options={[
                  { value: 'Apex Pay Solutions', label: 'Apex Pay Solutions' },
                  { value: 'Zenith Retail', label: 'Zenith Retail' },
                  { value: 'Global Fintech Ltd', label: 'Global Fintech Ltd' },
                ]}
              />
            </div>

            {/* Section 2: Beneficiary Details */}
            <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                2. Beneficiary Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Beneficiary Full Name *"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, beneficiaryName: e.target.value }))}
                  required
                />

                <MobileInput
                  label="Mobile Number (Optional)"
                  value={formData.mobileNumber || ''}
                  onChange={(e: any) => {
                    const val = typeof e === 'string' ? e : e?.target?.value || '';
                    setFormData((prev) => ({ ...prev, mobileNumber: val }));
                  }}
                />
              </div>

              {formData.paymentMode === 'UPI' ? (
                <Input
                  label="UPI VPA Address *"
                  placeholder="e.g. name@upi"
                  value={formData.upiId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, upiId: e.target.value }))}
                  required
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Account Number *"
                    placeholder="Enter account number"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    required
                  />

                  <Input
                    label="IFSC Code *"
                    placeholder="e.g. HDFC0001234"
                    value={formData.ifscCode || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ifscCode: e.target.value }))}
                    required
                  />

                  <Select
                    label="Bank Name"
                    value={formData.bankName || 'HDFC Bank'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                    options={[
                      { value: 'HDFC Bank', label: 'HDFC Bank' },
                      { value: 'ICICI Bank', label: 'ICICI Bank' },
                      { value: 'State Bank of India', label: 'State Bank of India' },
                      { value: 'Axis Bank', label: 'Axis Bank' },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Section 3: Payout Mode & Amount */}
            <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                3. Transfer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Payout Mode *"
                  value={formData.paymentMode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMode: e.target.value as 'IMPS' | 'NEFT' | 'RTGS' | 'UPI',
                    }))
                  }
                  options={[
                    { value: 'IMPS', label: 'IMPS (Instant 24x7 Transfer)' },
                    { value: 'NEFT', label: 'NEFT (National Electronic Fund Transfer)' },
                    { value: 'RTGS', label: 'RTGS (Real Time Gross Settlement)' },
                    { value: 'UPI', label: 'UPI (Unified Payments Interface)' },
                  ]}
                />

                <Input
                  label="Payout Amount (₹) *"
                  type="number"
                  min={1}
                  value={formData.amount || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Order / Reference ID (Optional)"
                  placeholder="e.g. REF_991823"
                  value={formData.orderReference || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orderReference: e.target.value }))}
                />

                <Input
                  label="Remarks / Purpose (Optional)"
                  placeholder="e.g. Vendor payout"
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>

            {/* Section 4: Charge Breakdown Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span>{formatCurrency(charges.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Fee + GST + TDS:</span>
                <span>+{formatCurrency(charges.fee + charges.gst + charges.tds)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-2 text-[var(--primary)]">
                <span>Total Debit:</span>
                <span>{formatCurrency(charges.totalDebit)}</span>
              </div>
            </div>

            {/* Balance Validation Error Warning */}
            {isBalanceInsufficient && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Insufficient available balance ({formatCurrency(availableBalance)}) to process this payout total debit ({formatCurrency(charges.totalDebit)}).
                </span>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isBalanceInsufficient || !formData.beneficiaryName}
              >
                Proceed to Confirmation
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
