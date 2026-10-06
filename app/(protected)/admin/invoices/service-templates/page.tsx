'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ServiceInvoiceConfig, ServiceCode, InvoiceTemplateStyle } from '@/types/domain';
import { invoiceService } from '@/services/invoiceService';
import { ServiceInvoiceRenderer } from '@/components/features/invoices/ServiceInvoiceRenderer';
import { Edit3, FileText, CheckCircle2 } from 'lucide-react';

export default function ServiceInvoiceTemplatesPage() {
  const [configs, setConfigs] = useState<ServiceInvoiceConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ServiceInvoiceConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [form, setForm] = useState<Partial<ServiceInvoiceConfig>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    const res = await invoiceService.getServiceConfigs();
    if (res.success && res.data) {
      setConfigs(res.data);
      if (!selectedConfig && res.data.length > 0) {
        setSelectedConfig(res.data[0]!);
      }
    }
    setIsLoading(false);
  };

  const handleEditOpen = (cfg: ServiceInvoiceConfig) => {
    setSelectedConfig(cfg);
    setForm({ ...cfg });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceCode) return;
    setIsSaving(true);
    const res = await invoiceService.saveServiceConfig(form as Partial<ServiceInvoiceConfig> & { serviceCode: ServiceCode });
    if (res.success && res.data) {
      setSelectedConfig(res.data);
      await loadConfigs();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  // Sample dummy invoice for live preview of the service template
  const previewInvoice = selectedConfig
    ? {
        id: 'INV_20260903_PREVIEW',
        entityId: 'ent_mch_01',
        entityName: 'Apex Pay Solutions Pvt Ltd',
        entityCode: 'QSP-MCH-001',
        entityType: 'MERCHANT' as const,
        serviceCode: selectedConfig.serviceCode,
        serviceConfig: selectedConfig,
        gstin: selectedConfig.gstin,
        billingAddress: `${selectedConfig.address}, ${selectedConfig.city}, ${selectedConfig.state} ${selectedConfig.pincode}`,
        invoiceType: 'PLATFORM_FEE' as const,
        billingPeriod: 'September 2026',
        lineItems: [
          {
            id: 'li_prev_01',
            description: `${selectedConfig.serviceName} Merchant Fee & Tax Billing`,
            quantity: 1,
            rate: 15400,
            taxableAmount: 15400,
            gstRate: 18,
            gstAmount: 2772,
            totalAmount: 18172,
          },
        ],
        taxableAmount: 15400,
        gstRate: 18,
        gstAmount: 2772,
        cgstAmount: 1386,
        sgstAmount: 1386,
        igstAmount: 0,
        tdsApplicable: true,
        tdsRate: 10,
        tdsAmount: 1540,
        grossAmount: 18172,
        netReceivable: 16632,
        paidAmount: 0,
        outstandingAmount: 16632,
        status: 'ISSUED' as const,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        transactionIds: ['TXN_PREVIEW_001'],
        settlementIds: ['SET_PREVIEW_001'],
        ledgerEntryIds: ['LED_PREVIEW_001'],
        walletId: 'wlt_mch_001',
        payments: [],
        timeline: [],
        createdAt: new Date().toISOString(),
      }
    : null;

  return (
    <PageContainer
      title="Service Invoice Configurations & Templates"
      description="Configure dedicated invoice templates, brand styling, SAC tax codes, and bank details per platform service (Pay-In, Pay-Out, AEPS, BBPS, DMT, Recharge)."
    >
      <div className="space-y-6">
        {/* Service Selection Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          {configs.map((cfg) => {
            const isSelected = selectedConfig?.serviceCode === cfg.serviceCode;
            return (
              <button
                key={cfg.id}
                onClick={() => setSelectedConfig(cfg)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-2 border-slate-900 bg-white shadow-md ring-2 ring-slate-900/10 scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cfg.primaryColor }}
                  />
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                </div>
                <div className="font-bold text-xs text-slate-900 truncate">{cfg.serviceName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{cfg.serviceCode}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold uppercase text-slate-700">
                    SAC {cfg.sacCode}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {cfg.templateStyle.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Details & Controls */}
        {selectedConfig && (
          <div className="space-y-6">
            <Card
              title={`${selectedConfig.serviceName} Invoice Settings`}
              subtitle={`Configured template style: ${selectedConfig.templateName}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditOpen(selectedConfig)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Service Invoice Configuration
                </Button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Unit & Branding</span>
                  <p className="font-bold text-slate-900">{selectedConfig.businessName}</p>
                  <p className="text-slate-600 font-mono">GSTIN: {selectedConfig.gstin} | PAN: {selectedConfig.pan}</p>
                  <p className="text-slate-500">{selectedConfig.address}, {selectedConfig.city}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account & Remittance</span>
                  <p className="font-bold text-slate-900">{selectedConfig.beneficiaryName}</p>
                  <p className="text-slate-600 font-mono">{selectedConfig.bankName} - A/C: {selectedConfig.accountNumber}</p>
                  <p className="text-slate-500 font-mono">IFSC: {selectedConfig.ifscCode} ({selectedConfig.branchName})</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Taxation & SAC Mapping</span>
                  <p className="font-bold text-slate-900">SAC Code: <span className="font-mono text-purple-700">{selectedConfig.sacCode}</span></p>
                  <p className="text-slate-600">Template: <span className="font-semibold">{selectedConfig.templateStyle}</span></p>
                  <p className="text-slate-500">Contact: {selectedConfig.email} | {selectedConfig.mobile}</p>
                </div>
              </div>
            </Card>

            {/* Live Service Invoice Preview */}
            {previewInvoice && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary)]" />
                  <span>Live Template Preview for {selectedConfig.serviceName}</span>
                </h3>
                <ServiceInvoiceRenderer invoice={previewInvoice} serviceConfig={selectedConfig} />
              </div>
            )}
          </div>
        )}

        {/* Edit Configuration Modal */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={`Configure Invoice Details — ${form.serviceName || form.serviceCode}`}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Service Display Name"
                value={form.serviceName || ''}
                onChange={(e) => setForm((p) => ({ ...p, serviceName: e.target.value }))}
                required
              />

              <Select
                label="Template Layout Style"
                value={form.templateStyle || 'STANDARD_TAX'}
                onChange={(e) => setForm((p) => ({ ...p, templateStyle: e.target.value as InvoiceTemplateStyle }))}
                options={[
                  { value: 'STANDARD_TAX', label: 'Standard Platform Tax Layout' },
                  { value: 'ITEMIZED_SERVICE', label: 'Itemized Service Fee Layout' },
                  { value: 'PAYOUT_DISBURSAL', label: 'Pay-Out Disbursal Layout' },
                  { value: 'BANKING_CORRESPONDENT', label: 'Aadhaar Banking (AEPS) Layout' },
                  { value: 'UTILITY_BILL_RECEIPT', label: 'Utility Bill Pay Layout' },
                  { value: 'REMITTANCE_COMMISSION', label: 'Domestic Remittance (DMT) Layout' },
                  { value: 'COMPACT_RECEIPT', label: 'Compact Instant Receipt' },
                ]}
              />

              <Input
                label="Business Unit Name"
                value={form.businessName || ''}
                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                required
              />

              <Input
                label="Legal Registered Name"
                value={form.legalName || ''}
                onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
                required
              />

              <Input
                label="GSTIN"
                value={form.gstin || ''}
                onChange={(e) => setForm((p) => ({ ...p, gstin: e.target.value }))}
                required
              />

              <Input
                label="PAN Number"
                value={form.pan || ''}
                onChange={(e) => setForm((p) => ({ ...p, pan: e.target.value }))}
                required
              />

              <Input
                label="SAC / HSN Code"
                value={form.sacCode || ''}
                onChange={(e) => setForm((p) => ({ ...p, sacCode: e.target.value }))}
                required
              />

              <Input
                label="Brand Accent Color (Hex)"
                type="color"
                value={form.primaryColor || '#0f172a'}
                onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                className="h-10 cursor-pointer"
              />

              <Input
                label="Beneficiary Account Name"
                value={form.beneficiaryName || ''}
                onChange={(e) => setForm((p) => ({ ...p, beneficiaryName: e.target.value }))}
                required
              />

              <Input
                label="Bank Name"
                value={form.bankName || ''}
                onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                required
              />

              <Input
                label="Account Number"
                value={form.accountNumber || ''}
                onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                required
              />

              <Input
                label="IFSC Code"
                value={form.ifscCode || ''}
                onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))}
                required
              />

              <Input
                label="Branch Name"
                value={form.branchName || ''}
                onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))}
                required
              />

              <Input
                label="Support Email"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />

              <Input
                label="Support Mobile"
                value={form.mobile || ''}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                required
              />

              <Input
                label="City & State"
                value={`${form.city || ''}, ${form.state || ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setForm((p) => ({ ...p, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' }));
                }}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Business Address</label>
              <textarea
                rows={2}
                value={form.address || ''}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-sans text-xs focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Terms & Conditions</label>
              <textarea
                rows={3}
                value={form.termsAndConditions || ''}
                onChange={(e) => setForm((p) => ({ ...p, termsAndConditions: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                Save Service Invoice Configuration
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageContainer>
  );
}
