'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { InvoiceType, EntityType, ServiceCode } from '@/types/domain';
import { calculateInvoiceBreakdown } from '@/utils/taxCalculations';
import { formatCurrency } from '@/utils/formatters';
import { FilePlus, Calculator } from 'lucide-react';

export interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (
    entityId: string,
    entityName: string,
    entityCode: string,
    entityType: EntityType,
    invoiceType: InvoiceType,
    taxableAmount: number,
    gstRate: number,
    tdsApplicable: boolean,
    tdsRate: number,
    billingPeriod: string,
    description: string,
    serviceCode?: ServiceCode
  ) => Promise<void>;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [serviceCode, setServiceCode] = useState<ServiceCode>('DEFAULT');
  const [entityId, setEntityId] = useState('ent_mch_01');
  const [entityName, setEntityName] = useState('Apex Pay Solutions');
  const [entityCode, setEntityCode] = useState('QSP-MCH-001');
  const [entityType, setEntityType] = useState<EntityType>('MERCHANT');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('PLATFORM_FEE');
  const [taxableAmount, setTaxableAmount] = useState('15400');
  const [gstRate, setGstRate] = useState('18');
  const [tdsApplicable, setTdsApplicable] = useState(true);
  const [tdsRate, setTdsRate] = useState('10');
  const [billingPeriod, setBillingPeriod] = useState('September 2026');
  const [description, setDescription] = useState('Platform service fee billing');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedTaxable = parseFloat(taxableAmount) || 0;
  const parsedGstRate = parseFloat(gstRate) || 0;
  const parsedTdsRate = parseFloat(tdsRate) || 0;

  const preview = calculateInvoiceBreakdown({
    taxableAmount: parsedTaxable,
    gstRate: parsedGstRate,
    tdsApplicable,
    tdsRate: parsedTdsRate,
  });

  const handleEntitySelect = (val: string) => {
    setEntityId(val);
    if (val === 'ent_mch_01') {
      setEntityName('Apex Pay Solutions');
      setEntityCode('QSP-MCH-001');
      setEntityType('MERCHANT');
    } else if (val === 'ent_mch_02') {
      setEntityName('Global Fintech Ltd');
      setEntityCode('QSP-MCH-002');
      setEntityType('MERCHANT');
    } else if (val === 'ent_dist_01') {
      setEntityName('North Zone Dist');
      setEntityCode('QSP-DIST-001');
      setEntityType('DISTRIBUTOR');
    } else if (val === 'ent_rtl_01') {
      setEntityName('Zenith Retail');
      setEntityCode('QSP-RTL-001');
      setEntityType('RETAILER');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedTaxable <= 0) return;
    setIsSubmitting(true);
    await onGenerate(
      entityId,
      entityName,
      entityCode,
      entityType,
      invoiceType,
      parsedTaxable,
      parsedGstRate,
      tdsApplicable,
      parsedTdsRate,
      billingPeriod,
      description,
      serviceCode
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Service Invoice" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Platform Service"
            value={serviceCode}
            onChange={(e) => setServiceCode(e.target.value as ServiceCode)}
            options={[
              { value: 'DEFAULT', label: 'Qin Star Pay Platform Default (SAC 998311)' },
              { value: 'PAY_IN', label: 'Pay-In Collection Service (SAC 998311)' },
              { value: 'PAY_OUT', label: 'Pay-Out Disbursal Service (SAC 998312)' },
              { value: 'AEPS', label: 'AEPS & MicroATM Service (SAC 998313)' },
              { value: 'BBPS', label: 'BBPS Utility Bills Service (SAC 998314)' },
              { value: 'DMT', label: 'DMT Domestic Money Transfer (SAC 998315)' },
              { value: 'RECHARGE', label: 'Mobile & DTH Recharge (SAC 998316)' },
            ]}
          />

          <Select
            label="Billed Entity"
            value={entityId}
            onChange={(e) => handleEntitySelect(e.target.value)}
            options={[
              { value: 'ent_mch_01', label: 'Apex Pay Solutions (Merchant)' },
              { value: 'ent_mch_02', label: 'Global Fintech Ltd (Merchant)' },
              { value: 'ent_dist_01', label: 'North Zone Dist (Distributor)' },
              { value: 'ent_rtl_01', label: 'Zenith Retail (Retailer)' },
            ]}
          />

          <Select
            label="Invoice Category"
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
            options={[
              { value: 'PLATFORM_FEE', label: 'Platform Fee' },
              { value: 'SERVICE_FEE', label: 'Service Fee' },
              { value: 'SETTLEMENT_INVOICE', label: 'Settlement Invoice' },
              { value: 'ADJUSTMENT_INVOICE', label: 'Adjustment Invoice' },
            ]}
          />

          <Input
            label="Taxable Fee Amount (₹)"
            type="number"
            placeholder="15400"
            value={taxableAmount}
            onChange={(e) => setTaxableAmount(e.target.value)}
            required
          />

          <Input
            label="Billing Period"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            required
          />

          <Select
            label="GST Rate (%)"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            options={[
              { value: '18', label: '18% GST (Standard Platform Rate)' },
              { value: '12', label: '12% GST' },
              { value: '5', label: '5% GST' },
              { value: '0', label: '0% Exempted' },
            ]}
          />

          <Select
            label="TDS Deduction"
            value={tdsApplicable ? 'YES' : 'NO'}
            onChange={(e) => setTdsApplicable(e.target.value === 'YES')}
            options={[
              { value: 'YES', label: 'Yes — Deduct TDS' },
              { value: 'NO', label: 'No TDS Applicable' },
            ]}
          />

          {tdsApplicable && (
            <Select
              label="TDS Rate (%)"
              value={tdsRate}
              onChange={(e) => setTdsRate(e.target.value)}
              options={[
                { value: '10', label: '10% TDS (Standard Professional Fee)' },
                { value: '2', label: '2% TDS' },
                { value: '1', label: '1% TDS' },
              ]}
            />
          )}
        </div>

        <Input
          label="Line Item Description"
          placeholder="State platform service fee details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Live Tax Preview Calculation */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1.5 font-mono text-xs">
          <div className="font-bold text-purple-900 flex items-center gap-1.5 font-sans">
            <Calculator className="w-3.5 h-3.5 text-purple-700" />
            <span>Live Invoice Tax Breakdown Preview</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-purple-700 block">Taxable Fee</span>
              <span className="font-bold text-slate-900">{formatCurrency(preview.taxableAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-700 block">GST (+{preview.gstRate}%)</span>
              <span className="font-bold text-purple-800">+{formatCurrency(preview.gstAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-700 block">TDS (-{preview.tdsRate}%)</span>
              <span className="font-bold text-amber-800">-{formatCurrency(preview.tdsAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-700 block">Net Receivable</span>
              <span className="font-extrabold text-[var(--primary)]">{formatCurrency(preview.netReceivable)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<FilePlus className="w-3.5 h-3.5" />}>
            Generate Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};
