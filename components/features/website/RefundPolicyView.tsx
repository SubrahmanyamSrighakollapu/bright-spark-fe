'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { RotateCcw, Save, Clock, AlertCircle } from 'lucide-react';

const DEFAULT_REFUND_POLICY = `## 1. Crop Order Cancellation SLA
Purchasers may cancel produce procurement orders within 24 hours of placement provided dispatch status is Pending.

## 2. Failed Bank Payout Refund SLA
In cases of bank UTR failure or failed IMPS transactions, funds are auto-reversed back into the master wallet within 5-7 Business Days.

## 3. Discrepancy Claims
Dispute claims regarding partial wallet debit must be lodged via support portal attached with payment bank proof screenshot.`;

export const RefundPolicyView: React.FC = () => {
  const { toastSuccess } = useToast();

  const [cancellationSlaHours, setCancellationSlaHours] = useState<number>(24);
  const [refundProcessingSlaDays, setRefundProcessingSlaDays] = useState<string>('5-7 Business Days');
  const [policyContent, setPolicyContent] = useState(DEFAULT_REFUND_POLICY);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toastSuccess('Refund policy SLA parameters updated successfully!');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-[#155EEF]" />
            Refund & Cancellation Policy Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Define customer order cancellation SLAs, payout dispute timelines, and refund eligibility rules.
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#155EEF]" /> Cancellation SLA (Max Hours)
              </label>
              <Input
                type="number"
                placeholder="24"
                value={cancellationSlaHours}
                onChange={(e) => setCancellationSlaHours(parseInt(e.target.value) || 0)}
                required
              />
              <span className="text-[11px] text-[#64748B]">Maximum hours allowed for user order cancellation</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#155EEF]" /> Refund Processing SLA (Turnaround Time)
              </label>
              <Input
                placeholder="e.g. 5-7 Business Days"
                value={refundProcessingSlaDays}
                onChange={(e) => setRefundProcessingSlaDays(e.target.value)}
                required
              />
              <span className="text-[11px] text-[#64748B]">Expected banking turnaround duration for fund reversals</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Refund Policy Terms (Policy Content Body)
            </label>
            <textarea
              rows={10}
              value={policyContent}
              onChange={(e) => setPolicyContent(e.target.value)}
              className="w-full p-4 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF] leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={isSaving} className="bg-[#155EEF] hover:bg-[#124BCC]">
              <Save className="w-4 h-4 mr-2" />
              Save Refund Policy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
