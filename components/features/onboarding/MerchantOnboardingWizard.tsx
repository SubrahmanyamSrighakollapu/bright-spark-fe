'use client';

import React, { useState } from 'react';
import { Card, Input, Select, Button, StatusBadge, MobileInput } from '@/components/ui';
import { KYCDocument, MerchantOnboardingInput } from '@/types/domain';
import { onboardingService } from '@/services/onboardingService';
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Building2, User, MapPin, FileCheck, Landmark } from 'lucide-react';
import Link from 'next/link';

export const MerchantOnboardingWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<MerchantOnboardingInput>({
    businessName: '',
    businessType: 'Private Limited',
    panNumber: '',
    gstNumber: '',
    businessCategory: 'Fintech / Retail',
    contactName: '',
    mobile: '',
    email: '',
    altMobile: '',
    addressLine1: '',
    addressLine2: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    distributorId: 'North Zone Dist',
    accountHolderName: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
  });

  const [confirmAccount, setConfirmAccount] = useState('');
  const [accountMismatchError, setAccountMismatchError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 4 && (!formData.documents || formData.documents.length < 3)) {
      setDocumentError('Upload PAN, business proof and cancelled cheque before continuing.');
      return;
    }
    if (step === 5) {
      if (formData.accountNumber !== confirmAccount) {
        setAccountMismatchError(true);
        return;
      }
      setAccountMismatchError(false);
    }
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleDocumentUpload = (type: KYCDocument['type'], file?: File) => {
    if (!file) return;
    const document: KYCDocument = {
      id: `doc_${type.toLowerCase()}_${file.lastModified}_${file.size}`,
      type,
      title: file.name,
      documentNumberMasked: type === 'PAN' ? formData.panNumber : 'Submitted for verification',
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []).filter((item) => item.type !== type), document],
    }));
    setDocumentError('');
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await onboardingService.createOnboardingApplication(formData);
      if (res.success && res.data) {
        setSubmittedAppId(res.data.id);
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedAppId) {
    return (
      <Card title="Onboarding Application Submitted" subtitle="Application queued for KYC & compliance review">
        <div className="space-y-6 py-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-emerald-950 text-sm block">Retailer Onboarding Application Created</span>
              <p className="text-emerald-800">
                Application reference <strong>{submittedAppId}</strong> for <strong>{formData.businessName}</strong> has been submitted.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-bold">{formData.businessName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Contact Person:</span>
              <span>{formData.contactName} ({formData.mobile})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Mapped Distributor:</span>
              <span className="font-semibold">{formData.distributorId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">KYC Status:</span>
              <StatusBadge status="PENDING" size="sm" />
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-200">
            <Link href="/admin/kyc/onboarding">
              <Button variant="outline" size="sm">
                Back to Onboarding Applications
              </Button>
            </Link>

            <Link href="/admin/kyc">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to KYC Applications Module
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const stepsList = [
    { num: 1, title: 'Business Info', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Contact Person', icon: <User className="w-4 h-4" /> },
    { num: 3, title: 'Business Address', icon: <MapPin className="w-4 h-4" /> },
    { num: 4, title: 'KYC Documents', icon: <FileCheck className="w-4 h-4" /> },
    { num: 5, title: 'Bank Details', icon: <Landmark className="w-4 h-4" /> },
    { num: 6, title: 'Review & Submit', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {stepsList.map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-lg border flex flex-col items-center text-center space-y-1 transition-colors ${
              step === s.num
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                : step > s.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span>{s.num}.</span>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
            <div className="text-[10px] sm:hidden font-semibold">{s.title}</div>
          </div>
        ))}
      </div>

      <Card
        title={`Step ${step} of 6: ${stepsList[step - 1].title}`}
        subtitle="Complete the retailer onboarding requirements"
      >
        <form onSubmit={handleNext} className="space-y-4 text-xs">
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Legal Business Name *"
                placeholder="e.g. Apex Commerce Solutions Pvt Ltd"
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Business Type *"
                  value={formData.businessType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
                  options={[
                    { value: 'Private Limited', label: 'Private Limited' },
                    { value: 'Public Limited', label: 'Public Limited' },
                    { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
                    { value: 'Partnership', label: 'Partnership' },
                    { value: 'LLP', label: 'LLP' },
                  ]}
                />

                <Select
                  label="Mapped Distributor *"
                  value={formData.distributorId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, distributorId: e.target.value }))}
                  options={[
                    { value: 'North Zone Dist', label: 'North Zone Dist' },
                    { value: 'West Coast Agency', label: 'West Coast Agency' },
                    { value: 'South Region Hub', label: 'South Region Hub' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="PAN Number *"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                  required
                />

                <Input
                  label="GST Number (Optional)"
                  placeholder="e.g. 07ABCDE1234F1Z5"
                  value={formData.gstNumber || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Primary Contact Person Name *"
                placeholder="Full name of authorized signatory"
                value={formData.contactName}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MobileInput
                  label="Mobile Number *"
                  value={formData.mobile}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }));
                  }}
                  required
                />

                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="retailer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <MobileInput
                label="Alternate Contact Mobile (Optional)"
                value={formData.altMobile || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData((prev) => ({ ...prev, altMobile: e.target.value }));
                }}
              />
            </div>
          )}

          {/* Step 3: Business Address */}
          {step === 3 && (
            <div className="space-y-4">
              <Input
                label="Registered Address Line 1 *"
                placeholder="Street address, building name"
                value={formData.addressLine1}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressLine1: e.target.value }))}
                required
              />

              <Input
                label="Address Line 2 (Optional)"
                placeholder="Locality / Landmark"
                value={formData.addressLine2 || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressLine2: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="City *"
                  placeholder="e.g. New Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  required
                />

                <Input
                  label="State *"
                  placeholder="e.g. Delhi"
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  required
                />

                <Input
                  label="Pincode *"
                  placeholder="6-digit PIN"
                  value={formData.pincode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: KYC Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                Upload clear PDF, JPG or PNG copies. These documents will be available to the KYC reviewer before approval.
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ['PAN', 'Business PAN Card *'],
                  ['BUSINESS_PROOF', 'Incorporation / Business Proof *'],
                  ['CANCELLED_CHEQUE', 'Cancelled Cheque / Passbook *'],
                  ['GST_CERTIFICATE', 'GST Certificate'],
                ].map(([type, label]) => {
                  const uploaded = formData.documents?.find((item) => item.type === type);
                  return (
                    <label key={type} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                      <span className="mb-2 block font-bold text-slate-800">{label}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        required={type !== 'GST_CERTIFICATE'}
                        onChange={(e) => handleDocumentUpload(type as KYCDocument['type'], e.target.files?.[0])}
                        className="block w-full text-[11px] file:mr-2 file:rounded-md file:border-0 file:bg-blue-100 file:px-2 file:py-1 file:font-bold file:text-blue-700"
                      />
                      {uploaded && <span className="mt-2 block truncate font-medium text-emerald-700">Uploaded: {uploaded.title}</span>}
                    </label>
                  );
                })}
              </div>
              {documentError && <p className="text-xs font-semibold text-rose-600">{documentError}</p>}
            </div>
          )}

          {/* Step 5: Bank Details */}
          {step === 5 && (
            <div className="space-y-4">
              <Input
                label="Account Holder Name *"
                placeholder="Name as printed on bank statement"
                value={formData.accountHolderName}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Bank Name *"
                  value={formData.bankName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                  options={[
                    { value: 'HDFC Bank', label: 'HDFC Bank' },
                    { value: 'ICICI Bank', label: 'ICICI Bank' },
                    { value: 'State Bank of India', label: 'State Bank of India' },
                    { value: 'Axis Bank', label: 'Axis Bank' },
                  ]}
                />

                <Input
                  label="IFSC Code *"
                  placeholder="e.g. HDFC0001234"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Bank Account Number *"
                  type="password"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  required
                />

                <Input
                  label="Confirm Account Number *"
                  placeholder="Re-enter account number"
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value)}
                  required
                />
              </div>

              {accountMismatchError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 font-semibold text-xs">
                  Account number confirmation does not match. Please recheck.
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Business Name:</span>
                  <span className="font-bold">{formData.businessName} ({formData.businessType})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Contact Person:</span>
                  <span className="font-semibold">{formData.contactName} ({formData.mobile})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">PAN / GST:</span>
                  <span className="font-mono">{formData.panNumber} / {formData.gstNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Mapped Distributor:</span>
                  <span className="font-semibold">{formData.distributorId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Settlement Bank:</span>
                  <span className="font-mono">{formData.bankName} (IFSC: {formData.ifscCode})</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>

            {step < 6 ? (
              <Button variant="primary" size="sm" type="submit" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Next Step
              </Button>
            ) : (
              <Button variant="primary" size="lg" type="button" onClick={handleFinalSubmit} isLoading={isSubmitting}>
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
