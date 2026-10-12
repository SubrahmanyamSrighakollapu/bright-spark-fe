'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PhoneInputWithCountryCode } from '@/components/ui/PhoneInputWithCountryCode';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { hierarchyService } from '@/services/hierarchyService';
import { userService } from '@/services/userService';
import { UserPlus, Building, Phone, Mail, UserCheck } from 'lucide-react';
import { KYCDocument } from '@/types/domain';

export type MemberType = 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER' | 'BACKOFFICE';

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: MemberType;
  onSuccess?: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'DISTRIBUTOR',
  onSuccess,
}) => {
  const { toastSuccess, toastError } = useToast();
  const [memberType, setMemberType] = useState<MemberType>(defaultType);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('Apex National Network');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycFiles, setKycFiles] = useState<Record<string, File | null>>({
    AADHAAR: null,
    PAN: null,
    GST_CERTIFICATE: null,
    CANCELLED_CHEQUE: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      toastError('Full Name and Mobile number are required.');
      return;
    }

    const requiredDocuments = ['AADHAAR', 'PAN', 'CANCELLED_CHEQUE'];
    if (memberType !== 'BACKOFFICE' && requiredDocuments.some((type) => !kycFiles[type])) {
      toastError('Please upload all required KYC documents (Aadhaar, PAN, Cancelled Cheque).');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiRes = await userService.createUser({
        role: (memberType === 'BACKOFFICE' ? 'RETAILER' : memberType) as any,
        fullName: name.trim(),
        displayName: businessName.trim() || name.trim(),
        email: email.trim() || `${mobile.trim()}@qinstarpay.com`,
        mobile: mobile.trim(),
      });

      if (apiRes && apiRes.success) {
        toastSuccess(`New ${memberType.replace('_', ' ')} "${name}" onboarded successfully!`);
        if (onSuccess) onSuccess();
        onClose();
        setName('');
        setBusinessName('');
        setMobile('');
        setEmail('');
        setKycFiles({ AADHAAR: null, PAN: null, GST_CERTIFICATE: null, CANCELLED_CHEQUE: null });
      } else {
        toastError(apiRes?.message || 'Failed to onboard user.');
      }
    } catch (err: any) {
      console.error('Failed to create user:', err);
      toastError(err?.message || 'Failed to onboard user. Please check backend logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <UserPlus className="w-5 h-5 text-[var(--primary)]" />
          <span>Add User</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <Select
          label="User Role"
          required
          value={memberType}
          onChange={(e) => setMemberType(e.target.value as MemberType)}
          options={[
            { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor' },
            { value: 'DISTRIBUTOR', label: 'Distributor' },
            { value: 'RETAILER', label: 'Retailer' },
            { value: 'BACKOFFICE', label: 'Back Office User' },
          ]}
        />

        <Input
          label="Full Name"
          placeholder="e.g. Subrahmanyam S"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
        />

        {memberType !== 'BACKOFFICE' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">KYC document uploads</p>
              <p className="mt-1 text-[11px] text-slate-500">Aadhaar, PAN and bank proof are required before onboarding.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['AADHAAR', 'Aadhaar Card *'],
                ['PAN', 'PAN Card *'],
                ['GST_CERTIFICATE', 'GST Certificate'],
                ['CANCELLED_CHEQUE', 'Cancelled Cheque / Passbook *'],
              ].map(([type, label]) => (
                <label key={type} className="flex cursor-pointer flex-col gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="block">{label}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    required={type !== 'GST_CERTIFICATE'}
                    onChange={(e) => setKycFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] || null }))}
                    className="block min-h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1.5 file:font-bold file:text-blue-700 hover:border-slate-300"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Business / Firm Name"
          placeholder="e.g. Apex Digital Point"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          leftIcon={<Building className="w-4 h-4 text-slate-400" />}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PhoneInputWithCountryCode
            label="Mobile Number"
            placeholder="10-digit mobile number"
            value={mobile}
            countryCode={countryCode}
            onPhoneChange={setMobile}
            onCountryCodeChange={setCountryCode}
            required
          />

          <Input
            label="Email Address"
            placeholder="member@qinstar.in"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Input
          label="Mapped Parent Entity / Region"
          placeholder="e.g. Direct Admin / Apex Network"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
        />

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm & Onboard Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
