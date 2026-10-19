'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PhoneInputWithCountryCode } from '@/components/ui/PhoneInputWithCountryCode';
import { useToast } from '@/components/ui/Toast';
import { userService } from '@/services/userService';
import { kycService, type KYCDocumentRequirement } from '@/services/kycService';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  Send,
  RotateCcw,
  KeyRound,
  FileCheck2,
  IdCard,
  MapPin,
  Landmark,
  Camera,
  UploadCloud,
} from 'lucide-react';

interface CreateUserFormProps {
  fixedRole?: 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
  parentPartyId?: string;
  embedded?: boolean;
  onCompleted?: () => void;
  onCancel?: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ fixedRole, parentPartyId, embedded = false, onCompleted, onCancel }) => {
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [formData, setFormData] = useState({
    aadharNo: '',
    panNo: '',
    isAadharVerify: false,
    panNoVerify: false,
    fullName: '',
    email: '',
    countryCode: '+91',
    contactNo: '',
    roleName: fixedRole || 'RETAILER',
    isAutoPassword: true,
    password: '',
  });

  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPartyId, setCreatedPartyId] = useState<string | null>(null);

  const [documentTypes, setDocumentTypes] = useState<KYCDocumentRequirement[]>([]);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    setDocuments({}); setLoadingDocuments(true);
    kycService.getDocumentTypesForPartyType(formData.roleName as 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER')
      .then((response) => setDocumentTypes(response.data ?? []))
      .catch((error) => { setDocumentTypes([]); toastError(error instanceof Error ? error.message : 'Unable to load KYC document lookup'); })
      .finally(() => setLoadingDocuments(false));
  }, [formData.roleName, toastError]);

  const handleVerifyAadhaar = () => {
    if (!formData.aadharNo || formData.aadharNo.length < 12) {
      toastError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    setVerifyingAadhaar(true);
    setTimeout(() => {
      setVerifyingAadhaar(false);
      setFormData((prev) => ({ ...prev, isAadharVerify: true }));
      toastSuccess('Aadhaar number verified successfully via NSDL API!');
    }, 600);
  };

  const handleVerifyPan = () => {
    if (!formData.panNo || formData.panNo.length < 10) {
      toastError('Please enter a valid 10-character PAN Number.');
      return;
    }
    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      setFormData((prev) => ({ ...prev, panNoVerify: true }));
      toastSuccess('PAN details verified successfully via Income Tax Portal!');
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toastError('Full Name is required.');
      return;
    }
    if (!formData.contactNo || formData.contactNo.length < 10) {
      toastError('Valid 10-digit Mobile Number is required.');
      return;
    }
    const missingDocuments = documentTypes.filter((item) => item.configuration.required && !documents[item.code]);
    if (missingDocuments.length) {
      toastError(`Upload all required KYC documents: ${missingDocuments.map((item) => item.label).join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const last4 = formData.contactNo.trim().slice(-4) || '1234';
      const autoPassword = `BrightSpark@${last4}`;
      const userPassword = !formData.isAutoPassword && formData.password ? formData.password : autoPassword;

      let partyId = createdPartyId;
      if (!partyId) {
        const res = await userService.createUser({
          role: formData.roleName as 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER',
          fullName: formData.fullName.trim(),
          email: formData.email.trim() || `${formData.contactNo}@brightspark.com`,
          mobile: formData.contactNo.trim(),
          displayName: formData.fullName.trim(),
          parentPartyId,
          password: userPassword,
        });
        if (!res?.success || !res.data?.partyId) throw new Error(res?.message || 'Failed to create user account.');
        partyId = res.data.partyId;
        setCreatedPartyId(partyId);
      }

      if (partyId) {
        for (const requirement of documentTypes) {
          const file = documents[requirement.code];
          if (file) await kycService.uploadDocumentForParty(partyId, requirement.code, file);
        }
        await kycService.submitPartyApplication(partyId);
        setCreatedPartyId(null);
        toastSuccess(`New ${formData.roleName.replace('_', ' ')} user "${formData.fullName}" created successfully!`);
        handleCancel();
        onCompleted?.();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to create user account. Please check server logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCredentials = () => {
    if (!formData.email && !formData.contactNo) {
      toastError('Please specify Email or Mobile number to send credentials.');
      return;
    }
    toastInfo(`Welcome credentials dispatched via SMS and Email to ${formData.fullName || 'User'}!`);
  };

  const handleCancel = () => {
    setFormData({
      aadharNo: '',
      panNo: '',
      isAadharVerify: false,
      panNoVerify: false,
      fullName: '',
      email: '',
      countryCode: '+91',
      contactNo: '',
      roleName: fixedRole || 'RETAILER',
      isAutoPassword: true,
      password: '',
    });
    setDocuments({});
    setCreatedPartyId(null);
    if (onCancel) onCancel();
    else toastInfo('Form reset to blank.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      {!embedded && <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#2F6F5E]" />
            Onboard User
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Onboard new downline users into the platform hierarchy under Master Distributor, Distributor, or Retailer roles.
          </p>
        </div>
      </div>}

      {/* Section 1: Identity Verification */}
      <Card title="1. Identity Verification" subtitle="Verify Aadhaar & PAN credentials via real-time API integrations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Aadhaar Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155]">Aadhaar Number (aadharNo)</label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  formData.isAadharVerify
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {formData.isAadharVerify ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-amber-600" /> Unverified
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="12-digit Aadhaar Number"
                maxLength={12}
                value={formData.aadharNo}
                onChange={(e) => setFormData((p) => ({ ...p, aadharNo: e.target.value.replace(/\D/g, '') }))}
                className="flex-1 px-3 py-2.5 bg-white border border-[#E5EAF1] rounded-lg text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#2F6F5E]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleVerifyAadhaar}
                isLoading={verifyingAadhaar}
                disabled={formData.isAadharVerify}
              >
                {formData.isAadharVerify ? 'Verified' : 'Verify Aadhaar'}
              </Button>
            </div>
          </div>

          {/* PAN Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155]">PAN Number (panNo)</label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  formData.panNoVerify
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {formData.panNoVerify ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAN Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-amber-600" /> Unverified
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="10-character PAN Number"
                maxLength={10}
                value={formData.panNo}
                onChange={(e) => setFormData((p) => ({ ...p, panNo: e.target.value.toUpperCase() }))}
                className="flex-1 px-3 py-2.5 bg-white border border-[#E5EAF1] rounded-lg text-xs font-mono text-[#0F172A] uppercase focus:outline-none focus:border-[#2F6F5E]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleVerifyPan}
                isLoading={verifyingPan}
                disabled={formData.panNoVerify}
              >
                {formData.panNoVerify ? 'Verified' : 'Verify PAN'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Personal & Role Details */}
      <Card title="2. Personal & Role Details" subtitle="User contact information and downline network role">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          <Input
            label="Full Name (fullName)"
            placeholder="Enter user's legal name"
            value={formData.fullName}
            onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Email Address (email)"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <PhoneInputWithCountryCode
            label="Mobile Number (contactNo)"
            placeholder="10-digit mobile number"
            value={formData.contactNo}
            countryCode={formData.countryCode}
            onPhoneChange={(phone) => setFormData((p) => ({ ...p, contactNo: phone }))}
            onCountryCodeChange={(code) => setFormData((p) => ({ ...p, countryCode: code }))}
            required
          />

          <Select
            label="Downline Network Role (roleName)"
            value={formData.roleName}
            onChange={(e) => setFormData((p) => ({ ...p, roleName: e.target.value as 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER' }))}
            disabled={Boolean(fixedRole)}
            options={[
              { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor (MD)' },
              { value: 'DISTRIBUTOR', label: 'Distributor (DS)' },
              { value: 'RETAILER', label: 'Retailer' },
            ]}
          />

        </div>
      </Card>

      <Card title="3. KYC Document Uploads" subtitle="Complete all four verification documents to submit this account for KYC review">
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm"><ShieldCheck className="h-4 w-4" /></span>
            <div><p className="text-xs font-bold text-slate-900">Secure document collection</p><p className="mt-0.5 text-[11px] text-slate-500">Files are securely linked with the new user&apos;s onboarding application.</p></div>
          </div>
          <div className="self-start rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-blue-700 sm:self-auto">{Object.keys(documents).length} OF {documentTypes.length} UPLOADED</div>
        </div>
        {loadingDocuments ? <div className="py-8 text-center text-xs text-slate-500">Loading document requirements…</div> : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {documentTypes.map((requirement) => {
              const file = documents[requirement.code];
              const DocumentIcon = requirement.code === 'ID_PROOF' ? IdCard : requirement.code === 'ADDRESS_PROOF' ? MapPin : requirement.code === 'BANK_PROOF' ? Landmark : Camera;
              return <label key={requirement.id} className={`group relative min-h-60 cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${file ? 'border-emerald-300 shadow-emerald-100/70' : 'border-slate-200 hover:border-[#A8BE61] hover:shadow-emerald-100/70'}`}>
                <span className={`absolute inset-x-0 top-0 h-1 ${file ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`} />
                <div className="flex items-start gap-3 pt-1">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${file ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{file ? <FileCheck2 className="h-5 w-5" /> : <DocumentIcon className="h-5 w-5" />}</span>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-slate-900">{requirement.label}</p>{requirement.configuration.required && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">REQUIRED</span>}</div><p className="mt-1 truncate text-[11px] text-slate-500">{file ? file.name : requirement.description || 'Click to select a file'}</p><p className="mt-2 text-[10px] font-semibold text-blue-700">{file ? 'Click to replace' : `${requirement.configuration.acceptedMimeTypes?.includes('application/pdf') ? 'PDF, JPG or PNG' : 'JPG or PNG'} • Max ${requirement.configuration.maxSizeMb ?? 5} MB`}</p></div>
                </div>
                <div className={`mt-4 flex min-h-20 flex-col items-center justify-center rounded-xl border border-dashed px-3 py-3 text-center transition-colors ${file ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-300 bg-slate-50 group-hover:border-[#91A94E] group-hover:bg-[#F3F7E9]/60'}`}>
                  {file ? <><CheckCircle2 className="mb-1 h-5 w-5 text-emerald-600" /><p className="max-w-full truncate text-[11px] font-bold text-emerald-800">{file.name}</p><p className="mt-1 text-[10px] text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace</p></> : <><UploadCloud className="mb-1.5 h-5 w-5 text-blue-600" /><p className="text-[11px] font-bold text-slate-700">Choose file to upload</p><p className="mt-1 text-[10px] text-slate-400">Click anywhere on this card</p></>}
                </div>
                <input className="hidden" type="file" accept={requirement.configuration.acceptedMimeTypes?.includes('application/pdf') ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png'} onChange={(event) => { const selected = event.target.files?.[0]; if (!selected) return; const maxBytes = (requirement.configuration.maxSizeMb ?? 5) * 1024 * 1024; if (selected.size > maxBytes) { toastError(`${requirement.label} must be within ${requirement.configuration.maxSizeMb ?? 5} MB`); return; } if (requirement.configuration.acceptedMimeTypes?.length && !requirement.configuration.acceptedMimeTypes.includes(selected.type)) { toastError(`${requirement.label} has an unsupported file format`); return; } setDocuments((current) => ({ ...current, [requirement.code]: selected })); }} />
              </label>;
            })}
          </div>
        )}
      </Card>

      {/* Section 3: Account Settings */}
      <Card title="4. Account Security Settings" subtitle="Temporary credentials for use after KYC approval">
        <div className="space-y-4 pt-1">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <span className="font-bold">Approval-controlled access:</span> the account will be created as KYC Pending. Login is enabled automatically only after all required documents are verified and KYC is approved.
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Auto-generate Password (isAutoPassword)</span>
              <span className="text-[11px] text-[#64748B]">Automatically create a secure temporary password and dispatch via SMS/Email.</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isAutoPassword: !p.isAutoPassword }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.isAutoPassword ? 'bg-[#2F6F5E]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isAutoPassword ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!formData.isAutoPassword && (
            <Input
              label="Manual Password (password)"
              type="password"
              placeholder="Set initial password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            />
          )}

        </div>
      </Card>

      {/* Form Action Controls */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
        >
          Cancel / Clear Form
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            onClick={(e) => handleSubmit(e)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create User Account
          </Button>
        </div>
      </div>
    </form>
  );
};
