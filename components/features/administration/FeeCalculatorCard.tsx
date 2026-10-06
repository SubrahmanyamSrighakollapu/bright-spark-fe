'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FeeRule } from '@/types/domain';
import { adminService } from '@/services/adminService';
import { formatCurrency } from '@/utils/formatters';
import { Calculator } from 'lucide-react';

export interface FeeCalculatorCardProps {
  feeRules: FeeRule[];
}

export const FeeCalculatorCard: React.FC<FeeCalculatorCardProps> = ({ feeRules }) => {
  const [amount, setAmount] = useState('100000');
  const [selectedRuleId, setSelectedRuleId] = useState(feeRules[0]?.id || 'FEE_PAYIN_01');
  const [gstRate, setGstRate] = useState('18.0');

  const selectedRule = feeRules.find((r) => r.id === selectedRuleId) || feeRules[0];
  const numAmount = Math.max(0, Number(amount) || 0);
  const numGst = Math.max(0, Number(gstRate) || 0);

  const preview = selectedRule
    ? adminService.calculateFeePreview(numAmount, selectedRule, numGst)
    : { transactionAmount: numAmount, baseFee: 0, gstAmount: 0, totalCharges: 0, netSettlement: numAmount };

  return (
    <Card title="Interactive Fee & Tax Calculation Preview" subtitle="Simulate commercial fee calculations, GST additions, and net disburse values">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Input Parameters */}
        <div className="space-y-4">
          <Input
            label="Transaction Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Select
            label="Applied Fee Master Rule"
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
            options={feeRules.map((r) => ({
              value: r.id,
              label: `${r.name} (${r.calculationType === 'PERCENTAGE' ? `${r.value}%` : `₹${r.value}`})`,
            }))}
          />

          <Input
            label="Applicable GST Rate (%)"
            type="number"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
          />
        </div>

        {/* Calculation Result Breakdown */}
        <div className="p-4 bg-slate-900 text-slate-100 rounded-lg space-y-3 font-mono">
          <div className="text-xs font-sans font-bold text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Calculation Result Breakdown</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">Transaction Principal:</span>
            <span className="text-white font-bold">{formatCurrency(preview.transactionAmount)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-purple-400">
              Calculated Base Fee ({selectedRule?.calculationType === 'PERCENTAGE' ? `${selectedRule.value}%` : 'Flat'}):
            </span>
            <span className="text-purple-300 font-bold">{formatCurrency(preview.baseFee)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-amber-400">GST @{numGst}%:</span>
            <span className="text-amber-300 font-bold">{formatCurrency(preview.gstAmount)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1 text-sm">
            <span className="text-rose-400 font-bold">Total Platform Charges:</span>
            <span className="text-rose-400 font-extrabold">{formatCurrency(preview.totalCharges)}</span>
          </div>

          <div className="flex justify-between pt-2 text-base font-sans font-extrabold bg-slate-800/80 p-2 rounded">
            <span className="text-emerald-400">Net Retailer Settlement:</span>
            <span className="text-emerald-300">{formatCurrency(preview.netSettlement)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
